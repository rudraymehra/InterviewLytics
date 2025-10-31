// AI Service Integration (Groq/LLaMA)

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Call Groq API with streaming support
 */
export async function callGroqAI(
  messages: AIMessage[],
  model: string = 'llama-3.1-70b-versatile',
  temperature: number = 0.7
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

/**
 * Generate interview questions based on resume and job requirements
 */
export async function generateInterviewQuestions(
  resumeText: string,
  jobRequirements: string,
  jobTitle: string
): Promise<{
  resumeQuestions: Array<{ question: string; context: string }>
  jobQuestions: Array<{ question: string; context: string }>
}> {
  const systemPrompt = `You are an expert technical interviewer. Generate interview questions based on the candidate's resume and the job requirements.`

  const userPrompt = `
Job Title: ${jobTitle}

Job Requirements:
${jobRequirements}

Candidate Resume:
${resumeText}

Generate exactly 3 resume-based questions and 3 job requirement-based questions. Each question should be specific, thoughtful, and assess the candidate's skills and experience.

Return ONLY a valid JSON object in this exact format:
{
  "resumeQuestions": [
    {"question": "Question text here", "context": "Why this question is asked"},
    {"question": "Question text here", "context": "Why this question is asked"},
    {"question": "Question text here", "context": "Why this question is asked"}
  ],
  "jobQuestions": [
    {"question": "Question text here", "context": "Why this question is asked"},
    {"question": "Question text here", "context": "Why this question is asked"},
    {"question": "Question text here", "context": "Why this question is asked"}
  ]
}
`

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]

  const response = await callGroqAI(messages, 'llama-3.1-70b-versatile', 0.7)
  
  // Parse JSON response
  try {
    const parsed = JSON.parse(response)
    return parsed
  } catch (error) {
    console.error('Failed to parse AI response:', response)
    throw new Error('Failed to generate interview questions')
  }
}

/**
 * Generate a cross-question based on the candidate's answer
 */
export async function generateCrossQuestion(
  originalQuestion: string,
  candidateAnswer: string,
  context: string
): Promise<string> {
  const systemPrompt = `You are an expert interviewer conducting a follow-up question. Based on the candidate's answer, ask ONE relevant and insightful follow-up question to dig deeper.`

  const userPrompt = `
Original Question: ${originalQuestion}
Context: ${context}

Candidate's Answer: ${candidateAnswer}

Generate ONE follow-up/cross-question that probes deeper into their answer. The question should:
- Be specific to their response
- Assess their depth of knowledge
- Be clear and concise

Return ONLY the question text, nothing else.
`

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]

  return await callGroqAI(messages, 'llama-3.1-70b-versatile', 0.8)
}

/**
 * Evaluate a candidate's answer to an interview question
 */
export async function evaluateAnswer(
  question: string,
  answer: string,
  context: string,
  questionType: 'resume_based' | 'job_based' | 'cross_question'
): Promise<{
  score: number // 0-100
  feedback: string
  evaluation: {
    correctness: number
    clarity: number
    depth: number
    relevance: number
  }
}> {
  const systemPrompt = `You are an expert interviewer evaluating a candidate's response. Provide a fair, constructive assessment.`

  const userPrompt = `
Question Type: ${questionType}
Question: ${question}
Context: ${context}

Candidate's Answer: ${answer}

Evaluate the answer on these criteria (0-100 scale):
1. Correctness: How accurate is the answer?
2. Clarity: How clear and well-structured is the response?
3. Depth: How thorough is the explanation?
4. Relevance: How well does it address the question?

Provide an overall score (0-100) and constructive feedback.

Return ONLY a valid JSON object in this exact format:
{
  "score": 85,
  "feedback": "Your detailed feedback here",
  "evaluation": {
    "correctness": 90,
    "clarity": 85,
    "depth": 80,
    "relevance": 85
  }
}
`

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]

  const response = await callGroqAI(messages, 'llama-3.1-70b-versatile', 0.5)
  
  try {
    const parsed = JSON.parse(response)
    return parsed
  } catch (error) {
    console.error('Failed to parse evaluation response:', response)
    throw new Error('Failed to evaluate answer')
  }
}

/**
 * Generate overall interview feedback
 */
export async function generateOverallFeedback(
  questions: Array<{
    question: string
    answer: string
    score: number
    feedback: string
  }>
): Promise<{
  overallScore: number
  grade: string
  feedback: string
  strengths: string[]
  weaknesses: string[]
}> {
  const systemPrompt = `You are an expert interviewer providing final assessment. Be constructive, fair, and specific.`

  const avgScore = questions.reduce((sum, q) => sum + q.score, 0) / questions.length

  const userPrompt = `
The candidate completed an interview with ${questions.length} questions.
Average score: ${avgScore.toFixed(1)}

Individual Question Results:
${questions.map((q, i) => `
Q${i + 1}: ${q.question}
Answer: ${q.answer}
Score: ${q.score}
Feedback: ${q.feedback}
`).join('\n')}

Provide:
1. Overall score (0-100)
2. Grade (A, B, C, D, or F)
3. Overall feedback summary
4. Top 3 strengths
5. Top 3 areas for improvement

Return ONLY a valid JSON object in this exact format:
{
  "overallScore": 85,
  "grade": "B",
  "feedback": "Overall assessment here",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Area 1", "Area 2", "Area 3"]
}
`

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]

  const response = await callGroqAI(messages, 'llama-3.1-70b-versatile', 0.5)
  
  try {
    const parsed = JSON.parse(response)
    return parsed
  } catch (error) {
    console.error('Failed to parse feedback response:', response)
    throw new Error('Failed to generate overall feedback')
  }
}

/**
 * Analyze resume match with job requirements
 */
export async function analyzeResumeMatch(
  resumeText: string,
  jobRequirements: string,
  jobTitle: string
): Promise<{
  matchPercentage: number
  analysis: {
    matched_skills: string[]
    missing_skills: string[]
    experience_match: string
    overall_assessment: string
  }
}> {
  const systemPrompt = `You are an expert recruiter analyzing resume-job fit. Be objective and thorough.`

  const userPrompt = `
Job Title: ${jobTitle}

Job Requirements:
${jobRequirements}

Candidate Resume:
${resumeText}

Analyze how well this resume matches the job requirements. Consider:
- Skills match
- Experience level
- Relevant background
- Overall fit

Provide:
1. Match percentage (0-100)
2. List of matched skills
3. List of missing skills
4. Experience match assessment
5. Overall assessment

Return ONLY a valid JSON object in this exact format:
{
  "matchPercentage": 75,
  "analysis": {
    "matched_skills": ["Skill 1", "Skill 2"],
    "missing_skills": ["Skill 1", "Skill 2"],
    "experience_match": "Brief assessment of experience level fit",
    "overall_assessment": "Overall fit assessment"
  }
}
`

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]

  const response = await callGroqAI(messages, 'llama-3.1-70b-versatile', 0.5)
  
  try {
    const parsed = JSON.parse(response)
    return parsed
  } catch (error) {
    console.error('Failed to parse match analysis:', response)
    throw new Error('Failed to analyze resume match')
  }
}

