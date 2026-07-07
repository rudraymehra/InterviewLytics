import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getApplicationsByCandidate, Application, Job, ApplicationStatus } from '@/lib/jobStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type AppWithJob = Application & { job?: Job }

const IN_PROGRESS_STATUSES: ApplicationStatus[] = [
  'screened',
  'round1_in_progress',
  'round2_available',
  'round2_in_progress',
]

// CTA labels mirroring STATUS_META in utils/apiClient.ts.
const ACTION_META: Partial<Record<ApplicationStatus, { round: 1 | 2; label: string }>> = {
  screened: { round: 1, label: 'Start Round 1 Interview' },
  round1_in_progress: { round: 1, label: 'Resume Round 1' },
  round2_available: { round: 2, label: 'Start Round 2 Interview' },
  round2_in_progress: { round: 2, label: 'Resume Round 2' },
}

/**
 * GET /api/dashboard/candidate — stats, next actions, and recent applications
 * for the authenticated candidate.
 */
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request, 'candidate')

    const applications = (await getApplicationsByCandidate(user.id)) as AppWithJob[]

    const stats = {
      totalApplications: applications.length,
      interviewsCompleted: applications.filter((app) => app.round1_score != null).length,
      inProgress: applications.filter((app) => IN_PROGRESS_STATUSES.includes(app.status)).length,
      offers: applications.filter((app) => app.status === 'hired').length,
    }

    const nextActions = applications
      .filter((app) => ACTION_META[app.status])
      .map((app) => {
        const meta = ACTION_META[app.status]!
        return {
          applicationId: app.id,
          jobTitle: app.job?.title ?? 'Unknown role',
          company: app.job?.company ?? '',
          status: app.status,
          round: meta.round,
          label: meta.label,
        }
      })

    const recentApplications = applications.slice(0, 5)

    return NextResponse.json({
      data: { stats, nextActions, recentApplications },
    })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error building candidate dashboard:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
