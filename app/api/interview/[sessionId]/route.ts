import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { getInterviewSessionWithQuestions } from '@/lib/interviewStore'

/**
 * GET /api/interview/[sessionId] - Get interview session with questions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const data = await getInterviewSessionWithQuestions(params.sessionId)
    
    if (!data) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    // Verify access
    if (data.session.candidate_id !== decoded.userId && decoded.role !== 'recruiter') {
      return NextResponse.json(
        { error: 'Not authorized to view this interview' },
        { status: 403 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching interview session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch interview session' },
      { status: 500 }
    )
  }
}

