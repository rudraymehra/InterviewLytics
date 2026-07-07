'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { BarChart } from '@/components/charts'
import { Users, CheckCircle, Star, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  recruiterApi,
  RecruiterAnalytics as RecruiterAnalyticsData,
  ApplicationStatus,
  STATUS_META,
} from '@/utils/apiClient'

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

const RecruiterAnalytics: React.FC = () => {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [analytics, setAnalytics] = useState<RecruiterAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await recruiterApi.analytics()
      setAnalytics(data)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load analytics data')
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
      fetchAnalytics()
    }
  }, [authLoading, isAuthenticated, router, fetchAnalytics])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const scoreDistribution = analytics?.scoreDistribution ?? []
  const scoreDistributionData = {
    labels: scoreDistribution.map((bucket) => bucket.range),
    datasets: [
      {
        label: 'Number of Candidates',
        data: scoreDistribution.map((bucket) => bucket.count),
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(99, 102, 241, 0.7)',
        borderColor: isDark ? 'rgba(59, 130, 246, 1)' : 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
      },
    ],
  }
  const scoreChartOptions = {
    scales: {
      x: {
        grid: { display: false, drawTicks: false },
        border: { display: false },
        ticks: { color: isDark ? '#d1d5db' : '#374151' },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: isDark ? '#d1d5db' : '#374151' },
        grid: { color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0,0,0,0.05)' },
      },
    },
  }

  const pipeline = analytics?.pipeline ?? {}
  const pipelineEntries = PIPELINE_ORDER.map((status) => ({
    status,
    label: STATUS_META[status]?.label || status,
    count: pipeline[status] ?? 0,
  })).filter((entry) => entry.count > 0)
  const pipelineMax = Math.max(1, ...pipelineEntries.map((e) => e.count))

  const applicationsPerJob = analytics?.applicationsPerJob ?? []
  const jobsMax = Math.max(1, ...applicationsPerJob.map((j) => j.count))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruiter Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your hiring pipeline and candidate performance.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalCandidates ?? 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Across all your jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Match Score</CardTitle>
            <Star className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.averageMatchScore != null
                ? `${analytics.averageMatchScore.toFixed(1)}%`
                : '—'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Resume-to-job match</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Round 1 Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.round1PassRate != null
                ? `${analytics.round1PassRate.toFixed(0)}%`
                : '—'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Candidates advancing to Round 2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.hiredCount ?? 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Successful placements</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Final/interview score buckets across candidates.</CardDescription>
          </CardHeader>
          <CardContent>
            {scoreDistribution.length > 0 ? (
              <div className="h-[320px] w-full">
                <BarChart data={scoreDistributionData} options={scoreChartOptions} />
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 py-8 text-center">
                No scored candidates yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiring Funnel</CardTitle>
            <CardDescription>Progress of candidates through the pipeline.</CardDescription>
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
                <p className="text-sm text-gray-600 dark:text-gray-400 py-8 text-center">
                  No applications yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications per job */}
      <Card>
        <CardHeader>
          <CardTitle>Applications per Job</CardTitle>
          <CardDescription>Which postings attract the most candidates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {applicationsPerJob.map(({ jobId, title, count }) => (
              <div key={jobId} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-56 truncate">
                  {title}
                </span>
                <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${(count / jobsMax) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                  {count}
                </span>
              </div>
            ))}
            {applicationsPerJob.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 py-4 text-center">
                No jobs posted yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RecruiterAnalytics
