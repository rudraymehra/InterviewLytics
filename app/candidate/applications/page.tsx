'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  MapPin,
  DollarSign,
  Building2,
  MessageCircle,
  Award
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  applicationsApi,
  Application,
  ApplicationStatus,
  STATUS_META
} from '@/utils/apiClient'

const TONE_CLASSES: Record<string, string> = {
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
}

// Statuses whose completed-round feedback is worth surfacing
const FEEDBACK_STATUSES: ApplicationStatus[] = [
  'round1_completed',
  'round2_available',
  'round2_completed',
  'shortlisted',
  'hired',
  'rejected',
]

const CandidateApplications: React.FC = () => {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchData = useCallback(async () => {
    try {
      const { applications } = await applicationsApi.listMine()
      setApplications(applications)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load applications')
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

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'hired':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'shortlisted':
        return <Star className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-blue-600" />
    }
  }

  const hasCompletedRound = (app: Application) =>
    app.round1_score != null || app.round2_score != null

  const filteredApplications = applications.filter((application) => {
    const job = application.job
    const matchesSearch =
      (job?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job?.company || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || application.status === statusFilter

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Applications</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your job applications and their status</p>
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
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
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

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => {
          const job = application.job
          const meta = STATUS_META[application.status]
          const cta = meta?.cta
          return (
            <Card key={application.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-600 dark:text-blue-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {job?.title || 'Job Title'}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${TONE_CLASSES[meta?.tone || 'neutral']}`}>
                          {meta?.label || application.status}
                        </span>
                        {application.match_percentage != null && (
                          <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {application.match_percentage}% Match
                          </div>
                        )}
                      </div>

                      <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {job?.company || 'Company'}
                        </div>
                        {job?.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                        )}
                        {job?.salary_range && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {job.salary_range}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Applied {new Date(application.applied_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Round scores */}
                      {hasCompletedRound(application) && (
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          {application.round1_score != null && (
                            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200 font-medium">
                              <Award className="w-3 h-3 mr-1" />
                              Round 1: {application.round1_score}/100
                              {application.round1_grade ? ` · Grade ${application.round1_grade}` : ''}
                            </span>
                          )}
                          {application.round2_score != null && (
                            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200 font-medium">
                              <Award className="w-3 h-3 mr-1" />
                              Round 2: {application.round2_score}/100
                              {application.round2_grade ? ` · Grade ${application.round2_grade}` : ''}
                            </span>
                          )}
                          {application.final_score != null && (
                            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 font-medium">
                              <Star className="w-3 h-3 mr-1" />
                              Final: {application.final_score}/100
                              {application.final_grade ? ` · Grade ${application.final_grade}` : ''}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center flex-wrap gap-2">
                        {cta && (
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/candidate/interview?applicationId=${application.id}&round=${cta.round}`
                              )
                            }
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {cta.label}
                          </Button>
                        )}
                        {FEEDBACK_STATUSES.includes(application.status) &&
                          hasCompletedRound(application) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/candidate/feedback?applicationId=${application.id}`)
                              }
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View Feedback
                            </Button>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusIcon(application.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : "You haven't applied to any jobs yet"}
            </p>
            <Button onClick={() => router.push('/candidate/jobs')}>
              <Search className="w-4 h-4 mr-2" />
              Find Jobs
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Application Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Applications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {applications.filter((app) =>
                ['round1_in_progress', 'round2_in_progress'].includes(app.status)
              ).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Interviews In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter((app) => app.status === 'shortlisted').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Shortlisted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter((app) => app.status === 'hired').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Hired</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CandidateApplications
