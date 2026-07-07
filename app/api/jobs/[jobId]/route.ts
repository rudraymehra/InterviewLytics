import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getJobById, updateJob, deleteJob, Job } from '@/lib/jobStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UPDATABLE_FIELDS = [
  'title',
  'company',
  'description',
  'requirements',
  'location',
  'job_type',
  'experience_level',
  'salary_range',
  'status',
  'round1_pass_threshold',
] as const

/**
 * GET /api/jobs/[jobId] — job detail. Candidates see active jobs only;
 * recruiters see their own jobs in any status.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = requireAuth(request)

    const job = await getJobById(params.jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const isOwner = user.role === 'recruiter' && job.recruiter_id === user.id
    if (job.status !== 'active' && !isOwner) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ data: { job } })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error fetching job:', error)
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}

/**
 * PATCH /api/jobs/[jobId] — update a job (owning recruiter only).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = requireAuth(request, 'recruiter')

    const job = await getJobById(params.jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.recruiter_id !== user.id) {
      return NextResponse.json({ error: 'You do not own this job' }, { status: 403 })
    }

    const body = await request.json()
    const updates: Partial<Job> = {}
    for (const field of UPDATABLE_FIELDS) {
      if (body?.[field] !== undefined) {
        ;(updates as Record<string, unknown>)[field] = body[field]
      }
    }

    if (updates.status !== undefined && !['active', 'closed', 'draft'].includes(updates.status)) {
      return NextResponse.json(
        { error: "Status must be 'active', 'closed', or 'draft'" },
        { status: 400 }
      )
    }

    if (updates.round1_pass_threshold !== undefined && updates.round1_pass_threshold !== null) {
      const n = Number(updates.round1_pass_threshold)
      if (!Number.isInteger(n) || n < 0 || n > 100) {
        return NextResponse.json(
          { error: 'round1_pass_threshold must be an integer between 0 and 100' },
          { status: 400 }
        )
      }
      updates.round1_pass_threshold = n
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
    }

    const updatedJob = await updateJob(params.jobId, updates)
    return NextResponse.json({ data: { job: updatedJob } })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

/**
 * DELETE /api/jobs/[jobId] — delete a job (owning recruiter only).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = requireAuth(request, 'recruiter')

    const job = await getJobById(params.jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.recruiter_id !== user.id) {
      return NextResponse.json({ error: 'You do not own this job' }, { status: 403 })
    }

    await deleteJob(params.jobId)
    return NextResponse.json({ data: { deleted: true } })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
