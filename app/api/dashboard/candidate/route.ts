import { NextResponse } from 'next/server'
import { verifyUserToken } from '@/lib/jwt'
import { findUserById } from '@/lib/userStore'
import { getApplicationsForUser, getUpcomingInterviewsForUser } from '@/lib/applicationStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const auth = request.headers.get('authorization') || request.headers.get('Authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyUserToken(token)
    if (!payload?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await findUserById(String(payload.id))
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const [applications, interviews] = await Promise.all([
      getApplicationsForUser(user.id),
      getUpcomingInterviewsForUser(user.id)
    ])

    const shortlistedCount = applications.filter(app => app.status === 'shortlisted').length
    const hiredCount = applications.filter(app => app.status === 'hired').length

    const formattedApplications = applications.map(app => ({
      id: app.id,
      jobTitle: app.job_title,
      company: app.company,
      status: app.status,
      appliedAt: app.applied_at,
      score: app.score ?? undefined
    }))

    const formattedInterviews = interviews.map(interview => ({
      id: interview.id,
      title: interview.title,
      company: interview.company,
      interviewType: interview.interview_type ?? undefined,
      scheduledAt: interview.scheduled_at,
      meetingLink: interview.meeting_link ?? undefined
    }))

    return NextResponse.json({
      data: {
        applications: formattedApplications,
        interviews: formattedInterviews,
        stats: {
          totalApplications: applications.length,
          shortlisted: shortlistedCount,
          hired: hiredCount
        }
      }
    })
  } catch (error) {
    return NextResponse.json({ message: 'Failed to load dashboard data' }, { status: 500 })
  }
}


