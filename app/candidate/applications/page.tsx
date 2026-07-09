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
  Award,
  ChevronDown,
  FilterX,
  Inbox
} from 'lucide-react'
import { scoreTextClass } from '@/components/ui/ScoreDial'
import Reveal, { CountUp } from '@/components/landing/Reveal'
import {
  applicationsApi,
  Application,
  ApplicationStatus,
  STATUS_META
} from '@/utils/apiClient'

const PRIMARY_BTN =
  'bg-jade-500 border-transparent text-ink hover:bg-jade-400 hover:text-ink hover:border-transparent dark:border-transparent dark:text-ink dark:hover:border-transparent dark:hover:text-ink focus-visible:ring-2 focus-visible:ring-jade-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060913]'

const TONE_CLASSES: Record<string, string> = {
  neutral: 'font-data border border-gray-400/20 bg-gray-500/10 text-gray-300',
  info: 'font-data border border-blue-400/20 bg-blue-400/10 text-blue-400',
  success: 'font-data border border-jade-400/20 bg-jade-400/10 text-jade-400',
  warning: 'font-data border border-amber-400/20 bg-amber-400/10 text-amber-400',
  danger: 'font-data border border-red-400/20 bg-red-400/10 text-red-400',
}

/** Designed empty state: glyph tile + eyebrow + headline + sub + optional CTA. */
const EmptyState: React.FC<{
  icon: React.ElementType
  eyebrow: string
  title: string
  sub: string
  tone?: 'jade' | 'red'
  cta?: React.ReactNode
}> = ({ icon: Icon, eyebrow, title, sub, tone = 'jade', cta }) => (
  <div className="relative overflow-hidden py-14 text-center">
    <div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl ${
        tone === 'red' ? 'bg-red-500/10' : 'bg-jade-500/10'
      }`}
    />
    <div className="relative flex flex-col items-center">
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border ${
          tone === 'red'
            ? 'border-red-400/25 bg-red-400/10'
            : 'border-jade-400/25 bg-jade-400/10'
        }`}
      >
        <Icon
          className={`h-7 w-7 ${tone === 'red' ? 'text-red-400' : 'text-jade-400'}`}
          strokeWidth={1.5}
        />
      </div>
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-gray-400">{sub}</p>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  </div>
)

/** Strip emoji/non-ASCII from API-provided labels (e.g. "Hired 🎉") — design system is icon-only. */
const cleanLabel = (label: string) => label.replace(new RegExp('[^\\x20-\\x7E]+', 'g'), '').trim()

const STAT_TONES = [
  'text-white',
  'text-blue-400',
  'text-amber-400',
  'text-jade-400',
]

const CandidateApplications: React.FC = () => {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const { applications } = await applicationsApi.listMine()
      setApplications(applications)
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load applications')
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
        return <CheckCircle className="w-5 h-5 text-jade-400" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'shortlisted':
        return <Star className="w-5 h-5 text-amber-400" />
      default:
        return <Clock className="w-5 h-5 text-blue-400" />
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

  const isFiltering = searchTerm !== '' || statusFilter !== 'all'

  const stats: Array<{ label: string; value: number }> = [
    { label: 'Total Applications', value: applications.length },
    {
      label: 'Interviews In Progress',
      value: applications.filter((app) =>
        ['round1_in_progress', 'round2_in_progress'].includes(app.status)
      ).length,
    },
    { label: 'Shortlisted', value: applications.filter((app) => app.status === 'shortlisted').length },
    { label: 'Hired', value: applications.filter((app) => app.status === 'hired').length },
  ]

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-400" />
        <p className="eyebrow">Loading Applications</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <Card className="rounded-xl">
        <CardContent className="p-0">
          <EmptyState
            icon={XCircle}
            tone="red"
            eyebrow="Connection Error"
            title="Couldn't load your applications"
            sub={loadError}
            cta={
              <Button className={PRIMARY_BTN} onClick={fetchData}>
                Retry
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="eyebrow">Candidate Portal</p>
          <h1 className="font-display text-3xl font-bold text-white">My Applications</h1>
          <p className="text-gray-400">Track your job applications and their status</p>
        </div>
        <Button className={PRIMARY_BTN} onClick={() => router.push('/candidate/jobs')}>
          <Search className="w-4 h-4 mr-2" />
          Find Jobs
        </Button>
      </div>

      {/* Application Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} index={i}>
            <Card className="rounded-xl transition-colors hover:border-jade-400/30">
              <CardContent className="p-5">
                <div className={`font-data text-3xl font-bold ${STAT_TONES[i]}`}>
                  <CountUp value={stat.value} />
                </div>
                <p className="eyebrow mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* Search and Filters — hidden until there is something to filter */}
      {applications.length > 0 && (
      <Reveal>
        <Card className="rounded-xl">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-line-dark rounded-lg bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-9 py-2 text-sm border border-line-dark rounded-lg bg-white/5 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {(Object.keys(STATUS_META) as ApplicationStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {cleanLabel(STATUS_META[status].label)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              <p className="font-data text-xs text-gray-500 whitespace-nowrap">
                {filteredApplications.length} of {applications.length} shown
              </p>
            </div>
          </CardContent>
        </Card>
      </Reveal>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application, appIndex) => {
          const job = application.job
          const meta = STATUS_META[application.status]
          const cta = meta?.cta
          const inProgress = application.status.includes('in_progress')
          return (
            <Reveal key={application.id} index={Math.min(appIndex, 4)}>
              <Card className="scanline-hover rounded-xl transition-colors hover:border-jade-400/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-jade-400/20 bg-jade-400/10">
                        <Building2 className="w-6 h-6 text-jade-400" strokeWidth={1.5} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-3 mb-2">
                          <h3 className="font-display text-lg font-semibold text-white">
                            {job?.title || 'Job Title'}
                          </h3>
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full ${TONE_CLASSES[meta?.tone || 'neutral']}${
                              inProgress ? ' motion-safe:animate-pulse' : ''
                            }`}
                          >
                            {cleanLabel(meta?.label || application.status)}
                          </span>
                          {application.match_percentage != null && (
                            <div className={`flex items-center text-sm font-data ${scoreTextClass(application.match_percentage)}`}>
                              {application.match_percentage}% Match
                            </div>
                          )}
                        </div>

                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-400 mb-3">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1.5 text-gray-500" />
                            {job?.company || 'Company'}
                          </div>
                          {job?.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1.5 text-gray-500" />
                              {job.location}
                            </div>
                          )}
                          {job?.salary_range && (
                            <div className="flex items-center font-data">
                              <DollarSign className="w-4 h-4 mr-1.5 text-gray-500" />
                              {job.salary_range}
                            </div>
                          )}
                          <div className="flex items-center font-data">
                            <Calendar className="w-4 h-4 mr-1.5 text-gray-500" />
                            Applied {new Date(application.applied_at).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Round scores */}
                        {hasCompletedRound(application) && (
                          <div className="flex items-center flex-wrap gap-2 mb-3">
                            {application.round1_score != null && (
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full font-data border border-line-dark bg-white/5 ${scoreTextClass(application.round1_score)}`}>
                                <Award className="w-3 h-3 mr-1" />
                                Round 1: {application.round1_score}/100
                                {application.round1_grade ? ` · Grade ${application.round1_grade}` : ''}
                              </span>
                            )}
                            {application.round2_score != null && (
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full font-data border border-line-dark bg-white/5 ${scoreTextClass(application.round2_score)}`}>
                                <Award className="w-3 h-3 mr-1" />
                                Round 2: {application.round2_score}/100
                                {application.round2_grade ? ` · Grade ${application.round2_grade}` : ''}
                              </span>
                            )}
                            {application.final_score != null && (
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full font-data border border-line-dark bg-white/5 ${scoreTextClass(application.final_score)}`}>
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
                              className={PRIMARY_BTN}
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
                          {hasCompletedRound(application) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="focus-visible:ring-2 focus-visible:ring-jade-400/60"
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

                    <div className="flex items-center">
                      {getStatusIcon(application.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          )
        })}
      </div>

      {filteredApplications.length === 0 && (
        <Reveal>
          <Card className="rounded-xl">
            <CardContent className="p-0">
              {isFiltering ? (
                <EmptyState
                  icon={FilterX}
                  eyebrow="No Matches"
                  title="No applications found"
                  sub="Try adjusting your search criteria"
                  cta={
                    <Button
                      variant="outline"
                      className="focus-visible:ring-2 focus-visible:ring-jade-400/60"
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                      }}
                    >
                      <FilterX className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Inbox}
                  eyebrow="Application Tracker"
                  title="No applications found"
                  sub="You haven't applied to any jobs yet — browse open roles and your applications will show up here."
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
      )}

    </div>
  )
}

export default CandidateApplications
