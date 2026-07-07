import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { createJob, getActiveJobs, getJobsByRecruiter, getApplicantCounts } from '@/lib/jobStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs — active jobs for candidates, or own jobs (with applicant
 * counts) when ?recruiter=true and the caller is a recruiter.
 */
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    const url = new URL(request.url)
    const recruiterView = url.searchParams.get('recruiter') === 'true'

    if (recruiterView && user.role === 'recruiter') {
      const jobs = await getJobsByRecruiter(user.id)
      const counts = await getApplicantCounts(jobs.map((job) => job.id))
      const withCounts = jobs.map((job) => ({
        ...job,
        applicant_count: counts[job.id] ?? 0,
      }))
      return NextResponse.json({ data: { jobs: withCounts } })
    }

    const jobs = await getActiveJobs()
    return NextResponse.json({ data: { jobs } })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

/**
 * POST /api/jobs — create a job (recruiters only).
 */
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request, 'recruiter')

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
      round1_pass_threshold,
      status = 'active',
    } = body ?? {}

    for (const [field, value] of Object.entries({ title, company, description, requirements })) {
      if (typeof value !== 'string' || value.trim().length === 0) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    if (status !== 'active' && status !== 'draft') {
      return NextResponse.json(
        { error: "Status must be 'active' or 'draft'" },
        { status: 400 }
      )
    }

    let threshold: number | null = null
    if (round1_pass_threshold !== undefined && round1_pass_threshold !== null) {
      const n = Number(round1_pass_threshold)
      if (!Number.isInteger(n) || n < 0 || n > 100) {
        return NextResponse.json(
          { error: 'round1_pass_threshold must be an integer between 0 and 100' },
          { status: 400 }
        )
      }
      threshold = n
    }

    const job = await createJob({
      recruiter_id: user.id,
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      requirements: requirements.trim(),
      location: typeof location === 'string' ? location : undefined,
      job_type: typeof job_type === 'string' ? job_type : undefined,
      experience_level: typeof experience_level === 'string' ? experience_level : undefined,
      salary_range: typeof salary_range === 'string' ? salary_range : undefined,
      round1_pass_threshold: threshold,
      status,
    })

    return NextResponse.json({ data: { job } }, { status: 201 })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
