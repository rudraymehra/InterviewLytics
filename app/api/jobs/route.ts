import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { createJob, getActiveJobs, getJobsByRecruiter } from '@/lib/jobStore'

/**
 * GET /api/jobs - Get all active jobs (for candidates) or recruiter's jobs
 */
export async function GET(request: NextRequest) {
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

    const url = new URL(request.url)
    const recruiterView = url.searchParams.get('recruiter') === 'true'

    if (recruiterView && decoded.role === 'recruiter') {
      // Get recruiter's own jobs
      const jobs = await getJobsByRecruiter(decoded.userId)
      return NextResponse.json({ jobs })
    } else {
      // Get all active jobs (for candidates)
      const jobs = await getActiveJobs()
      return NextResponse.json({ jobs })
    }
  } catch (error: any) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/jobs - Create a new job (recruiters only)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'recruiter') {
      return NextResponse.json(
        { error: 'Only recruiters can create jobs' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      company,
      description,
      requirements,
      location,
      job_type,
      experience_level,
      salary_range,
      status = 'active',
    } = body

    if (!title || !company || !description || !requirements) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const job = await createJob({
      recruiter_id: decoded.userId,
      title,
      company,
      description,
      requirements,
      location,
      job_type,
      experience_level,
      salary_range,
      status,
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create job' },
      { status: 500 }
    )
  }
}

