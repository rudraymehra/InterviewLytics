import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import {
  getApplicationById,
  getJobById,
  downloadResume,
  updateApplicationUnlessTerminal,
  TERMINAL_APPLICATION_STATUSES,
} from '@/lib/jobStore'
import {
  createInterviewSession,
  addInterviewQuestions,
  getSessionByApplicationAndRound,
  getInterviewSessionWithQuestions,
  InterviewQuestion,
} from '@/lib/interviewStore'
import { generateRound1Questions, generateRound2Questions } from '@/lib/aiService'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Candidates must not see scores mid-interview; scores stay in the DB. */
function stripEvaluation(q: InterviewQuestion): InterviewQuestion {
  const { answer_score, answer_feedback, answer_evaluation, ...rest } = q
  void answer_score
  void answer_feedback
  void answer_evaluation
  return rest as InterviewQuestion
}

/**
 * POST /api/interview/start — start (or resume) an interview round.
 * Body: { application_id, round }.
 */
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request, 'candidate')

    const body = await request.json()
    const applicationId = body?.application_id
    const round = body?.round

    if (typeof applicationId !== 'string' || applicationId.length === 0) {
      return NextResponse.json({ error: 'application_id is required' }, { status: 400 })
    }
    if (round !== 1 && round !== 2) {
      return NextResponse.json({ error: 'round must be 1 or 2' }, { status: 400 })
    }

    const application = await getApplicationById(applicationId)
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    if (application.candidate_id !== user.id) {
      return NextResponse.json({ error: 'You do not own this application' }, { status: 403 })
    }

    const job = await getJobById(application.job_id)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Terminal recruiter decisions close the interview pipeline entirely —
    // this guards BOTH the resume path and fresh starts.
    if (TERMINAL_APPLICATION_STATUSES.includes(application.status)) {
      return NextResponse.json(
        {
          error: `This application has been finalized by the recruiter (status "${application.status}") — interviews are closed`,
        },
        { status: 409 }
      )
    }

    // Resume an existing session for this round if there is one.
    const existingSession = await getSessionByApplicationAndRound(applicationId, round)
    if (existingSession) {
      if (existingSession.status === 'completed') {
        return NextResponse.json(
          { error: `Round ${round} has already been completed` },
          { status: 409 }
        )
      }
      const detail = await getInterviewSessionWithQuestions(existingSession.id)
      // Resume path: session is in_progress and the requester is the candidate —
      // silent scoring means no per-answer scores leak mid-interview.
      const resumedQuestions = (detail?.questions ?? []).map(stripEvaluation)
      return NextResponse.json({
        data: { session: detail?.session ?? existingSession, questions: resumedQuestions, job },
      })
    }

    // A closed/draft job stops accepting fresh interview rounds (in-progress
    // sessions above may still be resumed).
    if (job.status !== 'active') {
      return NextResponse.json(
        { error: 'This position is no longer accepting interviews' },
        { status: 400 }
      )
    }

    // State-machine gating for starting a fresh round.
    if (round === 1) {
      if (!['screened', 'round1_in_progress'].includes(application.status)) {
        const message =
          application.status === 'applied'
            ? 'Your application is still being screened. Please try again shortly.'
            : `Round 1 cannot be started from status "${application.status}"`
        return NextResponse.json({ error: message }, { status: 400 })
      }
    } else {
      if (!['round2_available', 'round2_in_progress'].includes(application.status)) {
        return NextResponse.json(
          { error: 'Round 2 unlocks after passing Round 1' },
          { status: 400 }
        )
      }
    }

    const jobInput = {
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
    }

    let generated: Array<{ question: string; context: string }>
    if (round === 1) {
      const buffer = await downloadResume(application.resume_path)
      generated = await generateRound1Questions(
        {
          buffer,
          mime: application.resume_mime || 'application/pdf',
          name: application.resume_name,
        },
        jobInput
      )
    } else {
      // Build a summary of Round 1 performance for context.
      const round1Session = await getSessionByApplicationAndRound(applicationId, 1)
      let summary = 'Round 1 results unavailable.'
      if (round1Session) {
        const round1Detail = await getInterviewSessionWithQuestions(round1Session.id)
        const lines: string[] = []
        lines.push(
          `Round 1 overall score: ${round1Session.overall_score ?? 'n/a'} (grade ${round1Session.overall_grade ?? 'n/a'}).`
        )
        if (round1Session.overall_feedback) {
          lines.push(`Overall feedback: ${round1Session.overall_feedback}`)
        }
        for (const q of round1Detail?.questions ?? []) {
          if (q.candidate_answer) {
            lines.push(`Q${q.question_number} (score ${q.answer_score ?? 'n/a'}): ${q.question_text}`)
          }
        }
        summary = lines.join('\n')
      }
      generated = await generateRound2Questions(jobInput, summary)
    }

    let session
    try {
      session = await createInterviewSession(applicationId, user.id, job.id, round)
    } catch (createError) {
      // Unique violation: a concurrent request created the session first —
      // return that existing in_progress session instead of failing.
      if ((createError as { code?: string }).code === '23505') {
        const raced = await getSessionByApplicationAndRound(applicationId, round)
        if (raced) {
          const detail = await getInterviewSessionWithQuestions(raced.id)
          const racedQuestions = (detail?.questions ?? []).map(stripEvaluation)
          return NextResponse.json({
            data: { session: detail?.session ?? raced, questions: racedQuestions, job },
          })
        }
      }
      throw createError
    }

    // Single bulk insert for the round's questions.
    const questions: InterviewQuestion[] = await addInterviewQuestions(
      generated.map((g, i) => ({
        session_id: session.id,
        question_number: i + 1,
        question_type: round === 1 ? ('resume_based' as const) : ('job_based' as const),
        question_text: g.question,
        context: g.context,
      }))
    )

    await updateApplicationUnlessTerminal(applicationId, {
      status: round === 1 ? 'round1_in_progress' : 'round2_in_progress',
    })

    return NextResponse.json({ data: { session, questions, job } }, { status: 201 })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error starting interview:', error)
    return NextResponse.json({ error: 'Failed to start interview' }, { status: 500 })
  }
}
