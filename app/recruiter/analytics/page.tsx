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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 dark:border-jade-400"></div>
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
        backgroundColor: isDark ? 'rgba(34, 211, 238, 0.7)' : 'rgba(8, 145, 178, 0.7)',
        borderColor: isDark ? 'rgba(34, 211, 238, 1)' : 'rgba(8, 145, 178, 1)',
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
        grid: { color: isDark ? '#1B2A4A' : 'rgba(0,0,0,0.05)' },
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
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Recruiter Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your hiring pipeline and candidate performance.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="eyebrow">Total Candidates</p>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="font-data text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalCandidates ?? 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Across all your jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="eyebrow">Average Match Score</p>
            <Star className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="font-data text-2xl font-bold text-gray-900 dark:text-white">
              {analytics?.averageMatchScore != null
                ? `${analytics.averageMatchScore.toFixed(1)}%`
                : '—'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Resume-to-job match</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="eyebrow">Round 1 Pass Rate</p>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="font-data text-2xl font-bold text-gray-900 dark:text-white">
              {analytics?.round1PassRate != null
                ? `${analytics.round1PassRate.toFixed(0)}%`
                : '—'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Candidates advancing to Round 2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="eyebrow">Hired</p>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="font-data text-2xl font-bold text-gray-900 dark:text-white">{analytics?.hiredCount ?? 0}</div>
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
                  <div className="flex-1 bg-line-light dark:bg-line-dark rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        status === 'rejected'
                          ? 'bg-red-500 dark:bg-red-400'
                          : 'bg-jade-600 dark:bg-jade-400'
                      }`}
                      style={{ width: `${(count / pipelineMax) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-data text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
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
                <div className="flex-1 bg-line-light dark:bg-line-dark rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-jade-600 dark:bg-jade-400 transition-all duration-300"
                    style={{ width: `${(count / jobsMax) * 100}%` }}
                  ></div>
                </div>
                <span className="font-data text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
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
