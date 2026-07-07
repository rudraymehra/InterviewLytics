// JSON schemas for structured outputs (output_config.format).
//
// Rules for these schemas (per structured-outputs support):
// - Every object has `additionalProperties: false` and a `required` array
//   listing all properties.
// - No numeric minimum/maximum or string-length constraints (unsupported) —
//   ranges live in the prompt text and values are clamped in code.

export const MATCH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['matchPercentage', 'matchedSkills', 'missingSkills', 'summary'],
  properties: {
    matchPercentage: {
      type: 'integer',
      description: 'Overall resume-to-job match percentage, from 0 to 100.',
    },
    matchedSkills: {
      type: 'array',
      description: 'Required skills clearly evidenced in the resume.',
      items: { type: 'string' },
    },
    missingSkills: {
      type: 'array',
      description: 'Required skills not evidenced in the resume.',
      items: { type: 'string' },
    },
    summary: {
      type: 'string',
      description: 'Concise, objective assessment of overall fit (2-4 sentences).',
    },
  },
} as const

export const QUESTIONS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      description: 'Exactly 5 interview questions.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['question', 'context'],
        properties: {
          question: {
            type: 'string',
            description: 'The interview question, phrased directly to the candidate.',
          },
          context: {
            type: 'string',
            description:
              'Why this question is being asked and what a strong answer demonstrates (interviewer-facing).',
          },
        },
      },
    },
  },
} as const

export const EVALUATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'feedback', 'evaluation'],
  properties: {
    score: {
      type: 'integer',
      description: 'Overall answer score, from 0 to 100.',
    },
    feedback: {
      type: 'string',
      description: 'Constructive, specific feedback on the answer (2-4 sentences).',
    },
    evaluation: {
      type: 'object',
      additionalProperties: false,
      required: ['correctness', 'clarity', 'depth', 'relevance'],
      properties: {
        correctness: { type: 'integer', description: 'Accuracy of the answer, 0 to 10.' },
        clarity: { type: 'integer', description: 'Clarity and structure, 0 to 10.' },
        depth: { type: 'integer', description: 'Thoroughness and depth, 0 to 10.' },
        relevance: { type: 'integer', description: 'How well it addresses the question, 0 to 10.' },
      },
    },
  },
} as const

export const ROUND_FEEDBACK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'feedback', 'strengths', 'weaknesses'],
  properties: {
    score: {
      type: 'integer',
      description: 'Overall round score, from 0 to 100, consistent with the per-question scores.',
    },
    feedback: {
      type: 'string',
      description: 'Overall assessment of the candidate performance this round (3-5 sentences).',
    },
    strengths: {
      type: 'array',
      description: 'Top 2-4 specific strengths demonstrated this round.',
      items: { type: 'string' },
    },
    weaknesses: {
      type: 'array',
      description: 'Top 2-4 specific areas for improvement from this round.',
      items: { type: 'string' },
    },
  },
} as const

export const FINAL_REPORT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['recommendation', 'summary', 'roundComparison', 'strengths', 'risks'],
  properties: {
    recommendation: {
      type: 'string',
      enum: ['strong_hire', 'hire', 'consider', 'no_hire'],
      description: 'Hiring recommendation consistent with the final score and round performance.',
    },
    summary: {
      type: 'string',
      description: 'Executive summary of the candidate across the full interview process.',
    },
    roundComparison: {
      type: 'string',
      description:
        'Comparison of round 1 (resume-focused) vs round 2 (role-focused) performance and trajectory.',
    },
    strengths: {
      type: 'array',
      description: 'Top 3-5 strengths across the whole process.',
      items: { type: 'string' },
    },
    risks: {
      type: 'array',
      description: 'Top 3-5 risks or concerns a hiring manager should weigh.',
      items: { type: 'string' },
    },
  },
} as const
