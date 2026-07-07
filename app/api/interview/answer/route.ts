import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getJobById } from '@/lib/jobStore'
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

// A mid-band score on a primary question triggers one AI follow-up probe.
const CROSS_QUESTION_MIN = 40
const CROSS_QUESTION_MAX = 75

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
    if (question.candidate_answer != null) {
      return NextResponse.json(
        { error: 'This question has already been answered' },
        { status: 409 }
      )
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

    // Cross-question rule: mid-band score on a non-follow-up question that
    // doesn't already have a follow-up spawns one probe.
    let crossQuestion: InterviewQuestion | undefined
    const hasFollowUp = allQuestions.some((q) => q.parent_question_id === question.id)
    if (
      question.question_type !== 'cross_question' &&
      score >= CROSS_QUESTION_MIN &&
      score <= CROSS_QUESTION_MAX &&
      !hasFollowUp
    ) {
      try {
        const crossText = await generateCrossQuestion(
          question.question_text,
          answer,
          question.context || ''
        )
        crossQuestion = await addInterviewQuestion({
          session_id: session.id,
          question_number: question.question_number,
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

    return NextResponse.json({
      data: { question: updated, crossQuestion, remaining },
    })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error submitting answer:', error)
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 })
  }
}
