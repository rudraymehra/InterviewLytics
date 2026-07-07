// Typed API client for InterviewLytics internal API routes.
// Reads the JWT from localStorage directly so calls are safe to fire from any
// component without depending on AuthContext state timing.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  // Don't set Content-Type for FormData — the browser sets the multipart boundary.
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = json?.error || json?.message || `Request failed (${res.status})`
    throw new ApiError(message, res.status)
  }

  return (json?.data !== undefined ? json.data : json) as T
}

// ---------- Shared types ----------

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

export interface Job {
  id: string
  recruiter_id: string
  title: string
  company: string
  description: string
  requirements: string
  location?: string
  job_type?: string
  experience_level?: string
  salary_range?: string
  status: 'active' | 'closed' | 'draft'
  round1_pass_threshold?: number | null
  applicant_count?: number
  created_at: string
  updated_at: string
}

export interface MatchAnalysis {
  matchedSkills?: string[]
  missingSkills?: string[]
  summary?: string
  demoMode?: boolean
}

export interface FinalReport {
  finalScore: number
  grade: string
  recommendation: 'strong_hire' | 'hire' | 'consider' | 'no_hire'
  summary: string
  roundComparison: string
  strengths: string[]
  risks: string[]
  demoMode?: boolean
}

export interface Application {
  id: string
  job_id: string
  candidate_id: string
  resume_path: string
  resume_name: string
  resume_mime?: string
  cover_letter?: string
  match_percentage?: number | null
  match_analysis?: MatchAnalysis | null
  status: ApplicationStatus
  round1_score?: number | null
  round1_grade?: string | null
  round2_score?: number | null
  round2_grade?: string | null
  final_score?: number | null
  final_grade?: string | null
  final_report?: FinalReport | null
  applied_at: string
  reviewed_at?: string | null
  job?: Job
  candidate?: { id: string; name: string; email: string }
}

export interface InterviewSession {
  id: string
  application_id: string
  candidate_id: string
  job_id: string
  round: 1 | 2
  status: 'in_progress' | 'completed' | 'abandoned'
  overall_score?: number | null
  overall_grade?: string | null
  overall_feedback?: string | null
  strengths?: string[] | null
  weaknesses?: string[] | null
  started_at: string
  completed_at?: string | null
}

export interface InterviewQuestion {
  id: string
  session_id: string
  question_number: number
  question_type: 'resume_based' | 'job_based' | 'cross_question'
  parent_question_id?: string | null
  question_text: string
  context?: string | null
  candidate_answer?: string | null
  answer_score?: number | null
  answer_feedback?: string | null
  answer_evaluation?: {
    correctness?: number
    clarity?: number
    depth?: number
    relevance?: number
  } | null
  answered_at?: string | null
}

export interface SessionDetail {
  session: InterviewSession
  questions: InterviewQuestion[]
  job?: Job
}

export interface ApplicationDetail extends Application {
  resume_url?: string
  rounds: SessionDetail[]
}

export interface AnswerResult {
  question: InterviewQuestion
  crossQuestion?: InterviewQuestion
  remaining: number
}

export interface CompleteResult {
  session: InterviewSession
  application: Application
  advanced: boolean
  passThreshold: number
}

export interface CandidateDashboard {
  stats: {
    totalApplications: number
    interviewsCompleted: number
    inProgress: number
    offers: number
  }
  nextActions: Array<{
    applicationId: string
    jobTitle: string
    company: string
    status: ApplicationStatus
    round?: 1 | 2
    label: string
  }>
  recentApplications: Application[]
}

export interface RecruiterDashboard {
  stats: {
    activeJobs: number
    totalApplicants: number
    interviewsCompleted: number
    hired: number
  }
  pipeline: Record<string, number>
  recentApplicants: Application[]
}

export interface RecruiterAnalytics {
  totalCandidates: number
  averageMatchScore: number | null
  round1PassRate: number | null
  hiredCount: number
  scoreDistribution: Array<{ range: string; count: number }>
  pipeline: Record<string, number>
  applicationsPerJob: Array<{ jobId: string; title: string; count: number }>
}

// ---------- APIs ----------

export const jobsApi = {
  /** Active jobs for candidates; pass recruiter=true to get own jobs with applicant counts. */
  list: (opts?: { recruiter?: boolean }) =>
    request<{ jobs: Job[] }>(`/jobs${opts?.recruiter ? '?recruiter=true' : ''}`),
  get: (jobId: string) => request<{ job: Job }>(`/jobs/${jobId}`),
  create: (job: Partial<Job>) =>
    request<{ job: Job }>(`/jobs`, { method: 'POST', body: JSON.stringify(job) }),
  update: (jobId: string, updates: Partial<Job>) =>
    request<{ job: Job }>(`/jobs/${jobId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  delete: (jobId: string) => request<{ deleted: boolean }>(`/jobs/${jobId}`, { method: 'DELETE' }),
}

export const applicationsApi = {
  listMine: () => request<{ applications: Application[] }>(`/applications`),
  get: (applicationId: string) => request<ApplicationDetail>(`/applications/${applicationId}`),
  apply: (jobId: string, resume: File, coverLetter?: string) => {
    const form = new FormData()
    form.append('job_id', jobId)
    form.append('resume', resume)
    if (coverLetter) form.append('cover_letter', coverLetter)
    return request<{ application: Application }>(`/applications`, { method: 'POST', body: form })
  },
}

export const interviewApi = {
  start: (applicationId: string, round: 1 | 2) =>
    request<SessionDetail>(`/interview/start`, {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, round }),
    }),
  getSession: (sessionId: string) => request<SessionDetail>(`/interview/${sessionId}`),
  answer: (questionId: string, answer: string) =>
    request<AnswerResult>(`/interview/answer`, {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, answer }),
    }),
  complete: (sessionId: string) =>
    request<CompleteResult>(`/interview/complete`, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),
}

export const recruiterApi = {
  applicants: (jobId?: string) =>
    request<{ applicants: Application[] }>(`/recruiter/applicants${jobId ? `?job_id=${jobId}` : ''}`),
  applicationDetail: (applicationId: string) =>
    request<ApplicationDetail>(`/recruiter/applications/${applicationId}`),
  updateStatus: (applicationId: string, status: 'shortlisted' | 'rejected' | 'hired') =>
    request<{ application: Application }>(`/recruiter/applications/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  analytics: () => request<RecruiterAnalytics>(`/recruiter/analytics`),
}

export const dashboardApi = {
  candidate: () => request<CandidateDashboard>(`/dashboard/candidate`),
  recruiter: () => request<RecruiterDashboard>(`/dashboard/recruiter`),
}

export const profileApi = {
  get: () => request<Record<string, unknown>>(`/profile`),
  update: (updates: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/profile`, { method: 'PATCH', body: JSON.stringify(updates) }),
}

// Human-readable labels + CTA hints for each application status.
export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; cta?: { label: string; round: 1 | 2 } }
> = {
  applied: { label: 'Applied', tone: 'neutral' },
  screened: { label: 'Ready for Round 1', tone: 'info', cta: { label: 'Start Round 1 Interview', round: 1 } },
  round1_in_progress: { label: 'Round 1 in progress', tone: 'info', cta: { label: 'Resume Round 1', round: 1 } },
  round1_completed: { label: 'Round 1 completed', tone: 'warning' },
  round2_available: { label: 'Round 2 unlocked', tone: 'success', cta: { label: 'Start Round 2 Interview', round: 2 } },
  round2_in_progress: { label: 'Round 2 in progress', tone: 'info', cta: { label: 'Resume Round 2', round: 2 } },
  round2_completed: { label: 'Interviews completed', tone: 'success' },
  shortlisted: { label: 'Shortlisted', tone: 'success' },
  rejected: { label: 'Not selected', tone: 'danger' },
  hired: { label: 'Hired 🎉', tone: 'success' },
}
