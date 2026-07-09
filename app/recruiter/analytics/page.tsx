'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { BarChart } from '@/components/charts'
import {
  Users,
  CheckCircle,
  Star,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Filter,
  Briefcase,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import Reveal, { CountUp, GrowBar } from '@/components/landing/Reveal'
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

/** Designed empty state — glyph tile on a faint orb, eyebrow + headline + sub. */
const EmptyState: React.FC<{
  icon: LucideIcon
  eyebrow: string
  title: string
  sub: string
}> = ({ icon: Icon, eyebrow, title, sub }) => (
  <div className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-14 text-center">
    <div
      aria-hidden
      className="pointer-events-none absolute top-6 h-44 w-44 rounded-full bg-jade-500/10 blur-3xl"
    />
    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-jade-500/25 bg-jade-500/10">
      <Icon className="h-7 w-7 text-jade-400" strokeWidth={1.75} />
    </div>
    <p className="eyebrow mt-6">{eyebrow}</p>
    <h4 className="mt-1.5 font-display text-base font-semibold text-white">{title}</h4>
    <p className="mt-1 max-w-xs text-sm text-gray-400">{sub}</p>
  </div>
)

const StatCard: React.FC<{
  index: number
  icon: LucideIcon
  label: string
  sub: string
  children: React.ReactNode
}> = ({ index, icon: Icon, label, sub, children }) => (
  <Reveal index={index} className="h-full">
    <Card className="scanline-hover group relative h-full overflow-hidden rounded-xl transition-colors duration-200 hover:border-jade-500/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="eyebrow pt-1">{label}</p>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-jade-500/20 bg-jade-500/10 transition-colors duration-200 group-hover:border-jade-500/40">
            <Icon className="h-4 w-4 text-jade-400" strokeWidth={1.75} />
          </span>
        </div>
        <div className="mt-3 font-data text-3xl font-bold tracking-tight text-white">
          {children}
        </div>
        <p className="mt-1.5 text-xs text-gray-400">{sub}</p>
      </CardContent>
    </Card>
  </Reveal>
)

const RecruiterAnalytics: React.FC = () => {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [analytics, setAnalytics] = useState<RecruiterAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await recruiterApi.analytics()
      setAnalytics(data)
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load analytics data')
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
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-jade-400"></div>
      </div>
    )
  }

  if (loadError) {
    return (
      <Card className="rounded-xl">
        <CardContent className="relative flex flex-col items-center overflow-hidden px-6 py-14 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute top-6 h-44 w-44 rounded-full bg-red-500/10 blur-3xl"
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10">
            <AlertTriangle className="h-7 w-7 text-red-400" strokeWidth={1.75} />
          </div>
          <p className="eyebrow mt-6">Transmission Error</p>
          <h3 className="mt-1.5 font-display text-lg font-semibold text-white">
            Couldn&apos;t load analytics
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-400">{loadError}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-6 rounded-lg bg-jade-500 px-6 py-2 font-data text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-jade-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  const scoreDistribution = analytics?.scoreDistribution ?? []
  const hasScoredCandidates = scoreDistribution.some((bucket) => bucket.count > 0)
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
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="eyebrow">Pipeline Intelligence</p>
          <h1 className="font-display text-2xl font-bold text-white">Recruiter Analytics</h1>
          <p className="text-sm text-gray-400">
            Overview of your hiring pipeline and candidate performance.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-line-dark px-4 py-2 font-data text-xs font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:border-jade-500/50 hover:text-jade-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Data
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} icon={Users} label="Total Candidates" sub="Across all your jobs">
          <CountUp value={analytics?.totalCandidates ?? 0} />
        </StatCard>
        <StatCard index={1} icon={Star} label="Average Match Score" sub="Resume-to-job match">
          {analytics?.averageMatchScore != null ? (
            <CountUp value={analytics.averageMatchScore} suffix="%" />
          ) : (
            <span className="text-gray-600">—</span>
          )}
        </StatCard>
        <StatCard
          index={2}
          icon={CheckCircle}
          label="Round 1 Pass Rate"
          sub="Candidates advancing to Round 2"
        >
          {analytics?.round1PassRate != null ? (
            <CountUp value={analytics.round1PassRate} suffix="%" />
          ) : (
            <span className="text-gray-600">—</span>
          )}
        </StatCard>
        <StatCard index={3} icon={TrendingUp} label="Hired" sub="Successful placements">
          <CountUp value={analytics?.hiredCount ?? 0} />
        </StatCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Reveal delay={0.1} className="h-full">
          <Card className="h-full rounded-xl transition-colors duration-200 hover:border-jade-500/30">
            <CardHeader>
              <p className="eyebrow">Signal</p>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>Final/interview score buckets across candidates.</CardDescription>
            </CardHeader>
            <CardContent>
              {hasScoredCandidates ? (
                <div className="h-[320px] w-full">
                  <BarChart data={scoreDistributionData} options={scoreChartOptions} />
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  eyebrow="Awaiting Signal"
                  title="No scored candidates yet"
                  sub="Score buckets will populate as candidates complete their interviews."
                />
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.17} className="h-full">
          <Card className="h-full rounded-xl transition-colors duration-200 hover:border-jade-500/30">
            <CardHeader>
              <p className="eyebrow">Flow</p>
              <CardTitle>Hiring Funnel</CardTitle>
              <CardDescription>Progress of candidates through the pipeline.</CardDescription>
            </CardHeader>
            <CardContent>
              {pipelineEntries.length > 0 ? (
                <div className="space-y-3">
                  {pipelineEntries.map(({ status, label, count }) => (
                    <div key={status} className="flex items-center gap-3">
                      <span className="basis-1/3 max-w-[10rem] min-w-0 shrink-0 truncate text-sm text-gray-300">
                        {label}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-dark">
                        <GrowBar
                          percent={(count / pipelineMax) * 100}
                          className={`h-1.5 rounded-full ${
                            status === 'rejected' ? 'bg-red-400' : 'bg-jade-400'
                          }`}
                        />
                      </div>
                      <span className="w-8 text-right font-data text-sm font-semibold text-white">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Filter}
                  eyebrow="Pipeline Idle"
                  title="No applications yet"
                  sub="Funnel stages will light up as candidates start applying to your jobs."
                />
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>

      {/* Applications per job */}
      <Reveal delay={0.1}>
        <Card className="rounded-xl transition-colors duration-200 hover:border-jade-500/30">
          <CardHeader>
            <p className="eyebrow">Demand</p>
            <CardTitle>Applications per Job</CardTitle>
            <CardDescription>Which postings attract the most candidates.</CardDescription>
          </CardHeader>
          <CardContent>
            {applicationsPerJob.length > 0 ? (
              <div className="space-y-1">
                {applicationsPerJob.map(({ jobId, title, count }, i) => (
                  <div
                    key={jobId}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-white/[0.03]"
                  >
                    <span className="w-7 shrink-0 font-data text-xs text-jade-500/70">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="basis-1/3 max-w-[14rem] min-w-0 shrink-0 truncate text-sm text-gray-300">
                      {title}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-dark">
                      <GrowBar
                        percent={(count / jobsMax) * 100}
                        className="h-1.5 rounded-full bg-jade-400"
                      />
                    </div>
                    <span className="w-8 text-right font-data text-sm font-semibold text-white">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Briefcase}
                eyebrow="No Postings"
                title="No jobs posted yet"
                sub="Post your first job to start tracking applicant demand across roles."
              />
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  )
}

export default RecruiterAnalytics
