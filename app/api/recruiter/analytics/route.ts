import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getJobsByRecruiter, getApplicationsByRecruiterLean, Application } from '@/lib/jobStore'
import { getRound1PassThreshold } from '@/lib/ai/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type AppWithJob = Application & {
  job?: { id: string; title: string; company: string; round1_pass_threshold?: number | null }
}

const SCORE_BUCKETS = ['0-20', '20-40', '40-60', '60-80', '80-100']

/**
 * GET /api/recruiter/analytics — aggregate hiring analytics across the
 * recruiter's jobs.
 */
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request, 'recruiter')

    const [jobs, applications] = await Promise.all([
      getJobsByRecruiter(user.id),
      getApplicationsByRecruiterLean(user.id) as Promise<AppWithJob[]>,
    ])

    // Distinct candidates (one person may apply to several of the recruiter's jobs).
    const totalCandidates = new Set(applications.map((app) => app.candidate_id)).size

    const matchScores = applications
      .map((app) => app.match_percentage)
      .filter((score): score is number => typeof score === 'number')
    const averageMatchScore =
      matchScores.length > 0
        ? Math.round(matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length)
        : null

    const round1Done = applications.filter((app) => app.round1_score != null)
    const round1PassRate =
      round1Done.length > 0
        ? Math.round(
            (round1Done.filter(
              (app) =>
                (app.round1_score as number) >=
                getRound1PassThreshold(app.job?.round1_pass_threshold)
            ).length /
              round1Done.length) *
              100
          )
        : null

    const hiredCount = applications.filter((app) => app.status === 'hired').length

    const bucketCounts = [0, 0, 0, 0, 0]
    for (const app of applications) {
      const score = app.final_score ?? app.round1_score ?? app.match_percentage
      if (typeof score !== 'number') continue
      const index = Math.min(4, Math.floor(score / 20))
      bucketCounts[index] += 1
    }
    const scoreDistribution = SCORE_BUCKETS.map((range, i) => ({
      range,
      count: bucketCounts[i],
    }))

    const pipeline: Record<string, number> = {}
    for (const app of applications) {
      pipeline[app.status] = (pipeline[app.status] ?? 0) + 1
    }

    const countsByJob: Record<string, number> = {}
    for (const app of applications) {
      countsByJob[app.job_id] = (countsByJob[app.job_id] ?? 0) + 1
    }
    const applicationsPerJob = jobs.map((job) => ({
      jobId: job.id,
      title: job.title,
      count: countsByJob[job.id] ?? 0,
    }))

    return NextResponse.json({
      data: {
        totalCandidates,
        averageMatchScore,
        round1PassRate,
        hiredCount,
        scoreDistribution,
        pipeline,
        applicationsPerJob,
      },
    })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error building recruiter analytics:', error)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
