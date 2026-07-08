import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import {
  getApplicationById,
  getJobById,
  getResumeUrl,
  updateApplication,
  ApplicationStatus,
} from '@/lib/jobStore'
import {
  getSessionsByApplication,
  getInterviewSessionWithQuestions,
  abandonInProgressSessions,
} from '@/lib/interviewStore'
import { findUserById } from '@/lib/userStore'
import { sendStatusEmail } from '@/lib/notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RECRUITER_STATUSES: ApplicationStatus[] = ['shortlisted', 'rejected', 'hired']

async function loadOwnedApplication(userId: string, applicationId: string) {
  const application = await getApplicationById(applicationId)
  if (!application) {
    return { error: NextResponse.json({ error: 'Application not found' }, { status: 404 }) }
  }
  const job = await getJobById(application.job_id)
  if (!job) {
    return { error: NextResponse.json({ error: 'Job not found' }, { status: 404 }) }
  }
  if (job.recruiter_id !== userId) {
    return {
      error: NextResponse.json(
        { error: 'You do not have access to this application' },
        { status: 403 }
      ),
    }
  }
  return { application, job }
}

/**
 * GET /api/recruiter/applications/[id] — full application detail (application
 * + job + candidate + signed resume URL + interview rounds) for the owning
 * recruiter.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request, 'recruiter')

    const loaded = await loadOwnedApplication(user.id, params.id)
    if ('error' in loaded) return loaded.error
    const { application, job } = loaded

    const [candidate, resumeUrl, sessions] = await Promise.all([
      findUserById(application.candidate_id),
      getResumeUrl(application.resume_path),
      getSessionsByApplication(application.id),
    ])

    const details = await Promise.all(
      sessions.map((session) => getInterviewSessionWithQuestions(session.id))
    )
    const rounds = []
    for (const detail of details) {
      if (detail) {
        rounds.push({ session: detail.session, questions: detail.questions })
      }
    }

    const detail = {
      ...application,
      job,
      candidate: candidate
        ? { id: candidate.id, name: candidate.name, email: candidate.email }
        : undefined,
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

/**
 * PATCH /api/recruiter/applications/[id] — set shortlisted/rejected/hired.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request, 'recruiter')

    const loaded = await loadOwnedApplication(user.id, params.id)
    if ('error' in loaded) return loaded.error
    const { application, job } = loaded

    const body = await request.json()
    const status = body?.status
    if (!RECRUITER_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Status must be one of 'shortlisted', 'rejected', or 'hired'" },
        { status: 400 }
      )
    }

    if (application.status === 'applied') {
      return NextResponse.json(
        { error: 'Candidate has not been screened yet' },
        { status: 400 }
      )
    }
    if (application.status === 'rejected' || application.status === 'hired') {
      return NextResponse.json(
        { error: `Application is already ${application.status} and cannot be changed` },
        { status: 409 }
      )
    }

    const updated = await updateApplication(application.id, {
      status,
      reviewed_at: new Date().toISOString(),
    })

    // A recruiter decision closes any live interview: mark in_progress
    // sessions abandoned so they can't be resumed or completed afterwards.
    await abandonInProgressSessions(application.id)

    try {
      const candidate = await findUserById(application.candidate_id)
      if (candidate) {
        await sendStatusEmail({
          to: candidate.email,
          candidateName: candidate.name,
          jobTitle: job.title,
          company: job.company,
          kind: 'status_changed',
          status,
        })
      }
    } catch (emailError) {
      console.warn('Failed to send status-changed email:', emailError)
    }

    return NextResponse.json({ data: { application: updated } })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error updating application status:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}
