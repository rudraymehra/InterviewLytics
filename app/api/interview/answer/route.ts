import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import {
  getInterviewSession,
  updateInterviewQuestion,
  addInterviewQuestion,
} from '@/lib/interviewStore'
import { evaluateAnswer, generateCrossQuestion } from '@/lib/aiService'

/**
 * POST /api/interview/answer - Submit an answer and optionally generate cross-question
 * Body: {
 *   question_id: string
 *   answer: string
 *   generate_cross_question: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Only candidates can submit answers' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { question_id, answer, generate_cross_question = false } = body

    if (!question_id || !answer) {
      return NextResponse.json(
        { error: 'Missing question_id or answer' },
        { status: 400 }
      )
    }

    // Get the question to evaluate
    const supabase = (await import('@/lib/supabaseAdmin')).getSupabaseAdmin()
    const { data: question, error: qError } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('id', question_id)
      .single()

    if (qError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Verify session ownership
    const session = await getInterviewSession(question.session_id)
    if (!session || session.candidate_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'Not your interview session' },
        { status: 403 }
      )
    }

    // Evaluate the answer using AI
    const evaluation = await evaluateAnswer(
      question.question_text,
      answer,
      question.context || '',
      question.question_type
    )

    // Update question with answer and evaluation
    await updateInterviewQuestion(question_id, {
      candidate_answer: answer,
      answer_score: evaluation.score,
      answer_feedback: evaluation.feedback,
      answer_evaluation: evaluation.evaluation,
      answered_at: new Date().toISOString(),
    })

    let crossQuestion = null

    // Generate cross-question if requested
    if (generate_cross_question) {
      try {
        const crossQuestionText = await generateCrossQuestion(
          question.question_text,
          answer,
          question.context || ''
        )

        // Find the highest question number in this session
        const { data: questions } = await supabase
          .from('interview_questions')
          .select('question_number')
          .eq('session_id', question.session_id)
          .order('question_number', { ascending: false })
          .limit(1)

        const nextQuestionNumber = questions?.[0]?.question_number
          ? questions[0].question_number + 1
          : 100

        // Add cross-question to the session
        crossQuestion = await addInterviewQuestion({
          session_id: question.session_id,
          question_number: nextQuestionNumber,
          question_type: 'cross_question',
          parent_question_id: question_id,
          question_text: crossQuestionText,
          context: `Follow-up to: ${question.question_text}`,
        })
      } catch (crossError) {
        console.error('Failed to generate cross-question:', crossError)
        // Continue without cross-question if it fails
      }
    }

    return NextResponse.json({
      evaluation,
      cross_question: crossQuestion,
      message: 'Answer submitted successfully',
    })
  } catch (error: any) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit answer' },
      { status: 500 }
    )
  }
}

