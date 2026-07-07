import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getInterviewSessionWithQuestions } from '@/lib/interviewStore'
import { getJobById } from '@/lib/jobStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/interview/[sessionId] — session detail with questions and job.
 * Accessible to the owning candidate or the recruiter who owns the job.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = requireAuth(request)

    const detail = await getInterviewSessionWithQuestions(params.sessionId)
    if (!detail) {
      return NextResponse.json({ error: 'Interview session not found' }, { status: 404 })
    }
    const { session, questions } = detail

    const job = await getJobById(session.job_id)

    const isCandidateOwner = session.candidate_id === user.id
    const isRecruiterOwner =
      user.role === 'recruiter' && job !== null && job.recruiter_id === user.id
    if (!isCandidateOwner && !isRecruiterOwner) {
      return NextResponse.json(
        { error: 'You do not have access to this interview session' },
        { status: 403 }
      )
    }

    return NextResponse.json({ data: { session, questions, job: job ?? undefined } })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error fetching interview session:', error)
    return NextResponse.json({ error: 'Failed to fetch interview session' }, { status: 500 })
  }
}
