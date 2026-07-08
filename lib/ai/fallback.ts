// Deterministic, dependency-free fallbacks ("demo mode").
// Used when ANTHROPIC_API_KEY is not set, or when the API errors.

import {
  AnswerEvaluation,
  AnsweredQuestion,
  FinalReport,
  FinalReportInput,
  GeneratedQuestion,
  JobInput,
  MatchResult,
  RoundFeedback,
  clampScore,
  gradeFromScore,
  toFeedbackPoints,
} from './types'

/** Split job requirements into individual skill terms. */
export function parseSkillTerms(requirements: string): string[] {
  return (requirements || '')
    .split(/[,\n;]+/)
    .map((term) => term.replace(/^[\s•\-*\d.)]+/, '').trim())
    .filter((term) => term.length >= 2 && term.length <= 60)
}

export function fallbackMatch(resumeText: string | null, job: JobInput): MatchResult {
  const terms = parseSkillTerms(job.requirements)

  if (resumeText === null || terms.length === 0) {
    return {
      matchPercentage: 50,
      matchedSkills: [],
      missingSkills: terms,
      summary:
        'Demo mode: AI analysis is not configured, so a neutral match score of 50% was assigned. ' +
        'Configure ANTHROPIC_API_KEY to enable full resume analysis.',
      demoMode: true,
    }
  }

  const haystack = resumeText.toLowerCase()
  const matchedSkills = terms.filter((t) => haystack.includes(t.toLowerCase()))
  const missingSkills = terms.filter((t) => !haystack.includes(t.toLowerCase()))
  const rawPct = Math.round((100 * matchedSkills.length) / terms.length)
  const matchPercentage = Math.max(10, Math.min(95, rawPct))

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    summary:
      `Demo mode: keyword-based analysis matched ${matchedSkills.length} of ${terms.length} ` +
      `requirement terms for the ${job.title} role at ${job.company}. This is a heuristic estimate — ` +
      'configure ANTHROPIC_API_KEY for full AI-powered analysis.',
    demoMode: true,
  }
}

// Question banks keep 5 entries for backfill safety; rounds use the first 4.
export function fallbackRound1Questions(job: JobInput): GeneratedQuestion[] {
  const bank: GeneratedQuestion[] = [
    {
      question:
        'Walk me through your professional background and how it led you to apply for the ' +
        `${job.title} position.`,
      context: 'Opens the interview and checks that the career narrative on the resume is coherent.',
    },
    {
      question:
        'Pick the project on your resume you are most proud of. What was your specific contribution, and what was the measurable outcome?',
      context: 'Probes authenticity and depth of a resume project claim — real ownership vs. team credit.',
    },
    {
      question:
        'Which of the skills listed on your resume do you consider your strongest, and how have you applied it in a real production or delivery setting?',
      context: 'Validates a claimed skill with concrete, first-hand usage evidence.',
    },
    {
      question:
        'Describe a significant challenge or failure from a role on your resume. How did you handle it and what did you change afterwards?',
      context: 'Assesses honesty, self-awareness, and learning from experience.',
    },
    {
      question:
        'Explain a technical or process decision you made in a past role that you would make differently today, and why.',
      context: 'Tests depth of reflection and growth beyond what the resume states.',
    },
  ]
  return bank.slice(0, 4)
}

export function fallbackRound2Questions(job: JobInput): GeneratedQuestion[] {
  const terms = parseSkillTerms(job.requirements)
  const a = terms[0] || 'the core skills for this role'
  const b = terms[1] || 'the tools listed in the job description'
  const c = terms[2] || b

  const bank: GeneratedQuestion[] = [
    {
      question:
        `Imagine your first month as a ${job.title} at ${job.company}: a critical deliverable depends on ${a}. ` +
        'How would you approach scoping and executing it?',
      context: `Scenario question testing practical, hands-on ability with ${a}.`,
    },
    {
      question: `How would you evaluate trade-offs when choosing between different approaches involving ${b}? Give a concrete example of how you'd decide.`,
      context: `Tests judgment and depth with ${b}, a key requirement for the role.`,
    },
    {
      question:
        `A stakeholder challenges the approach you have taken using ${c}, claiming it will not scale. ` +
        'How do you respond and what evidence do you gather?',
      context: `Tests communication under pressure plus technical grounding in ${c}.`,
    },
    {
      question:
        'Describe how you would prioritize competing deadlines from multiple stakeholders in this role. What framework do you use?',
      context: 'Role-focused question on prioritization and stakeholder management.',
    },
    {
      question:
        `What do you see as the biggest challenge facing someone in the ${job.title} role, and how would you prepare for it in your first 90 days?`,
      context: 'Assesses understanding of the role, the domain, and realistic planning.',
    },
  ]
  return bank.slice(0, 4)
}

/** Generic follow-up probes, rotated by chain depth so chained fallbacks differ. */
const CROSS_QUESTION_PROBES = [
  'Can you go deeper on the specifics — what exactly did you do, and what was the measurable outcome?',
  'What was your personal role in that, as opposed to the rest of the team — which decisions were yours?',
  'What trade-offs or alternatives did you consider, and why did you settle on that approach?',
]

export function fallbackCrossQuestion(depth: number): string {
  const i = Math.max(0, Math.floor(depth)) % CROSS_QUESTION_PROBES.length
  return CROSS_QUESTION_PROBES[i]
}

const SIGNAL_KEYWORDS = [
  'because',
  'example',
  'result',
  'measured',
  'implemented',
  'designed',
  'built',
  'tested',
  'improved',
  'optimized',
  'led',
  'deployed',
  'data',
  'metric',
  'trade-off',
  'tradeoff',
]

export function fallbackEvaluate(answer: string): AnswerEvaluation {
  const trimmed = (answer || '').trim()
  const words = trimmed ? trimmed.split(/\s+/) : []
  const wordCount = words.length

  // Length component: up to +40 over the base of 30.
  let score = 30 + Math.min(40, Math.round(wordCount / 4))

  // Keyword-density component: substantive answers mention reasoning/outcomes.
  const lower = trimmed.toLowerCase()
  const hits = SIGNAL_KEYWORDS.filter((k) => lower.includes(k)).length
  score += Math.min(15, hits * 3)

  // Penalize evasive / near-empty answers.
  if (wordCount < 10) score = Math.min(score, 35)

  score = Math.max(30, Math.min(85, score))

  const dim = (offset: number) =>
    Math.max(0, Math.min(10, Math.round(score / 10) + offset))

  return {
    score: clampScore(score),
    feedback:
      wordCount < 10
        ? 'Demo mode: the answer was very brief. Expanding with specifics, reasoning, and measurable outcomes would strengthen it considerably.'
        : 'Demo mode: heuristic evaluation based on answer length and substance. The answer shows engagement with the question; adding concrete examples and measurable outcomes would improve it further.',
    evaluation: {
      correctness: dim(0),
      clarity: dim(0),
      depth: dim(-1),
      relevance: dim(0),
    },
    demoMode: true,
  }
}

export function fallbackRoundFeedback(questions: AnsweredQuestion[]): RoundFeedback {
  const scored = questions.filter((q) => typeof q.score === 'number')
  const avg =
    scored.length > 0
      ? scored.reduce((sum, q) => sum + (q.score as number), 0) / scored.length
      : 50
  const score = clampScore(avg)

  return {
    score,
    grade: gradeFromScore(score),
    feedback:
      `Demo mode: round score computed as the average of ${scored.length || questions.length} answered ` +
      'question(s). Configure ANTHROPIC_API_KEY for detailed, AI-generated round feedback.',
    strengths: [
      {
        title: 'Consistent Participation',
        detail: 'The candidate completed every question in the round and stayed engaged throughout the session.',
      },
      {
        title: 'Follow-up Engagement',
        detail: 'They responded to both the primary questions and the follow-up probes rather than skipping past them.',
      },
    ],
    weaknesses: [
      {
        title: 'Answer Depth',
        detail: 'Answers would land better with more concrete examples and measurable outcomes — name the project, the decision made, and the result it produced.',
      },
      {
        title: 'Response Structure',
        detail: 'Structuring responses as situation, action, and result would make each answer easier to follow and score.',
      },
    ],
    demoMode: true,
  }
}

export function fallbackFinalReport(input: FinalReportInput): FinalReport {
  const finalScore = clampScore(input.finalScore)
  const recommendation: FinalReport['recommendation'] =
    finalScore >= 80 ? 'strong_hire' : finalScore >= 65 ? 'hire' : finalScore >= 50 ? 'consider' : 'no_hire'

  const delta = input.round2.score - input.round1.score
  const trend =
    delta > 5
      ? 'The candidate improved from round 1 to round 2.'
      : delta < -5
        ? 'Performance declined from round 1 to round 2.'
        : 'Performance was consistent across both rounds.'

  return {
    finalScore,
    grade: gradeFromScore(finalScore),
    recommendation,
    summary:
      `Demo mode: the candidate finished the interview process for ${input.job.title} at ` +
      `${input.job.company} with a weighted final score of ${finalScore}/100 ` +
      `(resume ${input.weights.resume}%, round 1 ${input.weights.round1}%, round 2 ${input.weights.round2}%). ` +
      'Configure ANTHROPIC_API_KEY for a full AI-generated report.',
    roundComparison:
      `Round 1 (resume-focused) scored ${input.round1.score}/100 and round 2 (role-focused) scored ` +
      `${input.round2.score}/100. ${trend}`,
    strengths: dedupePoints([
      ...toFeedbackPoints(input.round1.strengths).slice(0, 2),
      ...toFeedbackPoints(input.round2.strengths).slice(0, 2),
    ]).slice(0, 4),
    risks: dedupePoints([
      ...toFeedbackPoints(input.round1.weaknesses).slice(0, 2),
      ...toFeedbackPoints(input.round2.weaknesses).slice(0, 2),
    ]).slice(0, 4),
    demoMode: true,
  }
}

/** Drop points that repeat an earlier title+detail (demo rounds share generic bullets). */
function dedupePoints(points: ReturnType<typeof toFeedbackPoints>) {
  const seen = new Set<string>()
  return points.filter((p) => {
    const key = `${p.title}|${p.detail}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
