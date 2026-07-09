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
import { scoreTextClass } from '@/components/ui/ScoreDial'
import Reveal, { CountUp, GrowBar } from '@/components/landing/Reveal'
import {
  dashboardApi,
  RecruiterDashboard as RecruiterDashboardData,
  ApplicationStatus,
  STATUS_META,
} from '@/utils/apiClient'

const TONE_CLASSES: Record<string, string> = {
  neutral: 'font-data bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300',
  info: 'font-data bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400',
  success: 'font-data bg-jade-100 text-jade-700 dark:bg-jade-400/10 dark:text-jade-400',
  warning: 'font-data bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400',
  danger: 'font-data bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400',
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
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const dashboard = await dashboardApi.recruiter()
      setData(dashboard)
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load dashboard data')
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 dark:border-jade-400"></div>
      </div>
    )
  }

  if (loadError) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Couldn&apos;t load your dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{loadError}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  const stats = [
    {
      title: 'Active Jobs',
      value: data?.stats.activeJobs ?? 0,
      icon: Briefcase,
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-white/5'
    },
    {
      title: 'Total Applicants',
      value: data?.stats.totalApplicants ?? 0,
      icon: Users,
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-white/5'
    },
    {
      title: 'Interviews Completed',
      value: data?.stats.interviewsCompleted ?? 0,
      icon: MessageCircle,
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-white/5'
    },
    {
      title: 'Hired',
      value: data?.stats.hired ?? 0,
      icon: Target,
      color: 'text-jade-700 dark:text-jade-400',
      bgColor: 'bg-jade-100 dark:bg-jade-400/10'
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
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.name}!</p>
        </div>
        <Button onClick={() => router.push('/recruiter/jobs')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Stats */}
      <div className="space-y-3">
      <p className="eyebrow">OVERVIEW</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Reveal key={index} index={index}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="eyebrow">{stat.title}</p>
                  <p className="font-data text-2xl font-semibold text-gray-900 dark:text-white">
                    <CountUp value={stat.value} />
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          </Reveal>
        ))}
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline funnel */}
        <Reveal delay={0.1}>
        <Card className="h-full">
          <CardHeader>
            <p className="eyebrow">PIPELINE</p>
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
                  <div className="flex-1 bg-line-light dark:bg-line-dark rounded-full h-1.5 overflow-hidden">
                    <GrowBar
                      percent={(count / pipelineMax) * 100}
                      className={`h-1.5 rounded-full ${
                        status === 'rejected'
                          ? 'bg-gray-400 dark:bg-gray-500'
                          : 'bg-jade-600 dark:bg-jade-400'
                      }`}
                    />
                  </div>
                  <span className="font-data text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
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
        </Reveal>

        {/* Recent Applicants */}
        <Reveal delay={0.17}>
        <Card className="h-full">
          <CardHeader>
            <p className="eyebrow">RECENT ACTIVITY</p>
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
                    className="flex items-center justify-between p-4 border border-line-light dark:border-line-dark rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
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
                          <p className={`font-data text-sm ${scoreTextClass(applicant.match_percentage)}`}>
                            Match: {applicant.match_percentage}%
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full ${TONE_CLASSES[meta?.tone || 'neutral']}`}
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
        </Reveal>
      </div>

      {/* Quick Actions */}
      <Reveal delay={0.1}>
      <Card>
        <CardHeader>
          <p className="eyebrow">SHORTCUTS</p>
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
      </Reveal>
    </div>
  )
}

export default RecruiterDashboard
