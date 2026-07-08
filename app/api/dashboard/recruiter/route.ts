import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getJobsByRecruiter, getApplicationsByRecruiterLean } from '@/lib/jobStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/recruiter — stats, pipeline, and recent applicants for
 * the authenticated recruiter.
 */
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request, 'recruiter')

    const [jobs, applications] = await Promise.all([
      getJobsByRecruiter(user.id),
      // Lean select: dashboards don't need match_analysis/final_report jsonb.
      getApplicationsByRecruiterLean(user.id),
    ])

    const stats = {
      activeJobs: jobs.filter((job) => job.status === 'active').length,
      totalApplicants: applications.length,
      interviewsCompleted: applications.filter((app) => app.round1_score != null).length,
      hired: applications.filter((app) => app.status === 'hired').length,
    }

    const pipeline: Record<string, number> = {}
    for (const app of applications) {
      pipeline[app.status] = (pipeline[app.status] ?? 0) + 1
    }

    const recentApplicants = applications.slice(0, 8)

    return NextResponse.json({
      data: { stats, pipeline, recentApplicants },
    })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error building recruiter dashboard:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
