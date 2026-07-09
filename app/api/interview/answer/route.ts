import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getApplicationById, getJobById, TERMINAL_APPLICATION_STATUSES } from '@/lib/jobStore'
import {
  getInterviewSession,
  getInterviewSessionWithQuestions,
  updateInterviewQuestion,
  addInterviewQuestion,
  InterviewQuestion,
} from '@/lib/interviewStore'
import { evaluateAnswer, generateCrossQuestion } from '@/lib/aiService'
import { clampScore } from '@/lib/ai/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Follow-up probe thresholds by chain depth (number of cross-questions already
// asked under the same main question). A probe fires when the just-answered
// question's score is below the threshold for its depth; depth >= 3 never probes.
// Real interviewers almost always probe the first answer, then dig further only
// when the answer still leaves doubt.
const PROBE_SCORE_THRESHOLDS = [90, 65, 45]

/** Scores stay in the DB; in-flight responses must not reveal them mid-interview. */
function stripEvaluation(q: InterviewQuestion): InterviewQuestion {
  const { answer_score, answer_feedback, answer_evaluation, ...rest } = q
  void answer_score
  void answer_feedback
  void answer_evaluation
  return rest as InterviewQuestion
}

/**
 * POST /api/interview/answer — submit an answer for evaluation.
 * Body: { question_id, answer }.
 */
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request, 'candidate')

    const body = await request.json()
    const questionId = body?.question_id
    const answer = typeof body?.answer === 'string' ? body.answer.trim() : ''

    if (typeof questionId !== 'string' || questionId.length === 0) {
      return NextResponse.json({ error: 'question_id is required' }, { status: 400 })
    }
    if (!answer) {
      return NextResponse.json({ error: 'Answer cannot be empty' }, { status: 400 })
    }

    // One-off question fetch (interviewStore has no fetch-by-question-id).
    const supabase = getSupabaseAdmin()
    const { data: question, error: questionError } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (questionError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const session = await getInterviewSession(question.session_id)
    if (!session) {
      return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
    }
    if (session.candidate_id !== user.id) {
      return NextResponse.json({ error: 'You do not own this interview session' }, { status: 403 })
    }
    if (session.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'This interview session is no longer in progress' },
        { status: 409 }
      )
    }

    // A terminal recruiter decision (rejected/hired/shortlisted) closes the
    // interview even if the session row is still in_progress.
    const application = await getApplicationById(session.application_id)
    if (application && TERMINAL_APPLICATION_STATUSES.includes(application.status)) {
      return NextResponse.json(
        {
          error: `This application has been finalized by the recruiter (status "${application.status}") — the interview is closed`,
        },
        { status: 409 }
      )
    }
    if (question.candidate_answer != null) {
      return NextResponse.json(
        { error: 'This question has already been answered' },
        { status: 409 }
      )
    }

    // Warm-up questions (question_number 0) are small talk: skip AI evaluation
    // entirely (answer_score/answer_feedback/answer_evaluation stay null) and
    // never generate a cross-question — just record the answer and move on.
    if (question.question_number === 0) {
      const updatedWarmup = await updateInterviewQuestion(questionId, {
        candidate_answer: answer,
        answered_at: new Date().toISOString(),
      })
      const warmupDetail = await getInterviewSessionWithQuestions(session.id)
      const warmupRemaining = (warmupDetail?.questions ?? []).filter(
        (q) => q.candidate_answer == null
      ).length
      return NextResponse.json({
        data: {
          question: stripEvaluation(updatedWarmup),
          crossQuestion: undefined,
          remaining: warmupRemaining,
        },
      })
    }

    const job = await getJobById(session.job_id)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    const jobInput = {
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
    }

    const evaluation = await evaluateAnswer(
      question.question_text,
      answer,
      jobInput,
      question.question_type
    )
    const score = clampScore(evaluation.score)

    const updated = await updateInterviewQuestion(questionId, {
      candidate_answer: answer,
      answer_score: score,
      answer_feedback: evaluation.feedback,
      answer_evaluation: evaluation.evaluation,
      answered_at: new Date().toISOString(),
    })

    // Refresh the question list post-update to compute follow-ups + remaining.
    const detail = await getInterviewSessionWithQuestions(session.id)
    const allQuestions = detail?.questions ?? []

    // Cross-question chains: walk up from the answered question to its main
    // question, then down the chain (main → c1 → c2 …) to measure depth.
    const byId = new Map(allQuestions.map((q) => [q.id, q]))
    let mainQuestion: InterviewQuestion = byId.get(question.id) ?? (updated as InterviewQuestion)
    while (mainQuestion.question_type === 'cross_question' && mainQuestion.parent_question_id) {
      const parent = byId.get(mainQuestion.parent_question_id)
      if (!parent) break
      mainQuestion = parent
    }

    const chainCrosses: InterviewQuestion[] = []
    let tip: InterviewQuestion = mainQuestion
    for (;;) {
      const child = allQuestions
        .filter(
          (q) => q.question_type === 'cross_question' && q.parent_question_id === tip.id
        )
        .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))[0]
      if (!child) break
      chainCrosses.push(child)
      tip = child
    }
    const depth = chainCrosses.length

    // Probe decision: depth 0 probes almost always, deeper probes need doubt.
    let crossQuestion: InterviewQuestion | undefined
    const threshold = PROBE_SCORE_THRESHOLDS[depth]
    if (threshold !== undefined && score < threshold) {
      try {
        const chain = [mainQuestion, ...chainCrosses].map((q) => ({
          question: q.question_text,
          answer: q.id === question.id ? answer : q.candidate_answer || '',
        }))
        const crossText = await generateCrossQuestion(
          chain,
          job.title,
          mainQuestion.context || ''
        )
        crossQuestion = await addInterviewQuestion({
          session_id: session.id,
          question_number: mainQuestion.question_number,
          question_type: 'cross_question',
          parent_question_id: question.id,
          question_text: crossText,
          context: 'Follow-up probe',
        })
      } catch (crossError) {
        console.error('Failed to generate cross-question:', crossError)
      }
    }

    const remaining =
      allQuestions.filter((q) => q.candidate_answer == null).length + (crossQuestion ? 1 : 0)

    // Silent scoring: the candidate sees their answer was recorded, never the score.
    return NextResponse.json({
      data: {
        question: stripEvaluation(updated),
        crossQuestion: crossQuestion ? stripEvaluation(crossQuestion) : undefined,
        remaining,
      },
    })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error submitting answer:', error)
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 })
  }
}
