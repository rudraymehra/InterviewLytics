'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ScoreDial, { scoreTextClass } from '@/components/ui/ScoreDial'
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

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        jobsApi.list(),
        applicationsApi.listMine(),
      ])
      setJobs(jobsRes.jobs)
      setAppliedJobIds(new Set(appsRes.applications.map((a) => a.job_id)))
    } catch (err: any) {
      toast.error(err.message || 'Failed to load jobs')
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

  return (
    <div className="min-h-screen bg-paper dark:bg-ink py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="eyebrow mb-1">Open Roles</p>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
            Available Jobs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Find and apply to jobs that match your skills
          </p>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-12 text-center border border-line-light dark:border-line-dark">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No jobs available yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new opportunities
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => {
              const alreadyApplied = appliedJobIds.has(job.id)
              return (
                <div
                  key={job.id}
                  className="scanline-hover bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-6 border border-line-light dark:border-line-dark hover:shadow-md hover:border-jade-600/40 dark:hover:border-jade-400/40 dark:hover:shadow-neon transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {job.title}
                      </h2>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          🏢 {job.company}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            📍 {job.location}
                          </span>
                        )}
                        {job.salary_range && (
                          <span className="flex items-center gap-1 font-data">
                            💰 {job.salary_range}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {job.job_type && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300 rounded-full text-xs">
                            {job.job_type}
                          </span>
                        )}
                        {job.experience_level && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300 rounded-full text-xs">
                            {job.experience_level}
                          </span>
                        )}
                      </div>
                    </div>
                    {alreadyApplied ? (
                      <button
                        disabled
                        className="px-6 py-3 bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded font-semibold cursor-not-allowed"
                      >
                        ✓ Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(job)}
                        className="px-6 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors shadow-sm"
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
                </div>
              )
            })}
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-line-light dark:border-line-dark">
              <div className="p-6">
                {submittedApplication ? (
                  /* Step 2: screening result */
                  <div className="text-center py-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Screening complete
                    </h2>
                    {typeof submittedApplication.match_percentage === 'number' && (
                      <div className="flex flex-col items-center gap-2 my-4">
                        <ScoreDial value={submittedApplication.match_percentage} size={64} />
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
                        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Apply for {selectedJob.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          at {selectedJob.company}
                        </p>
                      </div>
                      <button
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleSubmitApplication} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Upload Resume *
                        </label>
                        <input
                          type="file"
                          required
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          PDF, DOC, or DOCX up to 4MB. Our AI will analyze your resume and calculate a match percentage.
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
                          className="px-6 py-2 border border-jade-600 text-jade-700 dark:border-jade-400/60 dark:text-jade-400 rounded hover:bg-jade-50 dark:hover:bg-jade-400/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={applying || !resumeFile}
                          className="px-6 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors disabled:opacity-50"
                        >
                          {applying ? 'Analyzing your resume...' : 'Submit Application'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
