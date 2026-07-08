// Interview Session Store (Supabase)
import { getSupabaseAdmin } from './supabaseAdmin'
import type { FeedbackPoint } from './ai/types'

export interface InterviewSession {
  id: string
  application_id: string
  candidate_id: string
  job_id: string
  round: 1 | 2
  status: 'in_progress' | 'completed' | 'abandoned'
  overall_score?: number
  overall_grade?: string
  overall_feedback?: string
  // jsonb columns — new rows hold FeedbackPoint[]; legacy rows may still hold
  // plain strings at runtime, so consumers normalize via toFeedbackPoints.
  strengths?: FeedbackPoint[]
  weaknesses?: FeedbackPoint[]
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
  jobId: string,
  round: 1 | 2
): Promise<InterviewSession> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('interview_sessions')
    .insert([{
      application_id: applicationId,
      candidate_id: candidateId,
      job_id: jobId,
      round,
      status: 'in_progress',
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating interview session:', error)
    // Surface the Postgres error code (e.g. 23505 unique violation when two
    // concurrent starts race) so callers can recover instead of failing.
    const err = new Error('Failed to create interview session') as Error & { code?: string }
    err.code = error.code
    throw err
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
 * Bulk-insert interview questions in a single statement (avoids a sequential
 * insert loop when seeding a round's questions).
 */
export async function addInterviewQuestions(
  questionRows: Array<Omit<InterviewQuestion, 'id' | 'created_at'>>
): Promise<InterviewQuestion[]> {
  if (questionRows.length === 0) return []
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('interview_questions')
    .insert(questionRows)
    .select()

  if (error) {
    console.error('Error adding interview questions:', error)
    throw new Error('Failed to add interview questions')
  }

  return (data || []).sort((a, b) => a.question_number - b.question_number)
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
    strengths: FeedbackPoint[]
    weaknesses: FeedbackPoint[]
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
 * Mark any in_progress sessions for an application as abandoned (e.g. when a
 * recruiter makes a terminal decision mid-interview). Best-effort: logs on
 * failure rather than throwing so the status change itself still succeeds.
 */
export async function abandonInProgressSessions(applicationId: string): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('interview_sessions')
    .update({ status: 'abandoned', completed_at: new Date().toISOString() })
    .eq('application_id', applicationId)
    .eq('status', 'in_progress')

  if (error) {
    console.warn('Failed to abandon in-progress sessions for application', applicationId, error.message)
  }
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
 * Get sessions for an application (both rounds), oldest first
 */
export async function getSessionsByApplication(applicationId: string): Promise<InterviewSession[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('application_id', applicationId)
    .in('status', ['in_progress', 'completed'])
    .order('round', { ascending: true })

  if (error) {
    console.error('Error fetching application sessions:', error)
    return []
  }

  return data || []
}

/**
 * Get the active or completed session for an application + round
 */
export async function getSessionByApplicationAndRound(
  applicationId: string,
  round: 1 | 2
): Promise<InterviewSession | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('application_id', applicationId)
    .eq('round', round)
    .in('status', ['in_progress', 'completed'])
    .maybeSingle()

  if (error) {
    console.error('Error fetching session by round:', error)
    return null
  }

  return data
}

