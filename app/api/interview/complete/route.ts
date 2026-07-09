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
  completeInterviewSession,
  InterviewSession,
} from '@/lib/interviewStore'
import { generateRoundFeedback, generateFinalReport } from '@/lib/aiService'
import { clampScore, gradeFromScore, getRound1PassThreshold } from '@/lib/ai/types'
import type { FeedbackPoint } from '@/lib/ai/types'
import { jobInputOf, computeFinalScore, buildFinalReportInput } from '@/lib/reportService'
import { findUserById } from '@/lib/userStore'
import { sendStatusEmail, NotificationKind } from '@/lib/notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface RoundResult {
  score: number
  grade: string
  feedback: string
  strengths: FeedbackPoint[]
  weaknesses: FeedbackPoint[]
}

/**
 * Round-2 score/grade/final-score updates. The AI final report is NOT part of
 * these: it is generated separately AFTER scores are persisted, so a
 * serverless timeout during report generation can never lose the scores
 * (final_report stays null and lib/reportService.ensureFinalReport fills it
 * in lazily on first view of the application detail).
 */
function buildRound2ScoreUpdates(
  application: Application,
  round2: RoundResult
): Partial<Application> {
  const finalScore = computeFinalScore(application, round2.score)
  return {
    round2_score: round2.score,
    round2_grade: round2.grade,
    final_score: finalScore,
    final_grade: gradeFromScore(finalScore),
    status: 'round2_completed',
  }
}

/**
 * Best-effort second heavy AI call: generate the final report and persist it
 * with its own update. Never throws — on failure the report is generated
 * lazily on first view (ensureFinalReport).
 */
async function tryGenerateFinalReport(
  application: Application,
  job: Job,
  round2: RoundResult,
  finalScore: number
): Promise<Application | null> {
  try {
    const input = await buildFinalReportInput(
      application,
      job,
      {
        score: round2.score,
        feedback: round2.feedback,
        strengths: round2.strengths,
        weaknesses: round2.weaknesses,
      },
      finalScore
    )
    const report = await generateFinalReport(input)
    return await updateApplication(application.id, { final_report: report })
  } catch (reportError) {
    console.warn(
      '[interview/complete] final report generation failed — it will be generated lazily on first view:',
      reportError
    )
    return null
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
function buildUpdatesFromSession(
  session: InterviewSession,
  application: Application,
  advanced: boolean
): Partial<Application> {
  const score = clampScore(session.overall_score ?? 0)
  if (session.round === 1) {
    return {
      round1_score: score,
      round1_grade: session.overall_grade ?? gradeFromScore(score),
      status: advanced ? 'round2_available' : 'round1_completed',
    }
  }
  return buildRound2ScoreUpdates(application, {
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
          const updates = buildUpdatesFromSession(session, application, advanced)
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

    // Warm-ups (question_number 0) are small talk — they never reach the scorer,
    // and answering only warm-ups does not count as having interviewed.
    const answered = questions.filter(
      (q) => q.candidate_answer != null && q.question_number !== 0
    )
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
    let round2Result: RoundResult | null = null

    if (session.round === 1) {
      advanced = roundScore >= threshold
      updates = {
        round1_score: roundScore,
        round1_grade: feedback.grade,
        status: advanced ? 'round2_available' : 'round1_completed',
      }
      notifyKind = advanced ? 'round1_passed' : 'round1_completed'
    } else {
      // Persist scores/status IMMEDIATELY (final_report left null) — the
      // second heavy AI call happens after this write is safely committed.
      round2Result = {
        score: roundScore,
        grade: feedback.grade,
        feedback: feedback.feedback,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
      }
      updates = buildRound2ScoreUpdates(application, round2Result)
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

    // Round 2: scores/status are committed above — only now attempt the
    // second heavy AI call. If it fails (or the platform kills the function
    // mid-call), the response/report self-heals: re-POSTing complete hits the
    // idempotent branch, and ensureFinalReport generates the missing report
    // on first view of the application detail.
    if (round2Result) {
      const withReport = await tryGenerateFinalReport(
        application,
        job,
        round2Result,
        persisted.application.final_score ?? computeFinalScore(application, round2Result.score)
      )
      if (withReport) persisted.application = withReport
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
