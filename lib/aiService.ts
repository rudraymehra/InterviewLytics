// AI service layer for InterviewLytics — Claude (Anthropic) implementation.
//
// Every function degrades gracefully to a deterministic demo-mode fallback
// when ANTHROPIC_API_KEY is not configured or the API call fails.

import type Anthropic from '@anthropic-ai/sdk'
import { MODEL, aiEnabled, getClient } from './ai/client'
import {
  fallbackCrossQuestion,
  fallbackEvaluate,
  fallbackFinalReport,
  fallbackMatch,
  fallbackRound1Questions,
  fallbackRound2Questions,
  fallbackRoundFeedback,
} from './ai/fallback'
import { extractResumeText, getResumeContentBlocks } from './ai/resume'
import {
  EVALUATION_SCHEMA,
  FINAL_REPORT_SCHEMA,
  MATCH_SCHEMA,
  QUESTIONS_SCHEMA,
  ROUND_FEEDBACK_SCHEMA,
} from './ai/schemas'
import {
  AnswerEvaluation,
  AnsweredQuestion,
  FinalReport,
  FinalReportInput,
  GeneratedQuestion,
  JobInput,
  MatchResult,
  ResumeInput,
  RoundFeedback,
  clampScore,
  gradeFromScore,
} from './ai/types'

export * from './ai/types'
export { aiEnabled } from './ai/client'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function messageText(msg: Anthropic.Message): string {
  const block = msg.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') {
    throw new Error('No text block in model response')
  }
  return block.text
}

function clampDim(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(n)) return 5
  return Math.max(0, Math.min(10, Math.round(n)))
}

function jobBlock(job: JobInput): string {
  return [
    `JOB TITLE: ${job.title}`,
    `COMPANY: ${job.company}`,
    `JOB DESCRIPTION:\n${job.description}`,
    `REQUIREMENTS:\n${job.requirements}`,
  ].join('\n\n')
}

async function safeResumeText(resume: ResumeInput): Promise<string | null> {
  try {
    return await extractResumeText(resume)
  } catch {
    return null
  }
}

/** Ensure exactly 5 questions, topping up from a fallback set if needed. */
function exactlyFive(
  questions: GeneratedQuestion[],
  backfill: GeneratedQuestion[]
): GeneratedQuestion[] {
  const result = questions
    .filter((q) => q && typeof q.question === 'string' && q.question.trim().length > 0)
    .map((q) => ({ question: q.question.trim(), context: (q.context || '').trim() }))
    .slice(0, 5)
  let i = 0
  while (result.length < 5 && i < backfill.length) {
    result.push(backfill[i])
    i++
  }
  return result
}

// ---------------------------------------------------------------------------
// Resume ↔ job match analysis
// ---------------------------------------------------------------------------

export async function analyzeResumeMatch(resume: ResumeInput, job: JobInput): Promise<MatchResult> {
  if (!aiEnabled()) {
    return fallbackMatch(await safeResumeText(resume), job)
  }

  try {
    const prompt = `You are an experienced technical recruiter screening a candidate's resume for the following role.

${jobBlock(job)}

Analyze how well the resume above matches this job. Consider skill coverage, depth and recency of experience, seniority fit, and domain relevance. Be objective and rigorous — do not inflate the match.

Return:
- matchPercentage: an integer from 0 to 100
- matchedSkills: required skills clearly evidenced in the resume
- missingSkills: required skills not evidenced in the resume
- summary: a concise (2-4 sentence) objective assessment of overall fit`

    const content = await getResumeContentBlocks(resume, prompt)
    const client = getClient()
    const msg = (await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: MATCH_SCHEMA },
      },
      messages: [{ role: 'user', content }],
    } as any)) as Anthropic.Message

    const parsed = JSON.parse(messageText(msg))
    return {
      matchPercentage: clampScore(parsed.matchPercentage, 50),
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      summary: String(parsed.summary || ''),
    }
  } catch (err) {
    console.warn('[aiService] falling back:', err)
    return fallbackMatch(await safeResumeText(resume), job)
  }
}

// ---------------------------------------------------------------------------
// Question generation
// ---------------------------------------------------------------------------

export async function generateRound1Questions(
  resume: ResumeInput,
  job: JobInput
): Promise<GeneratedQuestion[]> {
  if (!aiEnabled()) return fallbackRound1Questions(job)

  try {
    const prompt = `You are a professional interviewer preparing ROUND 1 of a two-round interview for the role below. Round 1 is RESUME-FOCUSED: it probes the candidate's actual background as stated on their resume.

${jobBlock(job)}

Using the resume above, generate exactly 5 interview questions. The questions must:
- Reference specific projects, roles, technologies, or claims from the resume (not generic templates)
- Probe authenticity and depth: what the candidate personally did, decisions they made, measurable outcomes
- Cover different parts of the resume (projects, experience, skill claims) rather than one item repeatedly
- Be open-ended and answerable verbally in 1-3 minutes
- Where relevant, connect a resume item to what the role requires

For each question, include a short interviewer-facing "context" explaining why the question is asked and what a strong answer demonstrates.`

    const content = await getResumeContentBlocks(resume, prompt)
    const client = getClient()
    const msg = (await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'high',
        format: { type: 'json_schema', schema: QUESTIONS_SCHEMA },
      },
      messages: [{ role: 'user', content }],
    } as any)) as Anthropic.Message

    const parsed = JSON.parse(messageText(msg))
    return exactlyFive(parsed.questions || [], fallbackRound1Questions(job))
  } catch (err) {
    console.warn('[aiService] falling back:', err)
    return fallbackRound1Questions(job)
  }
}

export async function generateRound2Questions(
  job: JobInput,
  round1Summary: string
): Promise<GeneratedQuestion[]> {
  if (!aiEnabled()) return fallbackRound2Questions(job)

  try {
    const prompt = `You are a professional interviewer preparing ROUND 2 of a two-round interview for the role below. Round 2 is JOB-FOCUSED: scenario and technical questions testing whether the candidate can actually do this job.

${jobBlock(job)}

ROUND 1 SUMMARY (the candidate's performance so far):
${round1Summary}

Generate exactly 5 interview questions. The questions must:
- Be grounded in the job requirements and description above: realistic scenarios, technical problems, and role-specific judgment calls
- Use the round 1 summary to avoid repeating topics already covered, and to deliberately target areas where the candidate was weak, vague, or untested
- Include at least one scenario question ("Imagine you're in this role and...") and at least one question testing depth on a core requirement
- Be open-ended and answerable verbally in 1-3 minutes

For each question, include a short interviewer-facing "context" explaining why the question is asked and what a strong answer demonstrates.`

    const client = getClient()
    const msg = (await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'high',
        format: { type: 'json_schema', schema: QUESTIONS_SCHEMA },
      },
      messages: [{ role: 'user', content: prompt }],
    } as any)) as Anthropic.Message

    const parsed = JSON.parse(messageText(msg))
    return exactlyFive(parsed.questions || [], fallbackRound2Questions(job))
  } catch (err) {
    console.warn('[aiService] falling back:', err)
    return fallbackRound2Questions(job)
  }
}

// ---------------------------------------------------------------------------
// Cross-question (follow-up)
// ---------------------------------------------------------------------------

export async function generateCrossQuestion(
  question: string,
  answer: string,
  context: string
): Promise<string> {
  if (!aiEnabled()) return fallbackCrossQuestion(question)

  try {
    const prompt = `You are a professional interviewer. The candidate just answered a question; ask ONE incisive follow-up that digs deeper into their answer.

ORIGINAL QUESTION: ${question}

QUESTION CONTEXT: ${context}

CANDIDATE'S ANSWER: ${answer}

The follow-up must be specific to their answer (probe a vague claim, an unexplained decision, or a missing outcome), concise, and answerable verbally. Return ONLY the follow-up question text — no preamble, no quotes, no explanation.`

    const client = getClient()
    const msg = (await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      output_config: { effort: 'low' },
      messages: [{ role: 'user', content: prompt }],
    } as any)) as Anthropic.Message

    const text = messageText(msg).trim()
    if (!text) throw new Error('Empty cross-question response')
    return text
  } catch (err) {
    console.warn('[aiService] falling back:', err)
    return fallbackCrossQuestion(question)
  }
}

// ---------------------------------------------------------------------------
// Answer evaluation
// ---------------------------------------------------------------------------

export async function evaluateAnswer(
  question: string,
  answer: string,
  job: JobInput,
  questionType: string
): Promise<AnswerEvaluation> {
  if (!aiEnabled()) return fallbackEvaluate(answer)

  try {
    const prompt = `You are a professional interviewer evaluating a candidate's answer for the ${job.title} role at ${job.company}.

JOB REQUIREMENTS (for reference):
${job.requirements}

QUESTION TYPE: ${questionType}
QUESTION: ${question}

CANDIDATE'S ANSWER: ${answer}

Score the answer:
- score: overall 0-100
- evaluation dimensions, each 0-10: correctness (accuracy), clarity (structure and communication), depth (thoroughness, specifics, outcomes), relevance (does it actually answer the question)
- feedback: 2-4 sentences of constructive, specific feedback

Be fair but rigorous. Reward concrete specifics, sound reasoning, and measurable outcomes. Penalize evasive, generic, off-topic, or empty answers heavily — a non-answer should score very low.`

    const client = getClient()
    const msg = (await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema: EVALUATION_SCHEMA },
      },
      messages: [{ role: 'user', content: prompt }],
    } as any)) as Anthropic.Message

    const parsed = JSON.parse(messageText(msg))
    return {
      score: clampScore(parsed.score),
      feedback: String(parsed.feedback || ''),
      evaluation: {
        correctness: clampDim(parsed.evaluation?.correctness),
        clarity: clampDim(parsed.evaluation?.clarity),
        depth: clampDim(parsed.evaluation?.depth),
        relevance: clampDim(parsed.evaluation?.relevance),
      },
    }
  } catch (err) {
    console.warn('[aiService] falling back:', err)
    return fallbackEvaluate(answer)
  }
}

// ---------------------------------------------------------------------------
// Round feedback
// ---------------------------------------------------------------------------

export async function generateRoundFeedback(
  round: 1 | 2,
  job: JobInput,
  questions: AnsweredQuestion[]
): Promise<RoundFeedback> {
  if (!aiEnabled()) return fallbackRoundFeedback(questions)

  try {
    const roundFocus =
      round === 1
        ? 'Round 1 was resume-focused: questions probed the candidate’s stated background, projects, and skill claims.'
        : 'Round 2 was job-focused: scenario and technical questions tested fitness for the role itself.'

    const transcript = questions
      .map(
        (q, i) =>
          `Q${i + 1} (${q.questionType}): ${q.question}\n` +
          `Answer: ${q.answer}\n` +
          `Score: ${q.score === null ? 'not scored' : `${q.score}/100`}`
      )
      .join('\n\n')

    const prompt = `You are a professional interviewer writing the summary assessment for round ${round} of an interview for the ${job.title} role at ${job.company}. ${roundFocus}

JOB REQUIREMENTS (for reference):
${job.requirements}

TRANSCRIPT WITH PER-QUESTION SCORES:
${transcript}

Write the round assessment:
- score: overall round score 0-100, consistent with (but not necessarily a plain average of) the per-question scores
- feedback: 3-5 sentences summarizing performance this round
- strengths: 2-4 specific strengths, grounded in actual answers
- weaknesses: 2-4 specific areas for improvement, grounded in actual answers

Be fair but rigorous, and specific rather than generic.`

    const client = getClient()
    const msg = (await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: ROUND_FEEDBACK_SCHEMA },
      },
      messages: [{ role: 'user', content: prompt }],
    } as any)) as Anthropic.Message

    const parsed = JSON.parse(messageText(msg))
    const score = clampScore(parsed.score)
    return {
      score,
      grade: gradeFromScore(score),
      feedback: String(parsed.feedback || ''),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    }
  } catch (err) {
    console.warn('[aiService] falling back:', err)
    return fallbackRoundFeedback(questions)
  }
}

// ---------------------------------------------------------------------------
// Final report
// ---------------------------------------------------------------------------

export async function generateFinalReport(input: FinalReportInput): Promise<FinalReport> {
  if (!aiEnabled()) return fallbackFinalReport(input)

  try {
    const { job, matchPercentage, round1, round2, weights, finalScore } = input

    const prompt = `You are a senior hiring panel member writing the final report for a completed two-round interview for the ${job.title} role at ${job.company}.

${jobBlock(job)}

PROCESS RESULTS:
- Resume match: ${matchPercentage === null ? 'not assessed' : `${matchPercentage}%`}
- Round 1 (resume-focused) score: ${round1.score}/100
  Feedback: ${round1.feedback}
  Strengths: ${round1.strengths.join('; ') || 'n/a'}
  Weaknesses: ${round1.weaknesses.join('; ') || 'n/a'}
- Round 2 (job-focused) score: ${round2.score}/100
  Feedback: ${round2.feedback}
  Strengths: ${round2.strengths.join('; ') || 'n/a'}
  Weaknesses: ${round2.weaknesses.join('; ') || 'n/a'}
- Scoring weights: resume ${weights.resume}%, round 1 ${weights.round1}%, round 2 ${weights.round2}%
- FINAL WEIGHTED SCORE (pre-computed, do NOT recompute): ${finalScore}/100

Write the final report:
- recommendation: strong_hire, hire, consider, or no_hire — consistent with the final score and the evidence above (as a guideline: >=80 strong_hire, >=65 hire, >=50 consider, below that no_hire, adjusted by your judgment of the evidence)
- summary: an executive summary of the candidate across the full process, written for a hiring manager
- roundComparison: how performance compared between round 1 and round 2, and what the trajectory suggests
- strengths: top 3-5 strengths across the whole process
- risks: top 3-5 risks or concerns a hiring manager should weigh

Be balanced, evidence-based, and specific to this candidate and role.`

    const client = getClient()
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 8192,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'high',
        format: { type: 'json_schema', schema: FINAL_REPORT_SCHEMA },
      },
      messages: [{ role: 'user', content: prompt }],
    } as any)
    const msg = (await stream.finalMessage()) as Anthropic.Message

    const parsed = JSON.parse(messageText(msg))
    const validRecommendations: FinalReport['recommendation'][] = [
      'strong_hire',
      'hire',
      'consider',
      'no_hire',
    ]
    const recommendation = validRecommendations.includes(parsed.recommendation)
      ? (parsed.recommendation as FinalReport['recommendation'])
      : fallbackFinalReport(input).recommendation

    const clampedFinal = clampScore(finalScore)
    return {
      finalScore: clampedFinal,
      grade: gradeFromScore(clampedFinal),
      recommendation,
      summary: String(parsed.summary || ''),
      roundComparison: String(parsed.roundComparison || ''),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
    }
  } catch (err) {
    console.warn('[aiService] falling back:', err)
    return fallbackFinalReport(input)
  }
}
