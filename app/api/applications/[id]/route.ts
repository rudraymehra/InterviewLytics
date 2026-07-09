import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import { getApplicationById, getJobById, getResumeUrl } from '@/lib/jobStore'
import {
  getSessionsByApplication,
  getInterviewSessionWithQuestions,
  InterviewQuestion,
  InterviewSession,
} from '@/lib/interviewStore'
import { ensureFinalReport } from '@/lib/reportService'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Silent scoring: candidates must not see per-answer scores mid-interview. */
function stripEvaluation(q: InterviewQuestion): InterviewQuestion {
  const { answer_score, answer_feedback, answer_evaluation, ...rest } = q
  void answer_score
  void answer_feedback
  void answer_evaluation
  return rest as InterviewQuestion
}

/** Hide overall session results while the session is still in progress. */
function stripSessionResults(session: InterviewSession): InterviewSession {
  const { overall_score, overall_grade, overall_feedback, strengths, weaknesses, ...rest } =
    session
  void overall_score
  void overall_grade
  void overall_feedback
  void strengths
  void weaknesses
  return rest as InterviewSession
}

/**
 * GET /api/applications/[id] — full application detail for the owning
 * candidate: application + job + signed resume URL + interview rounds.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request, 'candidate')

    const application = await getApplicationById(params.id)
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    if (application.candidate_id !== user.id) {
      return NextResponse.json({ error: 'You do not own this application' }, { status: 403 })
    }

    const [job, resumeUrl, sessions] = await Promise.all([
      getJobById(application.job_id),
      getResumeUrl(application.resume_path),
      getSessionsByApplication(application.id),
    ])

    const details = await Promise.all(
      sessions.map((session) => getInterviewSessionWithQuestions(session.id))
    )
    const rounds = []
    for (const detail of details) {
      if (!detail) continue
      // Completed sessions return full results; in_progress sessions are
      // stripped of per-answer scores AND overall results (silent scoring).
      if (detail.session.status === 'in_progress') {
        rounds.push({
          session: stripSessionResults(detail.session),
          questions: detail.questions.map(stripEvaluation),
        })
      } else {
        rounds.push({ session: detail.session, questions: detail.questions })
      }
    }

    // Self-healing: if round 2 finished but the final report is missing
    // (e.g. report generation timed out during /interview/complete),
    // generate + persist it now, within this request's own time budget.
    const finalReport = job
      ? await ensureFinalReport(application, job)
      : application.final_report ?? null

    const detail = {
      ...application,
      final_report: finalReport,
      job: job ?? undefined,
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
