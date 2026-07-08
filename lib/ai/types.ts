// Shared contract for the AI service. lib/aiService.ts implements these
// signatures; API routes program against them.

export interface ResumeInput {
  buffer: Buffer
  mime: string
  name: string
}

export interface JobInput {
  title: string
  company: string
  description: string
  requirements: string
}

export interface MatchResult {
  matchPercentage: number
  matchedSkills: string[]
  missingSkills: string[]
  summary: string
  demoMode?: boolean
}

export interface GeneratedQuestion {
  question: string
  context: string
}

export interface AnswerEvaluation {
  score: number // 0-100
  feedback: string
  evaluation: {
    correctness: number // 0-10
    clarity: number
    depth: number
    relevance: number
  }
  demoMode?: boolean
}

export interface AnsweredQuestion {
  question: string
  answer: string
  score: number | null
  questionType: string
}

/**
 * A single titled feedback bullet: a short bold heading ("Good Feature
 * Coverage") plus 1-3 sentences of detail grounded in the candidate's answers.
 */
export interface FeedbackPoint {
  title: string
  detail: string
}

/**
 * Normalize unknown feedback data into FeedbackPoint[].
 * Accepts the new object shape, legacy plain-string arrays (older DB rows),
 * or anything else (returns []). Never throws.
 */
export function toFeedbackPoints(v: unknown): FeedbackPoint[] {
  if (!Array.isArray(v)) return []
  const points: FeedbackPoint[] = []
  for (const item of v) {
    if (typeof item === 'string') {
      const detail = item.trim()
      if (detail) points.push({ title: '', detail })
    } else if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>
      const title = typeof obj.title === 'string' ? obj.title.trim() : ''
      const detail = typeof obj.detail === 'string' ? obj.detail.trim() : ''
      if (title || detail) points.push({ title, detail })
    }
  }
  return points
}

export interface RoundFeedback {
  score: number // 0-100
  grade: string // A–F
  feedback: string
  strengths: FeedbackPoint[]
  weaknesses: FeedbackPoint[]
  demoMode?: boolean
}

export interface FinalReportInput {
  job: JobInput
  matchPercentage: number | null
  round1: { score: number; feedback: string; strengths: FeedbackPoint[]; weaknesses: FeedbackPoint[] }
  round2: { score: number; feedback: string; strengths: FeedbackPoint[]; weaknesses: FeedbackPoint[] }
  weights: { resume: number; round1: number; round2: number } // percentages summing to 100
  finalScore: number // pre-computed weighted score (AI does not recompute)
}

export interface FinalReport {
  finalScore: number
  grade: string
  recommendation: 'strong_hire' | 'hire' | 'consider' | 'no_hire'
  summary: string
  roundComparison: string
  strengths: FeedbackPoint[]
  risks: FeedbackPoint[]
  demoMode?: boolean
}

// Scoring configuration (env-driven with defaults)
export function getScoreWeights() {
  const resume = clampInt(process.env.SCORE_WEIGHT_RESUME, 20)
  const round1 = clampInt(process.env.SCORE_WEIGHT_ROUND1, 35)
  const round2 = clampInt(process.env.SCORE_WEIGHT_ROUND2, 45)
  return { resume, round1, round2 }
}

export function getRound1PassThreshold(jobThreshold?: number | null): number {
  if (typeof jobThreshold === 'number') return jobThreshold
  return clampInt(process.env.ROUND1_PASS_THRESHOLD, 60)
}

export function gradeFromScore(score: number): string {
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

export function clampScore(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(n)) return fallback
  return Math.max(0, Math.min(100, Math.round(n)))
}

function clampInt(raw: string | undefined, fallback: number): number {
  const n = raw ? parseInt(raw, 10) : NaN
  if (Number.isNaN(n)) return fallback
  return Math.max(0, Math.min(100, n))
}
