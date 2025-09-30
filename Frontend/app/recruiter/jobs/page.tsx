'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { FormInput } from '@/components/ui/FormInput'
import { apiClient, Job } from '@/utils/apiClient'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  Briefcase,
  MapPin,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

const RecruiterJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time' as const,
    salary: '',
    description: '',
    requirements: ''
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const jobsData = await apiClient.getJobs()
      setJobs(jobsData)
    } catch (error) {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const requirements = newJob.requirements.split(',').map(req => req.trim())
      await apiClient.createJob({
        ...newJob,
        requirements,
        status: 'active'
      })
      toast.success('Job created successfully!')
      setIsCreateModalOpen(false)
      setNewJob({
        title: '',
        company: '',
        location: '',
        type: 'full-time',
        salary: '',
        description: '',
        requirements: ''
      })
      fetchJobs()
    } catch (error) {
      toast.error('Failed to create job')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await apiClient.deleteJob(jobId)
        toast.success('Job deleted successfully!')
        fetchJobs()
      } catch (error) {
        toast.error('Failed to delete job')
      }
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600">Manage your job postings</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
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
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : job.status === 'paused'
                        ? 'bg-accent-100 text-accent-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {job.type}
                    </div>
                    {job.salary && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {job.salary}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {job.applicantsCount} applicants
                      </div>
                      <div className="text-sm text-gray-500">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first job posting'}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Job Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Job"
        size="lg"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Job Title"
              value={newJob.title}
              onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="e.g. Senior Frontend Developer"
            />
            <FormInput
              label="Company"
              value={newJob.company}
              onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
              required
              placeholder="e.g. Tech Corp"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Location"
              value={newJob.location}
              onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
              required
              placeholder="e.g. San Francisco, CA"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Job Type</label>
              <select
                value={newJob.type}
                onChange={(e) => setNewJob(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <FormInput
            label="Salary (Optional)"
            value={newJob.salary}
            onChange={(e) => setNewJob(prev => ({ ...prev, salary: e.target.value }))}
            placeholder="e.g. $80,000 - $120,000"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              value={newJob.description}
              onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe the role and responsibilities..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Requirements (comma-separated)</label>
            <textarea
              value={newJob.requirements}
              onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g. React, TypeScript, 3+ years experience"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Job
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default RecruiterJobs
