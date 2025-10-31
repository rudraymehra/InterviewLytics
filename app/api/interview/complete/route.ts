import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import {
  getInterviewSession,
  getInterviewSessionWithQuestions,
  completeInterviewSession,
} from '@/lib/interviewStore'
import { generateOverallFeedback } from '@/lib/aiService'

/**
 * POST /api/interview/complete - Complete an interview and generate final feedback
 * Body: { session_id: string }
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
        { error: 'Only candidates can complete interviews' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { session_id } = body

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      )
    }

    // Get session with questions
    const data = await getInterviewSessionWithQuestions(session_id)
    if (!data) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (data.session.candidate_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'Not your interview session' },
        { status: 403 }
      )
    }

    // Check if already completed
    if (data.session.status === 'completed') {
      return NextResponse.json(
        { error: 'Interview already completed' },
        { status: 400 }
      )
    }

    // Filter answered questions
    const answeredQuestions = data.questions.filter(
      (q) => q.candidate_answer && q.answer_score !== null
    )

    if (answeredQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No answered questions found' },
        { status: 400 }
      )
    }

    // Prepare data for AI feedback generation
    const questionsForFeedback = answeredQuestions.map((q) => ({
      question: q.question_text,
      answer: q.candidate_answer || '',
      score: q.answer_score || 0,
      feedback: q.answer_feedback || '',
    }))

    // Generate overall feedback using AI
    const overallFeedback = await generateOverallFeedback(questionsForFeedback)

    // Complete the session
    const completedSession = await completeInterviewSession(session_id, {
      overall_score: overallFeedback.overallScore,
      overall_grade: overallFeedback.grade,
      overall_feedback: overallFeedback.feedback,
      strengths: overallFeedback.strengths,
      weaknesses: overallFeedback.weaknesses,
    })

    return NextResponse.json({
      session: completedSession,
      feedback: overallFeedback,
      message: 'Interview completed successfully',
    })
  } catch (error: any) {
    console.error('Error completing interview:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to complete interview' },
      { status: 500 }
    )
  }
}

