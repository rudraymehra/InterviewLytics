'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  FileText,
  MessageCircle,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ArrowRight
} from 'lucide-react'
import { scoreTextClass } from '@/components/ui/ScoreDial'
import { dashboardApi, CandidateDashboard as CandidateDashboardData, ApplicationStatus, STATUS_META } from '@/utils/apiClient'

const TONE_CLASSES: Record<string, string> = {
  neutral: 'font-data bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300',
  info: 'font-data bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400',
  success: 'font-data bg-jade-100 text-jade-700 dark:bg-jade-400/10 dark:text-jade-400',
  warning: 'font-data bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400',
  danger: 'font-data bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400',
}

const CandidateDashboard: React.FC = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<CandidateDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const dashboard = await dashboardApi.candidate()
      setData(dashboard)
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load dashboard')
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
      fetchDashboardData()
    }
  }, [authLoading, isAuthenticated, router, fetchDashboardData])

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'hired':
        return <CheckCircle className="w-5 h-5 text-jade-600 dark:text-jade-400" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      case 'shortlisted':
        return <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
    }
  }

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
          <XCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Couldn&apos;t load your dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{loadError}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  const stats = data?.stats
  const statsCards = [
    {
      title: 'Total Applications',
      value: stats?.totalApplications ?? 0,
      icon: FileText,
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-white/5'
    },
    {
      title: 'Interviews Completed',
      value: stats?.interviewsCompleted ?? 0,
      icon: MessageCircle,
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-white/5'
    },
    {
      title: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: Clock,
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-white/5'
    },
    {
      title: 'Offers',
      value: stats?.offers ?? 0,
      icon: CheckCircle,
      color: 'text-jade-700 dark:text-jade-400',
      bgColor: 'bg-jade-100 dark:bg-jade-400/10'
    }
  ]

  const nextActions = data?.nextActions ?? []
  const recentApplications = data?.recentApplications ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.name}!</p>
        </div>
        <Button onClick={() => router.push('/candidate/jobs')}>
          <Search className="w-4 h-4 mr-2" />
          Find Jobs
        </Button>
      </div>

      {/* Stats */}
      <div className="space-y-3">
      <p className="eyebrow">OVERVIEW</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="eyebrow">{stat.title}</p>
                  <p className="font-data text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>

      {/* Next actions */}
      <Card>
        <CardHeader>
          <p className="eyebrow">NEXT ACTIONS</p>
          <CardTitle>Next Actions</CardTitle>
          <CardDescription>Interviews waiting for you</CardDescription>
        </CardHeader>
        <CardContent>
          {nextActions.length > 0 ? (
            <div className="space-y-4">
              {nextActions.map((action) => (
                <div
                  key={`${action.applicationId}-${action.round ?? 0}`}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 border border-line-light dark:border-line-dark rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{action.jobTitle}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{action.company}</p>
                    <p className="text-sm text-jade-700 dark:text-jade-400">{action.label}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/candidate/interview?applicationId=${action.applicationId}&round=${action.round ?? 1}`
                      )
                    }
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {STATUS_META[action.status]?.cta?.label || 'Start Interview'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300">
                Nothing pending — apply to jobs to unlock AI interviews.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <p className="eyebrow">RECENT ACTIVITY</p>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Your latest job applications</CardDescription>
        </CardHeader>
        <CardContent>
          {recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.map((application) => {
                const meta = STATUS_META[application.status]
                return (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 border border-line-light dark:border-line-dark rounded-lg bg-white dark:bg-[#0B1122] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(application.status)}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {application.job?.title || 'Job'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {application.job?.company || ''}
                        </p>
                        <p className="font-data text-sm text-gray-500 dark:text-gray-400">
                          Applied {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {application.match_percentage != null && (
                        <div className="text-right">
                          <p className="eyebrow">Match</p>
                          <p className={`font-data text-lg font-semibold ${scoreTextClass(application.match_percentage)}`}>
                            {application.match_percentage}%
                          </p>
                        </div>
                      )}
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full ${TONE_CLASSES[meta?.tone || 'neutral']}`}
                      >
                        {meta?.label || application.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Start applying to jobs to see them here</p>
              <Button onClick={() => router.push('/candidate/jobs')}>
                <Search className="w-4 h-4 mr-2" />
                Find Jobs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
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
              className="h-16 flex-col"
              onClick={() => router.push('/candidate/jobs')}
            >
              <Search className="w-6 h-6 mb-2" />
              <span>Find New Jobs</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col"
              onClick={() => router.push('/candidate/applications')}
            >
              <ArrowRight className="w-6 h-6 mb-2" />
              <span>My Applications</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col"
              onClick={() => router.push('/candidate/feedback')}
            >
              <Star className="w-6 h-6 mb-2" />
              <span>View Feedback</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CandidateDashboard
