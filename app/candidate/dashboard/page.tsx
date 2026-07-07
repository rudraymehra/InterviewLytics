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
import toast from 'react-hot-toast'
import { dashboardApi, CandidateDashboard as CandidateDashboardData, ApplicationStatus, STATUS_META } from '@/utils/apiClient'

const TONE_CLASSES: Record<string, string> = {
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
}

const CandidateDashboard: React.FC = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<CandidateDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      const dashboard = await dashboardApi.candidate()
      setData(dashboard)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard')
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
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'shortlisted':
        return <Star className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-blue-600" />
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const stats = data?.stats
  const statsCards = [
    {
      title: 'Total Applications',
      value: stats?.totalApplications ?? 0,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-200',
      bgColor: 'bg-blue-100 dark:bg-blue-500/20'
    },
    {
      title: 'Interviews Completed',
      value: stats?.interviewsCompleted ?? 0,
      icon: MessageCircle,
      color: 'text-purple-600 dark:text-purple-200',
      bgColor: 'bg-purple-100 dark:bg-purple-500/20'
    },
    {
      title: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-200',
      bgColor: 'bg-yellow-100 dark:bg-yellow-500/20'
    },
    {
      title: 'Offers',
      value: stats?.offers ?? 0,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-200',
      bgColor: 'bg-green-100 dark:bg-green-500/20'
    }
  ]

  const nextActions = data?.nextActions ?? []
  const recentApplications = data?.recentApplications ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-300">Welcome back, {user?.name}!</p>
        </div>
        <Button onClick={() => router.push('/candidate/jobs')}>
          <Search className="w-4 h-4 mr-2" />
          Find Jobs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-300">{stat.title}</p>
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

      {/* Next actions */}
      <Card>
        <CardHeader>
          <CardTitle>Next Actions</CardTitle>
          <CardDescription>Interviews waiting for you</CardDescription>
        </CardHeader>
        <CardContent>
          {nextActions.length > 0 ? (
            <div className="space-y-4">
              {nextActions.map((action) => (
                <div
                  key={`${action.applicationId}-${action.round ?? 0}`}
                  className="flex items-center justify-between p-4 bg-blue-50 dark:bg-slate-800/70 border border-blue-100 dark:border-slate-700 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{action.jobTitle}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-300">{action.company}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">{action.label}</p>
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
              <MessageCircle className="w-10 h-10 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-slate-300">
                Nothing pending — apply to jobs to unlock AI interviews.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
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
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(application.status)}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {application.job?.title || 'Job'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-300">
                          {application.job?.company || ''}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          Applied {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {application.match_percentage != null && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-slate-300">Match</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {application.match_percentage}%
                          </p>
                        </div>
                      )}
                      <span
                        className={`px-3 py-1 text-sm rounded-full font-medium ${TONE_CLASSES[meta?.tone || 'neutral']}`}
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
              <FileText className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications yet</h3>
              <p className="text-gray-600 dark:text-slate-300 mb-4">Start applying to jobs to see them here</p>
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
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-16 flex-col dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/80"
              onClick={() => router.push('/candidate/jobs')}
            >
              <Search className="w-6 h-6 mb-2" />
              <span>Find New Jobs</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/80"
              onClick={() => router.push('/candidate/applications')}
            >
              <ArrowRight className="w-6 h-6 mb-2" />
              <span>My Applications</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/80"
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
