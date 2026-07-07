import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getApplicationsByRecruiter } from '@/lib/jobStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/recruiter/applicants — all applicants across the recruiter's jobs
 * (optionally filtered by ?job_id=). Rows include job + candidate relations.
 */
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request, 'recruiter')

    const url = new URL(request.url)
    const jobId = url.searchParams.get('job_id')

    const applicants = await getApplicationsByRecruiter(user.id, jobId ?? undefined)
    return NextResponse.json({ data: { applicants } })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error fetching applicants:', error)
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 })
  }
}
