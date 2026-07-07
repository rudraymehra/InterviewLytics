import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getApplicationById, getJobById, updateApplication, Job } from '@/lib/jobStore'
import {
  getInterviewSessionWithQuestions,
  getSessionByApplicationAndRound,
  completeInterviewSession,
} from '@/lib/interviewStore'
import { generateRoundFeedback, generateFinalReport } from '@/lib/aiService'
import {
  clampScore,
  gradeFromScore,
  getScoreWeights,
  getRound1PassThreshold,
} from '@/lib/ai/types'
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

    // Idempotent: if already completed, return the completed payload.
    if (session.status === 'completed') {
      const advanced =
        session.round === 1 ? (session.overall_score ?? 0) >= threshold : false
      return NextResponse.json({
        data: { session, application, advanced, passThreshold: threshold },
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

    let updatedApplication
    let advanced = false
    let notifyKind: NotificationKind

    if (session.round === 1) {
      advanced = roundScore >= threshold
      updatedApplication = await updateApplication(application.id, {
        round1_score: roundScore,
        round1_grade: feedback.grade,
        status: advanced ? 'round2_available' : 'round1_completed',
      })
      notifyKind = advanced ? 'round1_passed' : 'round1_completed'
    } else {
      const weights = getScoreWeights()
      const match = application.match_percentage ?? 50
      const round1Score = application.round1_score ?? 0
      const finalScore = clampScore(
        Math.round(
          (match * weights.resume) / 100 +
            (round1Score * weights.round1) / 100 +
            (roundScore * weights.round2) / 100
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
          score: roundScore,
          feedback: feedback.feedback,
          strengths: feedback.strengths,
          weaknesses: feedback.weaknesses,
        },
        weights,
        finalScore,
      })

      updatedApplication = await updateApplication(application.id, {
        round2_score: roundScore,
        round2_grade: feedback.grade,
        final_score: finalScore,
        final_grade: gradeFromScore(finalScore),
        final_report: report,
        status: 'round2_completed',
      })
      advanced = false
      notifyKind = 'interviews_completed'
    }

    void (async () => {
      const candidate = await findUserById(user.id)
      await sendStatusEmail({
        to: user.email,
        candidateName: candidate?.name || user.email,
        jobTitle: job.title,
        company: job.company,
        kind: notifyKind,
      })
    })().catch(() => {})

    return NextResponse.json({
      data: {
        session: completedSession,
        application: updatedApplication,
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
