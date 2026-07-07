'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Briefcase,
  Users,
  MessageCircle,
  Target,
  Plus,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  dashboardApi,
  RecruiterDashboard as RecruiterDashboardData,
  ApplicationStatus,
  STATUS_META,
} from '@/utils/apiClient'

const TONE_CLASSES: Record<string, string> = {
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
}

// Pipeline display order
const PIPELINE_ORDER: ApplicationStatus[] = [
  'applied',
  'screened',
  'round1_in_progress',
  'round1_completed',
  'round2_available',
  'round2_in_progress',
  'round2_completed',
  'shortlisted',
  'hired',
  'rejected',
]

const RecruiterDashboard: React.FC = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<RecruiterDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      const dashboard = await dashboardApi.recruiter()
      setData(dashboard)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard data')
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
      fetchDashboardData()
    }
  }, [authLoading, isAuthenticated, router, fetchDashboardData])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Active Jobs',
      value: data?.stats.activeJobs ?? 0,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-500/20'
    },
    {
      title: 'Total Applicants',
      value: data?.stats.totalApplicants ?? 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-500/20'
    },
    {
      title: 'Interviews Completed',
      value: data?.stats.interviewsCompleted ?? 0,
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-500/20'
    },
    {
      title: 'Hired',
      value: data?.stats.hired ?? 0,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-500/20'
    }
  ]

  const pipeline = data?.pipeline ?? {}
  const pipelineEntries = PIPELINE_ORDER.map((status) => ({
    status,
    label: STATUS_META[status]?.label || status,
    count: pipeline[status] ?? 0,
  })).filter((entry) => entry.count > 0 || ['applied', 'screened', 'shortlisted', 'hired'].includes(entry.status))
  const pipelineMax = Math.max(1, ...pipelineEntries.map((e) => e.count))

  const recentApplicants = data?.recentApplicants ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.name}!</p>
        </div>
        <Button onClick={() => router.push('/recruiter/jobs')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Hiring Pipeline</CardTitle>
            <CardDescription>Candidates at each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pipelineEntries.map(({ status, label, count }) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-40 truncate">
                    {label}
                  </span>
                  <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        status === 'rejected'
                          ? 'bg-red-400 dark:bg-red-500/70'
                          : status === 'hired'
                          ? 'bg-green-500 dark:bg-green-500/80'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                      style={{ width: `${(count / pipelineMax) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
              {pipelineEntries.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">No applications yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applicants */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applicants</CardTitle>
            <CardDescription>Latest applications received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplicants.slice(0, 5).map((applicant) => {
                const meta = STATUS_META[applicant.status]
                const name = applicant.candidate?.name || 'Candidate'
                return (
                  <div
                    key={applicant.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-300">
                          {name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {applicant.job?.title || ''}
                        </p>
                        {applicant.match_percentage != null && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Match: {applicant.match_percentage}%
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${TONE_CLASSES[meta?.tone || 'neutral']}`}
                      >
                        {meta?.label || applicant.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/recruiter/applicants?job_id=${applicant.job_id}`)
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
              {recentApplicants.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">No applicants yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/recruiter/jobs')}
            >
              <Plus className="w-6 h-6 mb-2" />
              Create New Job
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/recruiter/applicants')}
            >
              <Users className="w-6 h-6 mb-2" />
              View All Applicants
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/recruiter/analytics')}
            >
              <Target className="w-6 h-6 mb-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RecruiterDashboard
