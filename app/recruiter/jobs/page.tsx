'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Reveal, { PopIn } from '@/components/landing/Reveal'
import TiltCard from '@/components/landing/TiltCard'
import { jobsApi, Job } from '@/utils/apiClient'

interface JobFormData {
  title: string
  company: string
  description: string
  requirements: string
  location: string
  job_type: string
  experience_level: string
  salary_range: string
  round1_pass_threshold: string
  status: 'active' | 'closed' | 'draft'
}

const emptyForm = (company: string): JobFormData => ({
  title: '',
  company,
  description: '',
  requirements: '',
  location: '',
  job_type: 'full-time',
  experience_level: 'mid',
  salary_range: '',
  round1_pass_threshold: '60',
  status: 'active',
})

export default function RecruiterJobsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState<JobFormData>(emptyForm(''))
  const [submitting, setSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const { jobs } = await jobsApi.list({ recruiter: true })
      setJobs(jobs)
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login-recruiter')
      return
    }
    if (!authLoading && isAuthenticated) {
      fetchJobs()
    }
  }, [authLoading, isAuthenticated, router, fetchJobs])

  const openCreateModal = () => {
    setEditingJob(null)
    setFormData(emptyForm(user?.company || ''))
    setShowModal(true)
  }

  const openEditModal = (job: Job) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
      location: job.location || '',
      job_type: job.job_type || 'full-time',
      experience_level: job.experience_level || 'mid',
      salary_range: job.salary_range || '',
      round1_pass_threshold: String(job.round1_pass_threshold ?? 60),
      status: job.status,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingJob(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const threshold = formData.round1_pass_threshold.trim()
    const thresholdValue = threshold === '' ? 60 : Number(threshold)
    if (Number.isNaN(thresholdValue) || thresholdValue < 0 || thresholdValue > 100) {
      toast.error('Round 1 pass threshold must be between 0 and 100')
      setSubmitting(false)
      return
    }

    const payload: Partial<Job> = {
      title: formData.title,
      company: formData.company,
      description: formData.description,
      requirements: formData.requirements,
      location: formData.location || undefined,
      job_type: formData.job_type,
      experience_level: formData.experience_level,
      salary_range: formData.salary_range || undefined,
      round1_pass_threshold: thresholdValue,
      status: formData.status,
    }

    try {
      if (editingJob) {
        const { job } = await jobsApi.update(editingJob.id, payload)
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, ...job } : j)))
        toast.success('Job updated')
      } else {
        const { job } = await jobsApi.create(payload)
        setJobs((prev) => [job, ...prev])
        toast.success('Job posted')
      }
      closeModal()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save job')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (job: Job) => {
    if (deletingId) return
    const count = job.applicant_count ?? 0
    const applicantWarning =
      count > 0
        ? `This job has ${count} applicant${count === 1 ? '' : 's'} — deleting permanently removes their applications, interviews and results. `
        : ''
    const confirmed = window.confirm(
      `Delete "${job.title}"? ${applicantWarning}This cannot be undone.`
    )
    if (!confirmed) return
    setDeletingId(job.id)
    try {
      await jobsApi.delete(job.id)
      setJobs((prev) => prev.filter((j) => j.id !== job.id))
      toast.success('Job deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete job')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (job: Job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active'
    setTogglingId(job.id)
    try {
      const { job: updated } = await jobsApi.update(job.id, { status: nextStatus })
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, ...updated } : j)))
      toast.success(
        nextStatus === 'active'
          ? job.status === 'draft'
            ? 'Job published'
            : 'Job reopened'
          : 'Job closed'
      )
    } catch (err: any) {
      toast.error(err.message || 'Failed to update job status')
    } finally {
      setTogglingId(null)
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="eyebrow mb-1">Open Roles</p>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
              Job Postings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your job listings and requirements
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors shadow-sm"
          >
            + Post New Job
          </button>
        </div>

        {/* Jobs List */}
        {loadError ? (
          <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-12 text-center border border-red-200 dark:border-red-400/40">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Couldn&apos;t load your jobs
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{loadError}</p>
            <button
              onClick={fetchJobs}
              className="px-6 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-12 text-center border border-line-light dark:border-line-dark">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No job postings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first job posting to start receiving applications
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, jobIndex) => (
              <Reveal key={job.id} index={Math.min(jobIndex, 4)}>
              <TiltCard
                className="scanline-hover bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-6 border border-line-light dark:border-line-dark hover:shadow-md hover:border-jade-500/50 dark:hover:border-jade-500/50 dark:hover:shadow-neon transition-[border-color,box-shadow]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        🏢 {job.company}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          📍 {job.location}
                        </span>
                      )}
                      {job.job_type && (
                        <span className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300 rounded-full">
                          {job.job_type}
                        </span>
                      )}
                      {job.experience_level && (
                        <span className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300 rounded-full">
                          {job.experience_level}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-data px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300">
                      {job.applicant_count ?? 0} applicant{(job.applicant_count ?? 0) === 1 ? '' : 's'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(job)}
                      disabled={togglingId === job.id}
                      title={
                        job.status === 'active'
                          ? 'Click to close this job'
                          : job.status === 'draft'
                          ? 'Click to publish this job'
                          : 'Click to reopen this job'
                      }
                      className={`px-2.5 py-1 rounded-full text-xs font-data transition-colors disabled:opacity-50 ${
                        job.status === 'active'
                          ? 'bg-jade-100 text-jade-700 dark:bg-jade-400/10 dark:text-jade-400 hover:bg-jade-200 dark:hover:bg-jade-400/20'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500/20'
                      }`}
                    >
                      {job.status}
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                  {job.description}
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Requirements:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {job.requirements}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-line-light dark:border-line-dark">
                  <span className="font-data text-sm text-gray-500 dark:text-gray-400">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                    {job.round1_pass_threshold != null &&
                      ` · Round 1 pass threshold: ${job.round1_pass_threshold}%`}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/recruiter/applicants?job_id=${job.id}`)}
                      className="px-4 py-2 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 rounded transition-colors text-sm font-semibold"
                    >
                      View Applicants
                    </button>
                    <button
                      onClick={() => openEditModal(job)}
                      className="px-4 py-2 border border-jade-600 text-jade-700 dark:border-jade-400/60 dark:text-jade-400 rounded hover:bg-jade-50 dark:hover:bg-jade-400/10 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job)}
                      disabled={deletingId === job.id}
                      className="px-4 py-2 border border-red-300 dark:border-red-400/60 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === job.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </TiltCard>
              </Reveal>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm motion-safe:animate-fade-in flex items-center justify-center z-50 p-4">
            <PopIn className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-line-light dark:border-line-dark">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                    {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                        placeholder="e.g., Senior Frontend Developer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                        placeholder="e.g., San Francisco, CA (Remote)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Type
                      </label>
                      <select
                        value={formData.job_type}
                        onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Experience Level
                      </label>
                      <select
                        value={formData.experience_level}
                        onChange={(e) =>
                          setFormData({ ...formData, experience_level: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                      >
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Salary Range
                      </label>
                      <input
                        type="text"
                        value={formData.salary_range}
                        onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                        placeholder="e.g., $120k - $180k"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Round 1 pass threshold (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.round1_pass_threshold}
                        onChange={(e) =>
                          setFormData({ ...formData, round1_pass_threshold: e.target.value })
                        }
                        className="font-data w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                        placeholder="60"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Candidates scoring at or above this in Round 1 unlock Round 2 automatically.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as JobFormData['status'],
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                      >
                        <option value="active">Active</option>
                        {editingJob && <option value="closed">Closed</option>}
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                      placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Requirements & Skills *
                    </label>
                    <textarea
                      required
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-line-dark rounded-lg focus:ring-2 focus:ring-jade-600 dark:focus:ring-jade-400 dark:bg-white/5 dark:text-white"
                      placeholder="List required skills, experience, qualifications, and technologies — separated by commas or new lines. This will be used for AI resume matching and interview question generation."
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      💡 Tip: Be specific about required skills and technologies. Our AI will use this to match candidates and generate relevant interview questions.
                    </p>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2 border border-jade-600 text-jade-700 dark:border-jade-400/60 dark:text-jade-400 rounded hover:bg-jade-50 dark:hover:bg-jade-400/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors disabled:opacity-50"
                    >
                      {submitting
                        ? 'Saving...'
                        : editingJob
                        ? 'Save Changes'
                        : 'Post Job'}
                    </button>
                  </div>
                </form>
              </div>
            </PopIn>
          </div>
        )}
      </div>
    </div>
  )
}
