/**
 * Warm-up (small talk) questions — static banks, no AI call, instant.
 *
 * Warm-ups are stored with question_number 0 (sorts before the mains),
 * question_type matching the round's main type (the DB check constraint only
 * allows resume_based/job_based/cross_question), and context 'warmup'.
 * They are never cross-questioned and never count toward scoring.
 */

const WARMUP_CONTEXT = 'warmup'

/** Round-1 openers; the {company}/{title} question is always the second pick. */
const ROUND1_OPENERS = [
  'Hi! Before we dive in — how has your day been so far?',
  "Where are you joining from today, and what's the weather like there?",
  'Tell me a little about yourself outside of your resume.',
  'How are you feeling about the interview today?',
]

const ROUND2_WARMUPS = [
  "Welcome back! How did Round 1 feel — anything you've been thinking about since?",
]

export function getWarmupQuestions(
  round: 1 | 2,
  job: { title: string; company: string }
): Array<{ question: string; context: string }> {
  if (round === 2) {
    return ROUND2_WARMUPS.map((question) => ({ question, context: WARMUP_CONTEXT }))
  }
  const opener = ROUND1_OPENERS[Math.floor(Math.random() * ROUND1_OPENERS.length)]
  const companyQuestion = `What do you know about ${job.company}, and what drew you to this ${job.title} role?`
  return [
    { question: opener, context: WARMUP_CONTEXT },
    { question: companyQuestion, context: WARMUP_CONTEXT },
  ]
}
