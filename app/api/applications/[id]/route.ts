import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getApplicationById, getJobById, getResumeUrl } from '@/lib/jobStore'
import {
  getSessionsByApplication,
  getInterviewSessionWithQuestions,
} from '@/lib/interviewStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/applications/[id] — full application detail for the owning
 * candidate: application + job + signed resume URL + interview rounds.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request, 'candidate')

    const application = await getApplicationById(params.id)
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    if (application.candidate_id !== user.id) {
      return NextResponse.json({ error: 'You do not own this application' }, { status: 403 })
    }

    const [job, resumeUrl, sessions] = await Promise.all([
      getJobById(application.job_id),
      getResumeUrl(application.resume_path),
      getSessionsByApplication(application.id),
    ])

    const rounds = []
    for (const session of sessions) {
      const detail = await getInterviewSessionWithQuestions(session.id)
      if (detail) {
        rounds.push({ session: detail.session, questions: detail.questions })
      }
    }

    const detail = {
      ...application,
      job: job ?? undefined,
      resume_url: resumeUrl ?? undefined,
      rounds,
    }

    return NextResponse.json({ data: detail })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error fetching application detail:', error)
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 })
  }
}
