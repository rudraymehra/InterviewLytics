import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import {
  getApplicationById,
  getJobById,
  updateApplication,
  updateApplicationUnlessTerminal,
  Application,
  Job,
} from '@/lib/jobStore'
import {
  getInterviewSessionWithQuestions,
  getSessionByApplicationAndRound,
  completeInterviewSession,
  InterviewSession,
} from '@/lib/interviewStore'
import { generateRoundFeedback, generateFinalReport } from '@/lib/aiService'
import {
  clampScore,
  gradeFromScore,
  getScoreWeights,
  getRound1PassThreshold,
} from '@/lib/ai/types'
import type { FeedbackPoint } from '@/lib/ai/types'
import { findUserById } from '@/lib/userStore'
import { sendStatusEmail, NotificationKind } from '@/lib/notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function jobInputOf(job: Job) {
  return {
    title: job.title,
    company: job.company,
    description: job.description,
    requirements: job.requirements,
  }
}

interface RoundResult {
  score: number
  grade: string
  feedback: string
  strengths: FeedbackPoint[]
  weaknesses: FeedbackPoint[]
}

/** Compute the round-2 application updates (final score + AI final report). */
async function buildRound2Updates(
  application: Application,
  job: Job,
  round2: RoundResult
): Promise<Partial<Application>> {
  const weights = getScoreWeights()
  const match = application.match_percentage ?? 50
  const round1Score = application.round1_score ?? 0
  const finalScore = clampScore(
    Math.round(
      (match * weights.resume) / 100 +
        (round1Score * weights.round1) / 100 +
        (round2.score * weights.round2) / 100
    )
  )

  const round1Session = await getSessionByApplicationAndRound(application.id, 1)
  const report = await generateFinalReport({
    job: jobInputOf(job),
    matchPercentage: application.match_percentage ?? null,
    round1: {
      score: round1Score,
      feedback: round1Session?.overall_feedback ?? '',
      strengths: round1Session?.strengths ?? [],
      weaknesses: round1Session?.weaknesses ?? [],
    },
    round2: {
      score: round2.score,
      feedback: round2.feedback,
      strengths: round2.strengths,
      weaknesses: round2.weaknesses,
    },
    weights,
    finalScore,
  })

  return {
    round2_score: round2.score,
    round2_grade: round2.grade,
    final_score: finalScore,
    final_grade: gradeFromScore(finalScore),
    final_report: report,
    status: 'round2_completed',
  }
}

/**
 * Persist interview results onto the application. The status-bearing update is
 * conditional (compare-and-set): if the recruiter has already made a terminal
 * decision (rejected/hired/shortlisted), scores/grades/report are persisted
 * WITHOUT the status field so the decision is never overwritten.
 * Retries once on failure (the session is already marked completed at this
 * point, so losing this write would strand the candidate).
 */
async function persistApplicationResults(
  applicationId: string,
  updates: Partial<Application>
): Promise<{ application: Application; terminal: boolean }> {
  const { status: _status, ...scoresOnly } = updates
  void _status

  const attempt = async () => {
    const advancedRow = await updateApplicationUnlessTerminal(applicationId, updates)
    if (advancedRow) return { application: advancedRow, terminal: false }
    // Row is in a terminal recruiter status — keep it, persist results only.
    const scoresRow = await updateApplication(applicationId, scoresOnly)
    return { application: scoresRow, terminal: true }
  }

  try {
    return await attempt()
  } catch (firstError) {
    console.error(
      '[interview/complete] application update failed after session completion — retrying once:',
      firstError
    )
    return await attempt()
  }
}

/** Build the round-appropriate application updates from a completed session. */
async function buildUpdatesFromSession(
  session: InterviewSession,
  application: Application,
  job: Job,
  advanced: boolean
): Promise<Partial<Application>> {
  const score = clampScore(session.overall_score ?? 0)
  if (session.round === 1) {
    return {
      round1_score: score,
      round1_grade: session.overall_grade ?? gradeFromScore(score),
      status: advanced ? 'round2_available' : 'round1_completed',
    }
  }
  return buildRound2Updates(application, job, {
    score,
    grade: session.overall_grade ?? gradeFromScore(score),
    feedback: session.overall_feedback ?? '',
    strengths: session.strengths ?? [],
    weaknesses: session.weaknesses ?? [],
  })
}

/**
 * POST /api/interview/complete — finish a round: generate round feedback,
 * score the session, and advance the application through the pipeline.
 * Body: { session_id }.
 */
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request, 'candidate')

    const body = await request.json()
    const sessionId = body?.session_id
    if (typeof sessionId !== 'string' || sessionId.length === 0) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    const detail = await getInterviewSessionWithQuestions(sessionId)
    if (!detail) {
      return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
    }
    const { session, questions } = detail

    if (session.candidate_id !== user.id) {
      return NextResponse.json({ error: 'You do not own this interview session' }, { status: 403 })
    }

    const application = await getApplicationById(session.application_id)
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    const job = await getJobById(session.job_id)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const threshold = session.round === 1 ? getRound1PassThreshold(job.round1_pass_threshold) : 0

    // Idempotent: if already completed, return the completed payload. Also
    // repairs a lagging application (session completed but the application
    // update was lost, e.g. crash/timeout between the two writes).
    if (session.status === 'completed') {
      let advanced = session.round === 1 ? (session.overall_score ?? 0) >= threshold : false
      let currentApplication = application

      const lagging =
        session.round === 1
          ? application.round1_score == null || application.status === 'round1_in_progress'
          : application.round2_score == null || application.status === 'round2_in_progress'

      if (lagging) {
        try {
          const updates = await buildUpdatesFromSession(session, application, job, advanced)
          const persisted = await persistApplicationResults(application.id, updates)
          currentApplication = persisted.application
          if (persisted.terminal) advanced = false
        } catch (repairError) {
          console.error('[interview/complete] defensive repair failed:', repairError)
        }
      }

      return NextResponse.json({
        data: { session, application: currentApplication, advanced, passThreshold: threshold },
      })
    }

    const answered = questions.filter((q) => q.candidate_answer != null)
    if (answered.length === 0) {
      return NextResponse.json(
        { error: 'Answer at least one question before completing the interview' },
        { status: 400 }
      )
    }

    const feedback = await generateRoundFeedback(
      session.round,
      jobInputOf(job),
      answered.map((q) => ({
        question: q.question_text,
        answer: q.candidate_answer as string,
        score: q.answer_score ?? null,
        questionType: q.question_type,
      }))
    )

    const roundScore = clampScore(feedback.score)
    const completedSession = await completeInterviewSession(sessionId, {
      overall_score: roundScore,
      overall_grade: feedback.grade,
      overall_feedback: feedback.feedback,
      strengths: feedback.strengths,
      weaknesses: feedback.weaknesses,
    })

    let advanced = false
    let notifyKind: NotificationKind
    let updates: Partial<Application>

    if (session.round === 1) {
      advanced = roundScore >= threshold
      updates = {
        round1_score: roundScore,
        round1_grade: feedback.grade,
        status: advanced ? 'round2_available' : 'round1_completed',
      }
      notifyKind = advanced ? 'round1_passed' : 'round1_completed'
    } else {
      updates = await buildRound2Updates(application, job, {
        score: roundScore,
        grade: feedback.grade,
        feedback: feedback.feedback,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
      })
      advanced = false
      notifyKind = 'interviews_completed'
    }

    let persisted
    try {
      persisted = await persistApplicationResults(application.id, updates)
    } catch (persistError) {
      // Session is completed but the application row could not be updated.
      // Re-POSTing complete hits the idempotent branch above, which repairs it.
      console.error(
        '[interview/complete] CRITICAL: session completed but application update failed twice:',
        persistError
      )
      return NextResponse.json(
        {
          error: 'Interview completed but results could not be saved — please retry',
          data: { session: completedSession },
        },
        { status: 500 }
      )
    }

    if (persisted.terminal) {
      // Recruiter already made a terminal decision — results were stored, the
      // decision stands, and no pipeline email is sent.
      advanced = false
    } else {
      try {
        const candidate = await findUserById(user.id)
        await sendStatusEmail({
          to: user.email,
          candidateName: candidate?.name || user.email,
          jobTitle: job.title,
          company: job.company,
          kind: notifyKind,
        })
      } catch (emailError) {
        console.warn('[interview/complete] failed to send status email:', emailError)
      }
    }

    return NextResponse.json({
      data: {
        session: completedSession,
        application: persisted.application,
        advanced,
        passThreshold: threshold,
      },
    })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error completing interview:', error)
    return NextResponse.json({ error: 'Failed to complete interview' }, { status: 500 })
  }
}
