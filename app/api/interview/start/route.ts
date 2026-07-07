import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getApplicationById, getJobById, downloadResume, updateApplication } from '@/lib/jobStore'
import {
  createInterviewSession,
  addInterviewQuestion,
  getSessionByApplicationAndRound,
  getInterviewSessionWithQuestions,
  InterviewQuestion,
} from '@/lib/interviewStore'
import { generateRound1Questions, generateRound2Questions } from '@/lib/aiService'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

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
      return NextResponse.json({
        data: { session: detail?.session ?? existingSession, questions: detail?.questions ?? [], job },
      })
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

    const session = await createInterviewSession(applicationId, user.id, job.id, round)

    const questions: InterviewQuestion[] = []
    for (let i = 0; i < generated.length; i++) {
      const question = await addInterviewQuestion({
        session_id: session.id,
        question_number: i + 1,
        question_type: round === 1 ? 'resume_based' : 'job_based',
        question_text: generated[i].question,
        context: generated[i].context,
      })
      questions.push(question)
    }

    await updateApplication(applicationId, {
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
