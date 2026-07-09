// Final-report assembly + lazy (self-healing) generation.
//
// Why this exists: /api/interview/complete for round 2 makes two heavy AI
// calls (round feedback, then the final report). On Vercel the pair can blow
// the 60s maxDuration, killing the function. The complete route therefore
// persists scores/status FIRST and treats the report as best-effort; the
// detail routes call ensureFinalReport() so a missing report is generated on
// first view, within that request's own time budget.
import {
  Application,
  Job,
  updateApplication,
  TERMINAL_APPLICATION_STATUSES,
} from '@/lib/jobStore'
import { getSessionByApplicationAndRound } from '@/lib/interviewStore'
import { generateFinalReport } from '@/lib/aiService'
import { clampScore, getScoreWeights } from '@/lib/ai/types'
import type { FeedbackPoint, FinalReportInput } from '@/lib/ai/types'

export interface RoundSummary {
  score: number
  feedback: string
  strengths: FeedbackPoint[]
  weaknesses: FeedbackPoint[]
}

export function jobInputOf(job: Job) {
  return {
    title: job.title,
    company: job.company,
    description: job.description,
    requirements: job.requirements,
  }
}

/** Weighted final score: resume match + round 1 + round 2 (env-driven weights). */
export function computeFinalScore(application: Application, round2Score: number): number {
  const weights = getScoreWeights()
  const match = application.match_percentage ?? 50
  const round1Score = application.round1_score ?? 0
  return clampScore(
    Math.round(
      (match * weights.resume) / 100 +
        (round1Score * weights.round1) / 100 +
        (round2Score * weights.round2) / 100
    )
  )
}

/**
 * Assemble the FinalReportInput exactly as the complete route does: round-1
 * feedback/strengths/weaknesses come from the stored round-1 session; round-2
 * data is passed in (fresh feedback in the complete route, the stored round-2
 * session in the lazy path).
 */
export async function buildFinalReportInput(
  application: Application,
  job: Job,
  round2: RoundSummary,
  finalScore: number
): Promise<FinalReportInput> {
  const round1Session = await getSessionByApplicationAndRound(application.id, 1)
  return {
    job: jobInputOf(job),
    matchPercentage: application.match_percentage ?? null,
    round1: {
      score: application.round1_score ?? 0,
      feedback: round1Session?.overall_feedback ?? '',
      strengths: round1Session?.strengths ?? [],
      weaknesses: round1Session?.weaknesses ?? [],
    },
    round2,
    weights: getScoreWeights(),
    finalScore,
  }
}

/**
 * Lazily generate + persist the final report when it is missing on an
 * application that has finished round 2 (self-heals after a serverless
 * timeout killed report generation in /api/interview/complete).
 * Never throws; returns the existing or newly generated report, or null.
 */
export async function ensureFinalReport(application: Application, job: Job): Promise<any | null> {
  try {
    if (application.final_report != null) return application.final_report

    const eligible =
      application.status === 'round2_completed' ||
      (TERMINAL_APPLICATION_STATUSES.includes(application.status) &&
        application.round2_score != null)
    if (!eligible || application.round2_score == null) return null

    const round2Session = await getSessionByApplicationAndRound(application.id, 2)
    // Reuse the already-stored weighted final score; recompute only if absent.
    const finalScore =
      application.final_score ?? computeFinalScore(application, application.round2_score)

    const input = await buildFinalReportInput(
      application,
      job,
      {
        score: application.round2_score,
        feedback: round2Session?.overall_feedback ?? '',
        strengths: round2Session?.strengths ?? [],
        weaknesses: round2Session?.weaknesses ?? [],
      },
      finalScore
    )
    const report = await generateFinalReport(input)
    await updateApplication(application.id, { final_report: report })
    return report
  } catch (error) {
    console.warn('[reportService] ensureFinalReport failed:', error)
    return application.final_report ?? null
  }
}
