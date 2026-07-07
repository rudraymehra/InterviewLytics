'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Search,
  User,
  Mail,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Award,
  ExternalLink,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  recruiterApi,
  jobsApi,
  Application,
  ApplicationDetail,
  ApplicationStatus,
  InterviewQuestion,
  Job,
  STATUS_META,
} from '@/utils/apiClient'
import ScoreDial, { scoreTextClass } from '@/components/ui/ScoreDial'

// Status chip tones: success→jade, warning→amber, danger→crimson, info→slate blue, neutral→gray
const TONE_CLASSES: Record<string, string> = {
  neutral: 'font-data bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300',
  info: 'font-data bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400',
  success: 'font-data bg-jade-100 text-jade-700 dark:bg-jade-400/10 dark:text-jade-400',
  warning: 'font-data bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400',
  danger: 'font-data bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400',
}

// No recruiter actions before screening completes or after a terminal decision.
const ACTION_LOCKED_STATUSES: ApplicationStatus[] = ['applied', 'rejected', 'hired']

function getScoreColor(score?: number | null) {
  if (score == null) return 'text-gray-400 dark:text-gray-500'
  return scoreTextClass(score)
}

/** Order questions: primaries by number, cross-questions right after their parent. */
function sortQuestions(questions: InterviewQuestion[]): InterviewQuestion[] {
  const primaries = questions
    .filter((q) => q.question_type !== 'cross_question')
    .sort((a, b) => a.question_number - b.question_number)
  const crosses = questions.filter((q) => q.question_type === 'cross_question')
  const ordered: InterviewQuestion[] = []
  for (const primary of primaries) {
    ordered.push(primary)
    for (const cross of crosses) {
      if (cross.parent_question_id === primary.id) ordered.push(cross)
    }
  }
  for (const cross of crosses) {
    if (!ordered.includes(cross)) ordered.push(cross)
  }
  return ordered
}

function TranscriptAccordion({ question }: { question: InterviewQuestion }) {
  const [open, setOpen] = useState(false)
  const isCross = question.question_type === 'cross_question'

  return (
    <div
      className={`rounded-xl border border-line-light dark:border-line-dark bg-paper dark:bg-ink ${
        isCross ? 'ml-6' : ''
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
          <span className="font-data text-xs text-gray-500 dark:text-gray-400">
            {isCross ? '↳ ' : `Q${String(question.question_number).padStart(2, '0')} `}
          </span>
          {question.question_text}
        </p>
        <div className="flex items-center gap-2 ml-2">
          {question.answer_score != null && (
            <span className={`font-data text-sm font-semibold ${getScoreColor(question.answer_score)}`}>
              {question.answer_score}
            </span>
          )}
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 text-sm">
          <div>
            <p className="eyebrow mb-1">ANSWER</p>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {question.candidate_answer || '—'}
            </p>
          </div>
          {question.answer_feedback && (
            <div className="p-2 bg-jade-50 dark:bg-jade-400/5 rounded-xl border border-jade-100 dark:border-jade-400/20">
              <p className="eyebrow mb-1">FEEDBACK</p>
              <p className="text-gray-700 dark:text-gray-300">{question.answer_feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ApplicantDetailModal({
  applicationId,
  onClose,
  onStatusChange,
}: {
  applicationId: string
  onClose: () => void
  onStatusChange: (updated: Application) => void
}) {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await recruiterApi.applicationDetail(applicationId)
        if (!cancelled) setDetail(data)
      } catch (err: any) {
        toast.error(err.message || 'Failed to load applicant details')
        onClose()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId])

  const handleStatus = async (status: 'shortlisted' | 'rejected' | 'hired') => {
    if (
      (status === 'rejected' || status === 'hired') &&
      !window.confirm(`Are you sure you want to mark this candidate as ${status}?`)
    ) {
      return
    }
    setUpdating(true)
    try {
      const { application } = await recruiterApi.updateStatus(applicationId, status)
      setDetail((prev) => (prev ? { ...prev, status: application.status } : prev))
      onStatusChange(application)
      toast.success(`Candidate ${STATUS_META[application.status]?.label || status}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const meta = detail ? STATUS_META[detail.status] : null
  const actionsLocked = detail ? ACTION_LOCKED_STATUSES.includes(detail.status) : true

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#131A2A] rounded-xl shadow-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-line-light dark:border-line-dark">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="eyebrow mb-1">CANDIDATE DOSSIER</p>
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                Applicant Details
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading || !detail ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 dark:border-jade-400"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Candidate header */}
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {detail.candidate?.name || 'Candidate'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {detail.candidate?.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {detail.job?.title} · Applied{' '}
                    <span className="font-data text-xs">
                      {new Date(detail.applied_at).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {meta && (
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${TONE_CLASSES[meta.tone]}`}
                    >
                      {meta.label}
                    </span>
                  )}
                  {detail.resume_url && (
                    <a
                      href={detail.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm rounded-full border border-line-light dark:border-line-dark text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Resume
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>

              {/* Scores summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'MATCH %', value: detail.match_percentage },
                  { label: 'ROUND 01', value: detail.round1_score },
                  { label: 'ROUND 02', value: detail.round2_score },
                  { label: 'FINAL', value: detail.final_score },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="p-3 bg-paper dark:bg-ink rounded-xl border border-line-light dark:border-line-dark flex flex-col items-center gap-1"
                  >
                    {value != null ? (
                      <ScoreDial value={value} size={56} />
                    ) : (
                      <div className="h-14 flex items-center font-data text-lg text-gray-400 dark:text-gray-500">—</div>
                    )}
                    <div className="eyebrow">{label}</div>
                  </div>
                ))}
              </div>

              {/* Match analysis */}
              {detail.match_analysis && (
                <div className="p-4 bg-paper dark:bg-ink rounded-xl border border-line-light dark:border-line-dark space-y-3">
                  <h4 className="eyebrow">
                    SCREENING — MATCH ANALYSIS
                    {detail.match_analysis.demoMode && (
                      <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-gray-200 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400 normal-case tracking-normal">
                        demo mode
                      </span>
                    )}
                  </h4>
                  {detail.match_analysis.summary && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {detail.match_analysis.summary}
                    </p>
                  )}
                  {detail.match_analysis.matchedSkills &&
                    detail.match_analysis.matchedSkills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Matched skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {detail.match_analysis.matchedSkills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-jade-100 text-jade-700 dark:bg-jade-400/10 dark:text-jade-400 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  {detail.match_analysis.missingSkills &&
                    detail.match_analysis.missingSkills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Missing skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {detail.match_analysis.missingSkills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Per-round transcripts */}
              {detail.rounds
                .slice()
                .sort((a, b) => a.session.round - b.session.round)
                .map((round) => (
                  <div key={round.session.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="eyebrow">
                        {round.session.round === 1
                          ? 'ROUND 01 — RESUME DEEP-DIVE'
                          : 'ROUND 02 — ROLE FIT'}
                      </h4>
                      <span className={`font-data text-sm font-semibold ${getScoreColor(round.session.overall_score)}`}>
                        {round.session.overall_score != null
                          ? `${round.session.overall_score}/100${
                              round.session.overall_grade ? ` (${round.session.overall_grade})` : ''
                            }`
                          : round.session.status === 'in_progress'
                          ? 'In progress'
                          : '—'}
                      </span>
                    </div>
                    {round.session.overall_feedback && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {round.session.overall_feedback}
                      </p>
                    )}
                    <div className="space-y-2">
                      {sortQuestions(round.questions)
                        .filter((q) => q.candidate_answer != null)
                        .map((q) => (
                          <TranscriptAccordion key={q.id} question={q} />
                        ))}
                    </div>
                  </div>
                ))}

              {/* Final report */}
              {detail.final_report && (
                <div className="p-4 bg-paper dark:bg-ink rounded-xl border border-line-light dark:border-line-dark space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="eyebrow">
                      FINAL VERDICT
                      {detail.final_report.demoMode && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-gray-200 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400 normal-case tracking-normal">
                          demo mode
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`font-data text-xl font-semibold ${getScoreColor(detail.final_report.finalScore)}`}>
                        {detail.final_report.finalScore}/100 ({detail.final_report.grade})
                      </span>
                      <span className="px-3 py-1 font-data text-xs rounded-full font-semibold bg-white dark:bg-[#131A2A] text-gray-800 dark:text-gray-200 border border-line-light dark:border-line-dark uppercase tracking-[0.08em]">
                        {detail.final_report.recommendation.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {detail.final_report.summary}
                  </p>
                  {detail.final_report.roundComparison && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {detail.final_report.roundComparison}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="eyebrow mb-1">STRENGTHS</p>
                      <ul className="space-y-1">
                        {detail.final_report.strengths.map((s, i) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">✓ {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="eyebrow mb-1">RISKS</p>
                      <ul className="space-y-1">
                        {detail.final_report.risks.map((r, i) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">! {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!actionsLocked && (
                <div className="flex justify-end gap-3 pt-4 border-t border-line-light dark:border-line-dark">
                  {detail.status !== 'shortlisted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updating}
                      onClick={() => handleStatus('shortlisted')}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Shortlist
                    </Button>
                  )}
                  <Button
                    size="sm"
                    disabled={updating}
                    onClick={() => handleStatus('hired')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Hire
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating}
                    onClick={() => handleStatus('rejected')}
                    className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RecruiterApplicantsContent() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobIdParam = searchParams?.get('job_id') || ''

  const [applicants, setApplicants] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [jobFilter, setJobFilter] = useState(jobIdParam)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)

  const fetchApplicants = useCallback(async (jobId?: string) => {
    setLoading(true)
    try {
      const { applicants } = await recruiterApi.applicants(jobId || undefined)
      setApplicants(applicants)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load applicants')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchJobs = useCallback(async () => {
    try {
      const { jobs } = await jobsApi.list({ recruiter: true })
      setJobs(jobs)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load jobs')
    }
  }, [])

  // Keep the local job filter in sync with the URL (e.g. "View Applicants" links).
  useEffect(() => {
    setJobFilter(jobIdParam)
  }, [jobIdParam])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login-recruiter')
      return
    }
    if (!authLoading && isAuthenticated) {
      fetchJobs()
    }
  }, [authLoading, isAuthenticated, router, fetchJobs])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchApplicants(jobFilter)
    }
  }, [authLoading, isAuthenticated, jobFilter, fetchApplicants])

  const handleJobFilterChange = (jobId: string) => {
    setJobFilter(jobId)
    router.replace(`/recruiter/applicants${jobId ? `?job_id=${jobId}` : ''}`)
  }

  const applyStatusUpdate = (updated: Application) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...a, status: updated.status } : a))
    )
  }

  const filteredApplicants = applicants.filter((applicant) => {
    const name = applicant.candidate?.name || ''
    const email = applicant.candidate?.email || ''
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 dark:border-jade-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">SCORECARD</p>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Applicants</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and manage candidate applications</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by candidate name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 focus:border-transparent dark:bg-ink dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={jobFilter}
                onChange={(e) => handleJobFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 focus:border-transparent dark:bg-ink dark:text-white"
              >
                <option value="">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 focus:border-transparent dark:bg-ink dark:text-white"
              >
                <option value="all">All Status</option>
                {(Object.keys(STATUS_META) as ApplicationStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_META[status].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredApplicants.map((applicant) => {
          const meta = STATUS_META[applicant.status]
          const name = applicant.candidate?.name || 'Candidate'
          return (
            <Card key={applicant.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start space-x-4 flex-1 min-w-[240px]">
                    <div className="w-12 h-12 bg-jade-100 dark:bg-jade-400/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-jade-700 dark:text-jade-400">
                        {name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${TONE_CLASSES[meta?.tone || 'neutral']}`}>
                          {meta?.label || applicant.status}
                        </span>
                      </div>

                      <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {applicant.candidate?.email || '—'}
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {applicant.job?.title || 'Job'}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Applied{' '}
                          <span className="font-data text-xs ml-1">
                            {new Date(applicant.applied_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center flex-wrap gap-2">
                        {[
                          { label: 'MATCH', value: applicant.match_percentage, suffix: '%' },
                          { label: 'R1', value: applicant.round1_score, suffix: '/100' },
                          { label: 'R2', value: applicant.round2_score, suffix: '/100' },
                          { label: 'FINAL', value: applicant.final_score, suffix: '/100' },
                        ].map(({ label, value, suffix }) => (
                          <span
                            key={label}
                            className="inline-flex items-center px-2.5 py-1 font-data text-xs rounded-full bg-paper dark:bg-ink border border-line-light dark:border-line-dark"
                          >
                            <span className="text-gray-500 dark:text-gray-400 mr-1.5 tracking-[0.08em]">
                              {label}
                            </span>
                            <span className={`font-semibold ${getScoreColor(value)}`}>
                              {value != null ? `${value}${suffix}` : '—'}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplicationId(applicant.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredApplicants.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applicants found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || jobFilter
                ? 'Try adjusting your search criteria'
                : 'No applications have been received yet'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedApplicationId && (
        <ApplicantDetailModal
          applicationId={selectedApplicationId}
          onClose={() => setSelectedApplicationId(null)}
          onStatusChange={applyStatusUpdate}
        />
      )}
    </div>
  )
}

export default function RecruiterApplicantsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 dark:border-jade-400"></div>
        </div>
      }
    >
      <RecruiterApplicantsContent />
    </Suspense>
  )
}
