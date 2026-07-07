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

const TONE_CLASSES: Record<string, string> = {
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
}

// No recruiter actions before screening completes or after a terminal decision.
const ACTION_LOCKED_STATUSES: ApplicationStatus[] = ['applied', 'rejected', 'hired']

function getScoreColor(score?: number | null) {
  if (score == null) return 'text-gray-400 dark:text-gray-500'
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
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
      className={`rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 ${
        isCross ? 'ml-6' : ''
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
          {isCross ? '↳ ' : `Q${question.question_number}: `}
          {question.question_text}
        </p>
        <div className="flex items-center gap-2 ml-2">
          {question.answer_score != null && (
            <span className={`text-sm font-bold ${getScoreColor(question.answer_score)}`}>
              {question.answer_score}
            </span>
          )}
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 text-sm">
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">Answer:</p>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {question.candidate_answer || '—'}
            </p>
          </div>
          {question.answer_feedback && (
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-900 dark:text-blue-300">Feedback:</p>
              <p className="text-blue-800 dark:text-blue-200">{question.answer_feedback}</p>
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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Applicant Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading || !detail ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
                    {new Date(detail.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {meta && (
                    <span
                      className={`px-3 py-1 text-sm rounded-full font-medium ${TONE_CLASSES[meta.tone]}`}
                    >
                      {meta.label}
                    </span>
                  )}
                  {detail.resume_url && (
                    <a
                      href={detail.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
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
                  { label: 'Match', value: detail.match_percentage, suffix: '%' },
                  { label: 'Round 1', value: detail.round1_score, suffix: '/100' },
                  { label: 'Round 2', value: detail.round2_score, suffix: '/100' },
                  { label: 'Final', value: detail.final_score, suffix: '/100' },
                ].map(({ label, value, suffix }) => (
                  <div
                    key={label}
                    className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 text-center"
                  >
                    <div className={`text-xl font-bold ${getScoreColor(value)}`}>
                      {value != null ? `${value}${suffix}` : '—'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
                  </div>
                ))}
              </div>

              {/* Match analysis */}
              {detail.match_analysis && (
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Match Analysis
                    {detail.match_analysis.demoMode && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400">
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
                              className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200 text-xs rounded-full"
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
                              className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200 text-xs rounded-full"
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
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Round {round.session.round}{' '}
                        {round.session.round === 1 ? '· Resume Deep-Dive' : '· Role Fit Interview'}
                      </h4>
                      <span className={`text-sm font-bold ${getScoreColor(round.session.overall_score)}`}>
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
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Final Report
                      {detail.final_report.demoMode && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400">
                          demo mode
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${getScoreColor(detail.final_report.finalScore)}`}>
                        {detail.final_report.finalScore}/100 ({detail.final_report.grade})
                      </span>
                      <span className="px-3 py-1 text-xs rounded-full font-semibold bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600">
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
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Strengths</p>
                      <ul className="space-y-1">
                        {detail.final_report.strengths.map((s, i) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">✓ {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Risks</p>
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
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                  {detail.status !== 'shortlisted' && (
                    <Button
                      size="sm"
                      disabled={updating}
                      onClick={() => handleStatus('shortlisted')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Shortlist
                    </Button>
                  )}
                  <Button
                    size="sm"
                    disabled={updating}
                    onClick={() => handleStatus('hired')}
                    className="bg-blue-600 hover:bg-blue-700"
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Applicants</h1>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={jobFilter}
                onChange={(e) => handleJobFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
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
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
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
                    <div className="w-12 h-12 bg-primary-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600 dark:text-blue-300">
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
                          Applied {new Date(applicant.applied_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 font-medium">
                          <Star className="w-3 h-3 mr-1" />
                          Match: {applicant.match_percentage != null ? `${applicant.match_percentage}%` : '—'}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200 font-medium">
                          <Award className="w-3 h-3 mr-1" />
                          R1: {applicant.round1_score != null ? `${applicant.round1_score}/100` : '—'}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200 font-medium">
                          <Award className="w-3 h-3 mr-1" />
                          R2: {applicant.round2_score != null ? `${applicant.round2_score}/100` : '—'}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 font-medium">
                          <Star className="w-3 h-3 mr-1" />
                          Final: {applicant.final_score != null ? `${applicant.final_score}/100` : '—'}
                        </span>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }
    >
      <RecruiterApplicantsContent />
    </Suspense>
  )
}
