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
  round1_pass_threshold?: number | null
  created_at: string
  updated_at: string
}

export type ApplicationStatus =
  | 'applied'
  | 'screened'
  | 'round1_in_progress'
  | 'round1_completed'
  | 'round2_available'
  | 'round2_in_progress'
  | 'round2_completed'
  | 'shortlisted'
  | 'rejected'
  | 'hired'

export interface Application {
  id: string
  job_id: string
  candidate_id: string
  resume_path: string
  resume_name: string
  resume_mime: string
  cover_letter?: string
  match_percentage?: number | null
  match_analysis?: any
  status: ApplicationStatus
  round1_score?: number | null
  round1_grade?: string | null
  round2_score?: number | null
  round2_grade?: string | null
  final_score?: number | null
  final_grade?: string | null
  final_report?: any
  applied_at: string
  reviewed_at?: string | null
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

// Candidate-facing job columns: deliberately omits recruiter_id and
// round1_pass_threshold (internal recruiter configuration).
const CANDIDATE_JOB_COLUMNS =
  'id, title, company, description, requirements, location, job_type, experience_level, salary_range, status, created_at, updated_at'

/**
 * Get all active jobs (candidate-facing — internal columns omitted)
 */
export async function getActiveJobs(): Promise<Job[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('jobs')
    .select(CANDIDATE_JOB_COLUMNS)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    throw new Error('Failed to fetch jobs')
  }

  // recruiter_id/round1_pass_threshold intentionally absent from these rows.
  return (data || []) as unknown as Job[]
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
    // Surface the Postgres error code so callers can map constraint
    // violations (e.g. 23505 unique job_id+candidate_id) to proper statuses.
    const err = new Error('Failed to create application') as Error & { code?: string }
    err.code = error.code
    throw err
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
      job:jobs(${CANDIDATE_JOB_COLUMNS})
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

/** Terminal / recruiter-decided statuses that pipeline writes must never clobber. */
export const TERMINAL_APPLICATION_STATUSES: ApplicationStatus[] = [
  'rejected',
  'hired',
  'shortlisted',
]

/**
 * Compare-and-set application update: applies `updates` only when the current
 * status is NOT a terminal recruiter decision (rejected/hired/shortlisted).
 * Returns the updated row, or null when the row was terminal (no rows matched)
 * — so a concurrent recruiter decision can never be overwritten.
 */
export async function updateApplicationUnlessTerminal(
  applicationId: string,
  updates: Partial<Application>
): Promise<Application | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', applicationId)
    .not('status', 'in', '("rejected","hired","shortlisted")')
    .select()
    .maybeSingle()

  if (error) {
    console.error('Error updating application (conditional):', error)
    throw new Error('Failed to update application')
  }

  return data ?? null
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
 * Best-effort removal of an uploaded resume object (cleanup on failed apply).
 * Never throws — logs a warning instead.
 */
export async function removeUploadedResume(path: string): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.storage.from('candidate-resumes').remove([path])
    if (error) {
      console.warn('Failed to remove uploaded resume:', path, error.message)
    }
  } catch (error) {
    console.warn('Failed to remove uploaded resume:', path, error)
  }
}

/**
 * Get a temporary signed URL for a resume (candidate-resumes is a private bucket)
 */
export async function getResumeUrl(path: string): Promise<string | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase.storage
    .from('candidate-resumes')
    .createSignedUrl(path, 3600)

  if (error) {
    console.error('Error signing resume URL:', error)
    return null
  }

  return data.signedUrl
}

/**
 * Download a resume's raw bytes (for AI analysis)
 */
export async function downloadResume(path: string): Promise<Buffer> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase.storage
    .from('candidate-resumes')
    .download(path)

  if (error || !data) {
    throw new Error(`Failed to download resume: ${error?.message ?? 'no data'}`)
  }

  return Buffer.from(await data.arrayBuffer())
}

/**
 * Count applications per job for a set of jobs
 */
export async function getApplicantCounts(jobIds: string[]): Promise<Record<string, number>> {
  if (jobIds.length === 0) return {}
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('applications')
    .select('job_id')
    .in('job_id', jobIds)

  if (error) {
    console.error('Error counting applicants:', error)
    return {}
  }

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.job_id] = (counts[row.job_id] ?? 0) + 1
  }
  return counts
}

/**
 * Delete a job (applications cascade via FK)
 */
export async function deleteJob(jobId: string): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from('jobs').delete().eq('id', jobId)

  if (error) {
    console.error('Error deleting job:', error)
    throw new Error('Failed to delete job')
  }
}

/**
 * Get all applications across a recruiter's jobs (with candidate + job info)
 */
export async function getApplicationsByRecruiter(
  recruiterId: string,
  jobId?: string
): Promise<Application[]> {
  const supabase = getSupabaseAdmin()

  let query = supabase
    .from('applications')
    .select(`
      *,
      job:jobs!inner(id, title, company, recruiter_id, round1_pass_threshold),
      candidate:users!applications_candidate_id_fkey(id, name, email)
    `)
    .eq('job.recruiter_id', recruiterId)
    .order('applied_at', { ascending: false })

  if (jobId) {
    query = query.eq('job_id', jobId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching recruiter applications:', error)
    throw new Error('Failed to fetch applications')
  }

  return data || []
}

/**
 * Lean variant for dashboards/analytics: same rows as
 * getApplicationsByRecruiter but WITHOUT the heavy jsonb/text payloads
 * (match_analysis, final_report, cover_letter, resume paths).
 */
export async function getApplicationsByRecruiterLean(
  recruiterId: string
): Promise<Application[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id, job_id, candidate_id, status, match_percentage,
      round1_score, round1_grade, round2_score, round2_grade,
      final_score, final_grade, applied_at, reviewed_at, resume_name,
      job:jobs!inner(id, title, company, recruiter_id, round1_pass_threshold),
      candidate:users!applications_candidate_id_fkey(id, name, email)
    `
    )
    .eq('job.recruiter_id', recruiterId)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Error fetching recruiter applications (lean):', error)
    throw new Error('Failed to fetch applications')
  }

  return (data || []) as unknown as Application[]
}

