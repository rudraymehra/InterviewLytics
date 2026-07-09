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
import Reveal, { CountUp } from '@/components/landing/Reveal'
import { dashboardApi, CandidateDashboard as CandidateDashboardData, ApplicationStatus, STATUS_META } from '@/utils/apiClient'

const TONE_CLASSES: Record<string, string> = {
  neutral: 'font-data bg-gray-500/10 text-gray-300',
  info: 'font-data bg-blue-400/10 text-blue-400',
  success: 'font-data bg-jade-400/10 text-jade-400',
  warning: 'font-data bg-amber-400/10 text-amber-400',
  danger: 'font-data bg-red-400/10 text-red-400',
}

const PRIMARY_BTN =
  'bg-jade-500 border-transparent text-ink hover:bg-jade-400 hover:text-ink hover:border-transparent dark:border-transparent dark:text-ink dark:hover:border-transparent dark:hover:text-ink focus-visible:ring-2 focus-visible:ring-jade-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060913]'

/** Designed empty state: glyph tile + eyebrow + headline + sub + optional CTA. */
const EmptyState: React.FC<{
  icon: React.ElementType
  eyebrow: string
  title: string
  sub: string
  cta?: React.ReactNode
}> = ({ icon: Icon, eyebrow, title, sub, cta }) => (
  <div className="relative overflow-hidden py-14 text-center">
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full bg-jade-500/10 blur-3xl"
    />
    <div className="relative flex flex-col items-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-jade-400/25 bg-jade-400/10">
        <Icon className="h-7 w-7 text-jade-400" strokeWidth={1.5} />
      </div>
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-gray-400">{sub}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  </div>
)

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
        return <CheckCircle className="w-5 h-5 text-jade-400" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'shortlisted':
        return <Star className="w-5 h-5 text-amber-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-400"></div>
      </div>
    )
  }

  if (loadError) {
    return (
      <Card className="rounded-xl">
        <CardContent className="p-0">
          <EmptyState
            icon={XCircle}
            eyebrow="CONNECTION ERROR"
            title="Couldn't load your dashboard"
            sub={loadError}
            cta={
              <Button className={PRIMARY_BTN} onClick={fetchDashboardData}>
                Retry
              </Button>
            }
          />
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
      color: 'text-gray-400',
      bgColor: 'bg-white/5 border border-line-dark'
    },
    {
      title: 'Interviews Completed',
      value: stats?.interviewsCompleted ?? 0,
      icon: MessageCircle,
      color: 'text-gray-400',
      bgColor: 'bg-white/5 border border-line-dark'
    },
    {
      title: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: Clock,
      color: 'text-gray-400',
      bgColor: 'bg-white/5 border border-line-dark'
    },
    {
      title: 'Offers',
      value: stats?.offers ?? 0,
      icon: CheckCircle,
      color: 'text-jade-400',
      bgColor: 'bg-jade-400/10 border border-jade-400/25'
    }
  ]

  const nextActions = data?.nextActions ?? []
  const recentApplications = data?.recentApplications ?? []

  const quickActions = [
    {
      icon: Search,
      label: 'Find New Jobs',
      sub: 'Browse open roles',
      href: '/candidate/jobs'
    },
    {
      icon: FileText,
      label: 'My Applications',
      sub: 'Track every submission',
      href: '/candidate/applications'
    },
    {
      icon: Star,
      label: 'View Feedback',
      sub: 'AI interview insights',
      href: '/candidate/feedback'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="eyebrow">CANDIDATE PORTAL</p>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.name}!</p>
        </div>
        <Button className={PRIMARY_BTN} onClick={() => router.push('/candidate/jobs')}>
          <Search className="w-4 h-4 mr-2" />
          Find Jobs
        </Button>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <p className="eyebrow">OVERVIEW</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Reveal key={index} index={index} className="h-full">
              <Card className="h-full rounded-xl transition-colors hover:border-jade-400/30">
                <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <p className="eyebrow pt-2 leading-relaxed">{stat.title}</p>
                    <div className={`h-10 w-10 shrink-0 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.75} />
                    </div>
                  </div>
                  <p className="font-data text-3xl font-semibold text-white">
                    <CountUp value={stat.value} />
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Next actions */}
      <Reveal delay={0.1}>
        <Card className="rounded-xl">
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
                    className="scanline-hover flex items-center justify-between gap-4 p-4 bg-white/5 border border-line-dark rounded-xl transition-transform duration-150 motion-safe:hover:-translate-y-0.5"
                  >
                    <div className="min-w-0">
                      <h3 className="font-medium text-white truncate">{action.jobTitle}</h3>
                      <p className="text-sm text-gray-300">{action.company}</p>
                      <p className="font-data text-xs uppercase tracking-wide text-jade-400 mt-1">{action.label}</p>
                    </div>
                    <Button
                      size="sm"
                      className={PRIMARY_BTN}
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
              <EmptyState
                icon={MessageCircle}
                eyebrow="STANDBY"
                title="No interviews queued"
                sub="Nothing pending — apply to jobs to unlock AI interviews."
                cta={
                  <Button variant="outline" onClick={() => router.push('/candidate/jobs')}>
                    <Search className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </Reveal>

      {/* Recent Applications */}
      <Reveal delay={0.1}>
        <Card className="rounded-xl">
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
                      className="scanline-hover flex items-center justify-between gap-4 p-4 border border-line-dark rounded-xl bg-[#0B1122] hover:bg-white/5 transition-colors"
                    >
                      <div className="flex min-w-0 items-center space-x-4">
                        {getStatusIcon(application.status)}
                        <div className="min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {application.job?.title || 'Job'}
                          </h3>
                          <p className="text-sm text-gray-300">
                            {application.job?.company || ''}
                          </p>
                          <p className="font-data text-xs text-gray-500 mt-0.5">
                            Applied {new Date(application.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center space-x-4">
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
              <EmptyState
                icon={FileText}
                eyebrow="AWAITING DATA"
                title="No applications yet"
                sub="Start applying to jobs to see them here"
                cta={
                  <Button className={PRIMARY_BTN} onClick={() => router.push('/candidate/jobs')}>
                    <Search className="w-4 h-4 mr-2" />
                    Find Jobs
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </Reveal>

      {/* Quick Actions */}
      <Reveal delay={0.1}>
        <Card className="rounded-xl">
          <CardHeader>
            <p className="eyebrow">SHORTCUTS</p>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.href}
                  type="button"
                  onClick={() => router.push(action.href)}
                  className="scanline-hover group flex items-center gap-4 rounded-xl border border-line-dark bg-white/[0.02] p-5 text-left transition-all duration-150 hover:border-jade-400/40 hover:bg-white/5 motion-safe:hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060913]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-jade-400/25 bg-jade-400/10">
                    <action.icon className="h-5 w-5 text-jade-400" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-white">{action.label}</span>
                    <span className="block font-data text-xs text-gray-500">{action.sub}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-600 transition-all duration-150 group-hover:text-jade-400 motion-safe:group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  )
}

export default CandidateDashboard
