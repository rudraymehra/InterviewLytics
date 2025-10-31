import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { getJobById, updateJob } from '@/lib/jobStore'

/**
 * GET /api/jobs/[jobId] - Get job details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const job = await getJobById(params.jobId)
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error: any) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/jobs/[jobId] - Update job (recruiter only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'recruiter') {
      return NextResponse.json(
        { error: 'Only recruiters can update jobs' },
        { status: 403 }
      )
    }

    const job = await getJobById(params.jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Verify ownership
    if (job.recruiter_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'You can only update your own jobs' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updatedJob = await updateJob(params.jobId, body)

    return NextResponse.json({ job: updatedJob })
  } catch (error: any) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update job' },
      { status: 500 }
    )
  }
}

