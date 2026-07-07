'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
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

  const fetchJobs = useCallback(async () => {
    try {
      const { jobs } = await jobsApi.list({ recruiter: true })
      setJobs(jobs)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load jobs')
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
    const confirmed = window.confirm(
      `Delete "${job.title}"? This cannot be undone.`
    )
    if (!confirmed) return
    try {
      await jobsApi.delete(job.id)
      setJobs((prev) => prev.filter((j) => j.id !== job.id))
      toast.success('Job deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete job')
    }
  }

  const handleToggleStatus = async (job: Job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active'
    setTogglingId(job.id)
    try {
      const { job: updated } = await jobsApi.update(job.id, { status: nextStatus })
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, ...updated } : j)))
      toast.success(nextStatus === 'active' ? 'Job reopened' : 'Job closed')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update job status')
    } finally {
      setTogglingId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl dark:text-white">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Job Postings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your job listings and requirements
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            + Post New Job
          </button>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-slate-700">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No job postings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first job posting to start receiving applications
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
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
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                          {job.job_type}
                        </span>
                      )}
                      {job.experience_level && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                          {job.experience_level}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                      {job.applicant_count ?? 0} applicant{(job.applicant_count ?? 0) === 1 ? '' : 's'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(job)}
                      disabled={togglingId === job.id}
                      title={job.status === 'active' ? 'Click to close this job' : 'Click to reopen this job'}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
                        job.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
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

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-slate-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                    {job.round1_pass_threshold != null &&
                      ` · Round 1 pass threshold: ${job.round1_pass_threshold}%`}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/recruiter/applicants?job_id=${job.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      View Applicants
                    </button>
                    <button
                      onClick={() => openEditModal(job)}
                      className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job)}
                      className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
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
                      className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
