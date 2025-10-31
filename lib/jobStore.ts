// Job and Application Store (Supabase)
import { getSupabaseAdmin } from './supabaseAdmin'

export interface Job {
  id: string
  recruiter_id: string
  title: string
  company: string
  description: string
  requirements: string
  requirements_document_path?: string
  requirements_document_name?: string
  location?: string
  job_type?: string
  experience_level?: string
  salary_range?: string
  status: 'active' | 'closed' | 'draft'
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  job_id: string
  candidate_id: string
  resume_path: string
  resume_name: string
  cover_letter?: string
  match_percentage?: number
  match_analysis?: any
  status: 'pending' | 'shortlisted' | 'rejected' | 'interview_scheduled' | 'hired'
  applied_at: string
  reviewed_at?: string
  created_at: string
}

/**
 * Create a new job posting
 */
export async function createJob(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('jobs')
    .insert([jobData])
    .select()
    .single()

  if (error) {
    console.error('Error creating job:', error)
    throw new Error('Failed to create job')
  }

  return data
}

/**
 * Get all active jobs
 */
export async function getActiveJobs(): Promise<Job[]> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    throw new Error('Failed to fetch jobs')
  }

  return data || []
}

/**
 * Get jobs by recruiter
 */
export async function getJobsByRecruiter(recruiterId: string): Promise<Job[]> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('recruiter_id', recruiterId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching recruiter jobs:', error)
    throw new Error('Failed to fetch jobs')
  }

  return data || []
}

/**
 * Get job by ID
 */
export async function getJobById(jobId: string): Promise<Job | null> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error) {
    console.error('Error fetching job:', error)
    return null
  }

  return data
}

/**
 * Update job
 */
export async function updateJob(jobId: string, updates: Partial<Job>): Promise<Job> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .select()
    .single()

  if (error) {
    console.error('Error updating job:', error)
    throw new Error('Failed to update job')
  }

  return data
}

/**
 * Create a job application
 */
export async function createApplication(
  applicationData: Omit<Application, 'id' | 'applied_at' | 'created_at'>
): Promise<Application> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('applications')
    .insert([applicationData])
    .select()
    .single()

  if (error) {
    console.error('Error creating application:', error)
    throw new Error('Failed to create application')
  }

  return data
}

/**
 * Get applications by candidate
 */
export async function getApplicationsByCandidate(candidateId: string): Promise<Application[]> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs(*)
    `)
    .eq('candidate_id', candidateId)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    throw new Error('Failed to fetch applications')
  }

  return data || []
}

/**
 * Get applications by job
 */
export async function getApplicationsByJob(jobId: string): Promise<Application[]> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      candidate:users!applications_candidate_id_fkey(id, name, email)
    `)
    .eq('job_id', jobId)
    .order('match_percentage', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Error fetching job applications:', error)
    throw new Error('Failed to fetch applications')
  }

  return data || []
}

/**
 * Get application by ID
 */
export async function getApplicationById(applicationId: string): Promise<Application | null> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (error) {
    console.error('Error fetching application:', error)
    return null
  }

  return data
}

/**
 * Update application (e.g., update match percentage, status)
 */
export async function updateApplication(
  applicationId: string,
  updates: Partial<Application>
): Promise<Application> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', applicationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating application:', error)
    throw new Error('Failed to update application')
  }

  return data
}

/**
 * Upload resume to Supabase Storage
 */
export async function uploadResume(
  candidateId: string,
  file: File
): Promise<{ path: string; name: string }> {
  const supabase = getSupabaseAdmin()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${candidateId}_${Date.now()}.${fileExt}`
  const filePath = `resumes/${fileName}`

  const { error } = await supabase.storage
    .from('candidate-resumes')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading resume:', error)
    throw new Error('Failed to upload resume')
  }

  return { path: filePath, name: file.name }
}

/**
 * Get resume download URL
 */
export async function getResumeUrl(path: string): Promise<string> {
  const supabase = getSupabaseAdmin()
  
  const { data } = supabase.storage
    .from('candidate-resumes')
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Extract text from resume file (basic implementation)
 * For production, consider using a PDF parsing library or service
 */
export async function extractResumeText(file: File): Promise<string> {
  // For now, return filename as placeholder
  // In production, use pdf-parse, mammoth, or similar libraries
  return `Resume file: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}`
}

