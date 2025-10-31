// Interview Session Store (Supabase)
import { getSupabaseAdmin } from './supabaseAdmin'

export interface InterviewSession {
  id: string
  application_id: string
  candidate_id: string
  job_id: string
  status: 'in_progress' | 'completed' | 'abandoned'
  overall_score?: number
  overall_grade?: string
  overall_feedback?: string
  strengths?: string[]
  weaknesses?: string[]
  started_at: string
  completed_at?: string
  created_at: string
}

export interface InterviewQuestion {
  id: string
  session_id: string
  question_number: number
  question_type: 'resume_based' | 'job_based' | 'cross_question'
  parent_question_id?: string
  question_text: string
  context?: string
  candidate_answer?: string
  answer_score?: number
  answer_feedback?: string
  answer_evaluation?: any
  answered_at?: string
  created_at: string
}

/**
 * Create a new interview session
 */
export async function createInterviewSession(
  applicationId: string,
  candidateId: string,
  jobId: string
): Promise<InterviewSession> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert([{
      application_id: applicationId,
      candidate_id: candidateId,
      job_id: jobId,
      status: 'in_progress',
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating interview session:', error)
    throw new Error('Failed to create interview session')
  }

  return data
}

/**
 * Get interview session by ID
 */
export async function getInterviewSession(sessionId: string): Promise<InterviewSession | null> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error fetching interview session:', error)
    return null
  }

  return data
}

/**
 * Get interview session with all questions
 */
export async function getInterviewSessionWithQuestions(
  sessionId: string
): Promise<{ session: InterviewSession; questions: InterviewQuestion[] } | null> {
  const supabase = getSupabaseAdmin()
  
  const { data: session, error: sessionError } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    console.error('Error fetching interview session:', sessionError)
    return null
  }

  const { data: questions, error: questionsError } = await supabase
    .from('interview_questions')
    .select('*')
    .eq('session_id', sessionId)
    .order('question_number', { ascending: true })

  if (questionsError) {
    console.error('Error fetching questions:', questionsError)
    return { session, questions: [] }
  }

  return { session, questions: questions || [] }
}

/**
 * Add a question to the interview session
 */
export async function addInterviewQuestion(
  questionData: Omit<InterviewQuestion, 'id' | 'created_at'>
): Promise<InterviewQuestion> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('interview_questions')
    .insert([questionData])
    .select()
    .single()

  if (error) {
    console.error('Error adding interview question:', error)
    throw new Error('Failed to add interview question')
  }

  return data
}

/**
 * Update interview question with answer and evaluation
 */
export async function updateInterviewQuestion(
  questionId: string,
  updates: Partial<InterviewQuestion>
): Promise<InterviewQuestion> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('interview_questions')
    .update(updates)
    .eq('id', questionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating interview question:', error)
    throw new Error('Failed to update interview question')
  }

  return data
}

/**
 * Complete interview session with final results
 */
export async function completeInterviewSession(
  sessionId: string,
  results: {
    overall_score: number
    overall_grade: string
    overall_feedback: string
    strengths: string[]
    weaknesses: string[]
  }
): Promise<InterviewSession> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('interview_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      ...results,
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    console.error('Error completing interview session:', error)
    throw new Error('Failed to complete interview session')
  }

  return data
}

/**
 * Get interview sessions by candidate
 */
export async function getInterviewSessionsByCandidate(
  candidateId: string
): Promise<InterviewSession[]> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('interview_sessions')
    .select(`
      *,
      job:jobs(title, company)
    `)
    .eq('candidate_id', candidateId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Error fetching candidate interview sessions:', error)
    throw new Error('Failed to fetch interview sessions')
  }

  return data || []
}

/**
 * Get interview sessions by job (for recruiter)
 */
export async function getInterviewSessionsByJob(jobId: string): Promise<InterviewSession[]> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('interview_sessions')
    .select(`
      *,
      candidate:users!interview_sessions_candidate_id_fkey(id, name, email)
    `)
    .eq('job_id', jobId)
    .eq('status', 'completed')
    .order('overall_score', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Error fetching job interview sessions:', error)
    throw new Error('Failed to fetch interview sessions')
  }

  return data || []
}

/**
 * Schedule an interview (creates interview record)
 */
export async function scheduleInterview(data: {
  application_id?: string
  candidate_id: string
  recruiter_id?: string
  job_id?: string
  title: string
  company: string
  interview_type: string
  scheduled_at: string
  meeting_link?: string
}): Promise<any> {
  const supabase = getSupabaseAdmin()
  
  const { data: interview, error } = await supabase
    .from('interviews')
    .insert([data])
    .select()
    .single()

  if (error) {
    console.error('Error scheduling interview:', error)
    throw new Error('Failed to schedule interview')
  }

  return interview
}

/**
 * Get upcoming interviews for candidate
 */
export async function getUpcomingInterviews(candidateId: string): Promise<any[]> {
  const supabase = getSupabaseAdmin()
  
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('candidate_id', candidateId)
    .gte('scheduled_at', now)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
    .limit(5)

  if (error) {
    console.error('Error fetching upcoming interviews:', error)
    return []
  }

  return data || []
}

/**
 * Link interview session to scheduled interview
 */
export async function linkInterviewSession(
  interviewId: string,
  sessionId: string
): Promise<void> {
  const supabase = getSupabaseAdmin()
  
  const { error } = await supabase
    .from('interviews')
    .update({ session_id: sessionId, status: 'completed' })
    .eq('id', interviewId)

  if (error) {
    console.error('Error linking interview session:', error)
    throw new Error('Failed to link interview session')
  }
}

