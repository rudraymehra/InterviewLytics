import { getSupabaseAdmin } from './supabaseAdmin'

export type ApplicationStatus = 'pending' | 'shortlisted' | 'rejected' | 'hired'

export interface ApplicationRecord {
  id: string
  user_id: string
  job_title: string
  company: string
  status: ApplicationStatus
  score?: number | null
  applied_at: string
  created_at?: string
}

export interface InterviewRecord {
  id: string
  user_id: string
  title: string
  company: string
  interview_type?: string | null
  scheduled_at: string
  meeting_link?: string | null
  created_at?: string
}

export async function getApplicationsForUser(userId: string): Promise<ApplicationRecord[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from<ApplicationRecord>('applications')
    .select('*')
    .eq('user_id', userId)
    .order('applied_at', { ascending: false })

  if (error) {
    throw new Error(`Unable to fetch applications: ${error.message}`)
  }

  return data ?? []
}

export async function getUpcomingInterviewsForUser(userId: string): Promise<InterviewRecord[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from<InterviewRecord>('interviews')
    .select('*')
    .eq('user_id', userId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    throw new Error(`Unable to fetch interviews: ${error.message}`)
  }

  return data ?? []
}




