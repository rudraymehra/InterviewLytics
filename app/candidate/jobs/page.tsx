'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Building2,
  MapPin,
  CircleDollarSign,
  Check,
  SearchX,
  UploadCloud,
  FileText,
  X,
  PartyPopper,
} from 'lucide-react'
import { scoreTextClass } from '@/components/ui/ScoreDial'
import Reveal, { AnimatedScoreDial, PopIn } from '@/components/landing/Reveal'
import TiltCard from '@/components/landing/TiltCard'
import { jobsApi, applicationsApi, Job, Application } from '@/utils/apiClient'

const MAX_RESUME_SIZE = 4 * 1024 * 1024 // 4MB
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']

export default function CandidateJobsPage() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      // allSettled so a failing applications call doesn't blank the jobs list
      const [jobsRes, appsRes] = await Promise.allSettled([
        jobsApi.list(),
        applicationsApi.listMine(),
      ])
      if (jobsRes.status === 'rejected') {
        throw jobsRes.reason
      }
      setJobs(jobsRes.value.jobs)
      if (appsRes.status === 'fulfilled') {
        setAppliedJobIds(new Set(appsRes.value.applications.map((a) => a.job_id)))
      } else {
        toast.error('Could not load your existing applications')
      }
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login-candidate')
      return
    }
    if (!authLoading && isAuthenticated) {
      fetchData()
    }
  }, [authLoading, isAuthenticated, router, fetchData])

  const handleApply = (job: Job) => {
    setSelectedJob(job)
    setSubmittedApplication(null)
    setShowApplyModal(true)
  }

  const closeModal = () => {
    setShowApplyModal(false)
    setResumeFile(null)
    setCoverLetter('')
    setSelectedJob(null)
    setSubmittedApplication(null)
    setDragActive(false)
  }

  const validateResume = (file: File): string | null => {
    const lower = file.name.toLowerCase()
    if (!ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      return 'Resume must be a .pdf, .doc, or .docx file'
    }
    if (file.size > MAX_RESUME_SIZE) {
      return 'Resume must be 4MB or smaller'
    }
    return null
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resumeFile) {
      toast.error('Please upload your resume')
      return
    }
    const validationError = validateResume(resumeFile)
    if (validationError) {
      toast.error(validationError)
      return
    }
    if (!selectedJob) return

    setApplying(true)
    try {
      const { application } = await applicationsApi.apply(
        selectedJob.id,
        resumeFile,
        coverLetter || undefined
      )
      setAppliedJobIds((prev) => new Set(prev).add(selectedJob.id))
      setSubmittedApplication(application)
      toast.success('Application submitted!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-paper dark:bg-ink flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 dark:border-jade-400"></div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Loading jobs...</div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-paper dark:bg-ink py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-[#0B1122] rounded-xl shadow-sm p-12 text-center border border-red-200 dark:border-red-400/40">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Couldn&apos;t load jobs
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{loadError}</p>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-ink py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">Open Roles</p>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
              Available Jobs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Find and apply to jobs that match your skills
            </p>
          </div>
          {jobs.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-2 font-data text-xs uppercase tracking-wider text-jade-700 dark:text-jade-400 border border-jade-600/30 dark:border-jade-400/30 bg-jade-500/5 rounded-full px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-jade-500 dark:bg-jade-400 motion-safe:animate-pulse" />
              {jobs.length} {jobs.length === 1 ? 'role' : 'roles'} open
            </span>
          )}
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="relative overflow-hidden bg-white dark:bg-[#0B1122] rounded-xl shadow-sm py-20 px-6 text-center border border-line-light dark:border-line-dark">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 h-48 w-48 rounded-full bg-jade-500/10 blur-3xl"
            />
            <div className="relative flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-jade-500/30 bg-jade-500/10 mb-6">
                <SearchX className="h-7 w-7 text-jade-600 dark:text-jade-400" aria-hidden />
              </div>
              <p className="eyebrow mb-2">No Open Roles</p>
              <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No jobs available yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                Check back later for new opportunities
              </p>
              <button
                onClick={fetchData}
                className="px-5 py-2.5 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data text-sm uppercase tracking-wide rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400"
              >
                Refresh listings
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job, jobIndex) => {
              const alreadyApplied = appliedJobIds.has(job.id)
              return (
                <Reveal key={job.id} index={Math.min(jobIndex, 4)}>
                <TiltCard
                  className="scanline-hover bg-white dark:bg-[#0B1122] rounded-xl shadow-sm p-6 border border-line-light dark:border-line-dark hover:shadow-md hover:border-jade-500/50 dark:hover:border-jade-500/50 dark:hover:shadow-neon transition-[border-color,box-shadow]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {job.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-jade-600/80 dark:text-jade-400/80" aria-hidden />
                          {job.company}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-jade-600/80 dark:text-jade-400/80" aria-hidden />
                            {job.location}
                          </span>
                        )}
                        {job.salary_range && (
                          <span className="flex items-center gap-1.5 font-data">
                            <CircleDollarSign className="h-4 w-4 text-jade-600/80 dark:text-jade-400/80" aria-hidden />
                            {job.salary_range}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {job.job_type && (
                          <span className="px-2.5 py-1 border border-line-light dark:border-line-dark bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300 rounded-full font-data text-xs uppercase tracking-wider">
                            {job.job_type}
                          </span>
                        )}
                        {job.experience_level && (
                          <span className="px-2.5 py-1 border border-line-light dark:border-line-dark bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300 rounded-full font-data text-xs uppercase tracking-wider">
                            {job.experience_level}
                          </span>
                        )}
                      </div>
                    </div>
                    {alreadyApplied ? (
                      <span className="inline-flex items-center gap-2 px-5 py-3 border border-jade-600/30 dark:border-jade-400/30 bg-jade-500/5 text-jade-700 dark:text-jade-400 rounded font-data text-sm uppercase tracking-wide font-semibold shrink-0">
                        <Check className="h-4 w-4" aria-hidden />
                        Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(job)}
                        className="px-6 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors shadow-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      About the Role
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Requirements
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {job.requirements}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-line-light dark:border-line-dark font-data text-sm text-gray-500 dark:text-gray-400">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </TiltCard>
                </Reveal>
              )
            })}
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm motion-safe:animate-fade-in flex items-center justify-center z-50 p-4">
            <PopIn className="bg-white dark:bg-[#0B1122] rounded-xl shadow-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-line-light dark:border-line-dark">
              <div className="p-6">
                {submittedApplication ? (
                  /* Step 2: screening result */
                  <div className="text-center py-6">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-jade-500/30 bg-jade-500/10">
                      <PartyPopper className="h-7 w-7 text-jade-600 dark:text-jade-400" aria-hidden />
                    </div>
                    <p className="eyebrow mb-1">Application Received</p>
                    <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Screening complete
                    </h2>
                    {typeof submittedApplication.match_percentage === 'number' && (
                      <div className="flex flex-col items-center gap-2 my-4">
                        <AnimatedScoreDial value={submittedApplication.match_percentage} size={64} />
                        <div
                          className={`font-data text-lg font-semibold ${scoreTextClass(
                            submittedApplication.match_percentage
                          )}`}
                        >
                          {submittedApplication.match_percentage}% match
                        </div>
                      </div>
                    )}
                    {submittedApplication.match_analysis?.summary && (
                      <p className="text-gray-700 dark:text-gray-300 max-w-xl mx-auto mb-4">
                        {submittedApplication.match_analysis.summary}
                      </p>
                    )}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold">
                        Your Round 1 interview is unlocked. Head to your applications to start it whenever you&apos;re ready.
                      </p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={closeModal}
                        className="px-6 py-3 border border-jade-600 text-jade-700 dark:border-jade-400/60 dark:text-jade-400 rounded font-semibold hover:bg-jade-50 dark:hover:bg-jade-400/10 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => router.push('/candidate/applications')}
                        className="px-6 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors shadow-sm"
                      >
                        Go to My Applications
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="eyebrow mb-1">New Application</p>
                        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          Apply for {selectedJob.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          at {selectedJob.company}
                        </p>
                      </div>
                      <button
                        onClick={closeModal}
                        aria-label="Close"
                        className="p-2 -m-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400"
                      >
                        <X className="h-5 w-5" aria-hidden />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitApplication} className="space-y-6">
                      <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Upload Resume *
                        </span>
                        {resumeFile ? (
                          <div className="flex items-center justify-between gap-3 border border-jade-500/40 bg-jade-500/5 rounded-xl px-4 py-3">
                            <span className="flex items-center gap-2.5 min-w-0">
                              <FileText className="h-4 w-4 shrink-0 text-jade-600 dark:text-jade-400" aria-hidden />
                              <span className="font-data text-sm text-gray-800 dark:text-gray-200 truncate">
                                {resumeFile.name}
                              </span>
                              <span className="font-data text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                {(resumeFile.size / 1024).toFixed(0)} KB
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setResumeFile(null)}
                              aria-label="Remove file"
                              className="p-1.5 -m-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400"
                            >
                              <X className="h-4 w-4" aria-hidden />
                            </button>
                          </div>
                        ) : (
                          <label
                            onDragOver={(e) => {
                              e.preventDefault()
                              setDragActive(true)
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => {
                              e.preventDefault()
                              setDragActive(false)
                              const file = e.dataTransfer.files?.[0]
                              if (!file) return
                              const err = validateResume(file)
                              if (err) {
                                toast.error(err)
                                return
                              }
                              setResumeFile(file)
                            }}
                            className={`flex flex-col items-center justify-center gap-2 border border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-jade-400 ${
                              dragActive
                                ? 'border-jade-400 bg-jade-500/10'
                                : 'border-jade-500/40 hover:border-jade-400/70 hover:bg-jade-500/5'
                            }`}
                          >
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const err = validateResume(file)
                                if (err) {
                                  toast.error(err)
                                  e.target.value = ''
                                  return
                                }
                                setResumeFile(file)
                              }}
                            />
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-jade-500/30 bg-jade-500/10">
                              <UploadCloud className="h-5 w-5 text-jade-600 dark:text-jade-400" aria-hidden />
                            </div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                              Drop your resume here or click to browse
                            </p>
                            <p className="font-data text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              PDF / DOC / DOCX &middot; max 4MB
                            </p>
                          </label>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Our AI will analyze your resume and calculate a match percentage.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cover Letter (Optional)
                        </label>
                        <textarea
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                          placeholder="Tell us why you're interested in this role..."
                        />
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Next Steps:</strong> After submitting your application, you&apos;ll receive a match score and your Round 1 AI interview will unlock — tailored to your resume and this job&apos;s requirements.
                        </p>
                      </div>

                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="px-6 py-3 border border-jade-600 text-jade-700 dark:border-jade-400/60 dark:text-jade-400 rounded hover:bg-jade-50 dark:hover:bg-jade-400/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={applying || !resumeFile}
                          className="px-6 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-gray-500 dark:disabled:hover:bg-white/10"
                        >
                          {applying ? 'Analyzing your resume...' : 'Submit Application'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </PopIn>
          </div>
        )}
      </div>
    </div>
  )
}
