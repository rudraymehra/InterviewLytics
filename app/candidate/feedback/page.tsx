'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  applicationsApi,
  Application,
  ApplicationDetail,
  FeedbackPoint,
  InterviewQuestion,
  SessionDetail,
  STATUS_META,
  normalizePoints,
} from '@/utils/apiClient'
import { scoreTextClass, scoreBarClass } from '@/components/ui/ScoreDial'
import Reveal, { AnimatedScoreDial, GrowBar } from '@/components/landing/Reveal'
import { ArrowRight, ChevronDown, CornerDownRight, FileSearch } from 'lucide-react'

type TabKey = 'round1' | 'round2' | 'final'

const RECOMMENDATION_META: Record<string, { label: string; classes: string }> = {
  strong_hire: {
    label: 'Strong Hire',
    classes: 'bg-[#0D9488] text-white dark:bg-[#34F5C5]/20 dark:text-[#34F5C5]',
  },
  hire: {
    label: 'Hire',
    classes:
      'border border-[#0D9488] text-[#0D9488] dark:border-[#34F5C5]/60 dark:text-[#34F5C5] bg-transparent',
  },
  consider: {
    label: 'Consider',
    classes: 'bg-amber-100 text-[#B45309] dark:bg-[#FFB020]/10 dark:text-[#FFB020]',
  },
  no_hire: {
    label: 'No Hire',
    classes: 'bg-red-100 text-[#DC2626] dark:bg-[#FF3B5C]/10 dark:text-[#FF3B5C]',
  },
}

function getScoreColor(score?: number | null) {
  if (score == null) return 'text-gray-500 dark:text-gray-400'
  return scoreTextClass(score)
}

/** Order questions: primaries by number, cross-questions right after their parent. */
function sortQuestions(questions: InterviewQuestion[]): InterviewQuestion[] {
  const primaries = questions
    .filter((q) => q.question_type !== 'cross_question')
    .sort((a, b) => a.question_number - b.question_number)
  const crosses = questions.filter((q) => q.question_type === 'cross_question')
  const ordered: InterviewQuestion[] = []
  for (const primary of primaries) {
    ordered.push(primary)
    for (const cross of crosses) {
      if (cross.parent_question_id === primary.id) ordered.push(cross)
    }
  }
  for (const cross of crosses) {
    if (!ordered.includes(cross)) ordered.push(cross)
  }
  return ordered
}

// Marker colors per section tone (legible in both light and dark mode).
const POINT_TONES = {
  positive: 'text-[#0D9488] dark:text-[#34F5C5]',
  caution: 'text-amber-600 dark:text-[#FFB020]',
  risk: 'text-[#DC2626] dark:text-[#FF3B5C]',
} as const

/**
 * Titled feedback bullets: ▸ marker, bold title, multi-sentence detail.
 * Legacy points have no title — only the detail line is rendered.
 */
function FeedbackPointList({
  points,
  tone,
}: {
  points: FeedbackPoint[]
  tone: keyof typeof POINT_TONES
}) {
  return (
    <ul className="space-y-5">
      {points.map((point, idx) => (
        <Reveal
          key={idx}
          as="li"
          delay={Math.min(idx, 6) * 0.06}
          className="flex items-start gap-3"
        >
          <span className={`${POINT_TONES[tone]} text-base leading-6 select-none`} aria-hidden>
            ▸
          </span>
          <div className="flex-1 min-w-0">
            {point.title && (
              <p className="font-display font-semibold text-gray-900 dark:text-white leading-snug mb-1">
                {point.title}
              </p>
            )}
            <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
              {point.detail}
            </p>
          </div>
        </Reveal>
      ))}
    </ul>
  )
}

const DIMENSION_LABELS: Array<{ key: 'correctness' | 'clarity' | 'depth' | 'relevance'; label: string }> = [
  { key: 'correctness', label: 'Correctness' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'depth', label: 'Depth' },
  { key: 'relevance', label: 'Relevance' },
]

function QuestionAccordion({ question }: { question: InterviewQuestion }) {
  const [open, setOpen] = useState(false)
  const isCross = question.question_type === 'cross_question'

  return (
    <div
      className={`rounded-xl border border-line-light dark:border-line-dark bg-paper dark:bg-ink transition-colors hover:border-jade-600/40 dark:hover:border-jade-400/40 ${
        isCross ? 'ml-8' : ''
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-4 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#0B1122] border border-line-light dark:border-line-dark text-gray-600 dark:text-gray-300 rounded-full font-data text-[11px] tracking-[0.14em] uppercase font-medium whitespace-nowrap">
            {isCross ? (
              <>
                <CornerDownRight className="h-3 w-3 text-jade-600 dark:text-jade-400" aria-hidden />
                Follow-up
              </>
            ) : (
              `Q${String(question.question_number).padStart(2, '0')}`
            )}
          </span>
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {question.question_text}
          </p>
        </div>
        <div className="flex items-center gap-3 ml-3">
          {question.answer_score != null && (
            <span className={`font-data text-lg font-semibold ${getScoreColor(question.answer_score)}`}>
              {question.answer_score}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-gray-900 dark:text-white font-medium">{question.question_text}</p>

          <div>
            <p className="eyebrow mb-1.5">YOUR ANSWER</p>
            <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0B1122] p-3 rounded-lg border border-line-light dark:border-line-dark whitespace-pre-wrap">
              {question.candidate_answer || '—'}
            </p>
          </div>

          {question.answer_feedback && (
            <div className="p-3 bg-jade-50 dark:bg-jade-400/5 rounded-lg border border-jade-100 dark:border-jade-400/20">
              <p className="eyebrow mb-1.5">FEEDBACK</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{question.answer_feedback}</p>
            </div>
          )}

          {question.answer_evaluation && (
            <div className="space-y-2">
              {DIMENSION_LABELS.map(({ key, label }) => {
                const value = question.answer_evaluation?.[key]
                if (value == null) return null
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="font-data text-[11px] tracking-[0.14em] uppercase text-gray-500 dark:text-gray-400 w-24">
                      {label}
                    </span>
                    <div className="flex-1 bg-line-light dark:bg-line-dark rounded-full h-1.5">
                      {/* Dimensions are on a 0-10 scale */}
                      <div
                        className={`h-1.5 rounded-full ${scoreBarClass(value * 10)}`}
                        style={{ width: `${Math.min(100, Math.max(0, value * 10))}%` }}
                      ></div>
                    </div>
                    <span className="font-data text-xs font-semibold text-gray-700 dark:text-gray-300 w-10 text-right">
                      {value}/10
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RoundTab({ round }: { round: SessionDetail }) {
  const { session, questions } = round
  const ordered = sortQuestions(questions).filter((q) => q.candidate_answer != null)
  const eyebrow =
    session.round === 1 ? 'ROUND 01 — RESUME DEEP-DIVE' : 'ROUND 02 — ROLE FIT'
  const strengths = normalizePoints(session.strengths)
  const weaknesses = normalizePoints(session.weaknesses)

  return (
    <div className="space-y-8">
      {/* Overall Score Card */}
      <Reveal>
      <div className="bg-white dark:bg-[#0B1122] rounded-xl shadow-sm p-8 border border-line-light dark:border-line-dark">
        <div className="text-center">
          <p className="eyebrow mb-6">{eyebrow}</p>

          <div className="flex justify-center items-center gap-4 mb-6">
            {session.overall_score != null ? (
              <AnimatedScoreDial
                value={session.overall_score}
                size={128}
                grade={session.overall_grade ? `GRADE ${session.overall_grade}` : '/ 100'}
              />
            ) : (
              <div className="text-center">
                <div className="font-display text-5xl font-bold text-gray-400 dark:text-gray-500">—</div>
                <div className="eyebrow mt-2">OUT OF 100</div>
              </div>
            )}
          </div>

          {session.overall_feedback && (
            <div className="max-w-3xl mx-auto text-left border-t border-line-light dark:border-line-dark pt-6">
              <p className="eyebrow mb-3">OVERALL ASSESSMENT</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {session.overall_feedback}
              </p>
            </div>
          )}
          {session.status === 'in_progress' && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-4">
              This round is still in progress — results shown are partial.
            </p>
          )}
        </div>
      </div>
      </Reveal>

      {/* Strengths & Areas for Improvement */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal index={1} className="h-full">
          <div className="h-full bg-white dark:bg-[#0B1122] rounded-xl shadow-sm p-6 border border-line-light dark:border-line-dark">
            <p className="eyebrow mb-5">STRENGTHS</p>
            <FeedbackPointList points={strengths} tone="positive" />
          </div>
          </Reveal>

          <Reveal index={2} className="h-full">
          <div className="h-full bg-white dark:bg-[#0B1122] rounded-xl shadow-sm p-6 border border-line-light dark:border-line-dark">
            <p className="eyebrow mb-5">AREAS FOR IMPROVEMENT</p>
            <FeedbackPointList points={weaknesses} tone="caution" />
          </div>
          </Reveal>
        </div>
      )}

      {/* Question-by-Question Breakdown */}
      <Reveal index={3}>
      <div className="bg-white dark:bg-[#0B1122] rounded-xl shadow-sm p-6 border border-line-light dark:border-line-dark">
        <p className="eyebrow mb-6">QUESTION BREAKDOWN</p>
        <div className="space-y-4">
          {ordered.map((question) => (
            <QuestionAccordion key={question.id} question={question} />
          ))}
          {ordered.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400">No answered questions yet.</p>
          )}
        </div>
      </div>
      </Reveal>
    </div>
  )
}

function FinalReportTab({ application }: { application: ApplicationDetail }) {
  const report = application.final_report
  if (!report) return null
  const rec = RECOMMENDATION_META[report.recommendation] || {
    label: report.recommendation,
    classes: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-200',
  }
  const strengths = normalizePoints(report.strengths)
  const risks = normalizePoints(report.risks)

  return (
    <div className="space-y-8">
      {/* Final score */}
      <Reveal>
      <div className="hud-panel rounded-none shadow-sm p-8 text-center">
        <p className="eyebrow mb-6">FINAL VERDICT</p>
        <div className="flex justify-center mb-6">
          <AnimatedScoreDial
            value={report.finalScore}
            size={160}
            grade={report.grade ? `GRADE ${report.grade}` : 'FINAL / 100'}
          />
        </div>
        <Reveal as="span" pop delay={0.25} className="inline-block">
        <span
          className={`inline-block px-5 py-2 rounded-full font-data text-sm tracking-[0.08em] uppercase font-semibold ${rec.classes}`}
        >
          {rec.label}
        </span>
        </Reveal>
        {report.summary && (
          <div className="max-w-3xl mx-auto text-left border-t border-line-light dark:border-line-dark mt-8 pt-6">
            <p className="eyebrow mb-3">OVERALL ASSESSMENT</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{report.summary}</p>
          </div>
        )}
      </div>
      </Reveal>

      {/* Score breakdown */}
      <Reveal index={1}>
      <div className="bg-white dark:bg-[#0B1122] rounded-xl shadow-sm p-6 border border-line-light dark:border-line-dark">
        <p className="eyebrow mb-2">SCORE BREAKDOWN</p>
        <p className="font-data text-xs text-gray-500 dark:text-gray-400 mb-5">
          COMPONENTS OF YOUR WEIGHTED FINAL SCORE
        </p>
        <div className="space-y-4">
          {[
            { label: 'RESUME MATCH', value: application.match_percentage },
            { label: 'ROUND 01', value: application.round1_score },
            { label: 'ROUND 02', value: application.round2_score },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="font-data text-[11px] tracking-[0.14em] uppercase text-gray-600 dark:text-gray-400 w-36">
                {label}
              </span>
              <div className="flex-1 bg-line-light dark:bg-line-dark rounded-full h-1.5">
                <GrowBar
                  percent={value ?? 0}
                  className={`h-1.5 rounded-full ${value != null ? scoreBarClass(value) : 'bg-gray-300 dark:bg-gray-600'}`}
                />
              </div>
              <span className="font-data text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">
                {value != null ? value : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
      </Reveal>

      {/* Round comparison */}
      {report.roundComparison && (
        <Reveal index={2}>
        <div className="bg-white dark:bg-[#0B1122] rounded-xl shadow-sm p-6 border border-line-light dark:border-line-dark">
          <p className="eyebrow mb-3">ROUND COMPARISON</p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{report.roundComparison}</p>
        </div>
        </Reveal>
      )}

      {/* Strengths & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Reveal index={2} className="h-full">
        <div className="h-full bg-white dark:bg-[#0B1122] rounded-xl shadow-sm p-6 border border-line-light dark:border-line-dark">
          <p className="eyebrow mb-5">STRENGTHS</p>
          <FeedbackPointList points={strengths} tone="positive" />
        </div>
        </Reveal>

        <Reveal index={3} className="h-full">
        <div className="h-full bg-white dark:bg-[#0B1122] rounded-xl shadow-sm p-6 border border-line-light dark:border-line-dark">
          <p className="eyebrow mb-5">RISKS</p>
          <FeedbackPointList points={risks} tone="risk" />
        </div>
        </Reveal>
      </div>
    </div>
  )
}

function FeedbackPageContent() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams?.get('applicationId')

  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [applicationChoices, setApplicationChoices] = useState<Application[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey | null>(null)

  const fetchFeedback = useCallback(async () => {
    if (!applicationId) return
    try {
      const detail = await applicationsApi.get(applicationId)
      setApplication(detail)

      // Default to the latest available tab
      if (detail.final_report) {
        setActiveTab('final')
      } else if (detail.rounds.some((r) => r.session.round === 2)) {
        setActiveTab('round2')
      } else if (detail.rounds.some((r) => r.session.round === 1)) {
        setActiveTab('round1')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load feedback')
      router.push('/candidate/applications')
    } finally {
      setLoading(false)
    }
  }, [applicationId, router])

  const fetchChoices = useCallback(async () => {
    try {
      const { applications } = await applicationsApi.listMine()
      setApplicationChoices(
        applications.filter((a) => a.round1_score != null || a.round2_score != null)
      )
    } catch (err: any) {
      toast.error(err.message || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login-candidate')
      return
    }
    if (!applicationId) {
      // Reached without a specific application (e.g. from the sidebar):
      // let the candidate pick one with feedback available.
      setApplication(null)
      setLoading(true)
      fetchChoices()
      return
    }
    setLoading(true)
    fetchFeedback()
  }, [authLoading, isAuthenticated, applicationId, router, fetchFeedback, fetchChoices])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-2 border-line-light dark:border-line-dark border-b-jade-600 dark:border-b-jade-400 mx-auto mb-4"></div>
          <p className="eyebrow">Loading your results</p>
        </div>
      </div>
    )
  }

  if (!application) {
    // No applicationId in the URL: show a picker of applications with feedback.
    return (
      <div className="min-h-screen bg-paper dark:bg-ink py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="eyebrow mb-3">THE DOSSIER</p>
            <h1 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Interview Feedback
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {applicationChoices && applicationChoices.length > 0
                ? 'Choose an application to review its feedback'
                : 'Your interview results will be compiled here'}
            </p>
          </div>

          {applicationChoices && applicationChoices.length > 0 ? (
            <div className="space-y-4">
              {applicationChoices.map((app, choiceIndex) => (
                <Reveal key={app.id} index={Math.min(choiceIndex, 4)}>
                <button
                  onClick={() => router.push(`/candidate/feedback?applicationId=${app.id}`)}
                  className="scanline-hover group w-full text-left bg-white dark:bg-[#0B1122] rounded-xl shadow-sm p-6 border border-line-light dark:border-line-dark hover:border-jade-600 dark:hover:border-jade-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {app.job?.title || 'Job'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {app.job?.company} · {STATUS_META[app.status]?.label || app.status}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-jade-700 dark:text-jade-400 font-semibold text-sm">
                      View feedback
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                        aria-hidden
                      />
                    </span>
                  </div>
                </button>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
            <div className="relative overflow-hidden bg-white dark:bg-[#0B1122] rounded-xl shadow-sm px-8 py-16 text-center border border-line-light dark:border-line-dark">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-jade-400/[0.07] blur-3xl"
              />
              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-line-light dark:border-line-dark bg-paper dark:bg-ink">
                  <FileSearch className="h-7 w-7 text-jade-600 dark:text-jade-400" strokeWidth={1.5} aria-hidden />
                </div>
                <p className="eyebrow mb-3">NOTHING TO REVIEW YET</p>
                <h3 className="font-display text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Your dossier is empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                  Complete an interview round and your results will be compiled here.
                </p>
                <button
                  onClick={() => router.push('/candidate/applications')}
                  className="px-6 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B1122]"
                >
                  Go to My Applications
                </button>
              </div>
            </div>
            </Reveal>
          )}
        </div>
      </div>
    )
  }

  const round1 = application.rounds.find((r) => r.session.round === 1)
  const round2 = application.rounds.find((r) => r.session.round === 2)
  const isDemoMode = Boolean(
    application.match_analysis?.demoMode || application.final_report?.demoMode
  )

  const tabs: Array<{ key: TabKey; label: string }> = []
  if (round1) tabs.push({ key: 'round1', label: 'Round 1' })
  if (round2) tabs.push({ key: 'round2', label: 'Round 2' })
  if (application.final_report) tabs.push({ key: 'final', label: 'Final Report' })

  return (
    <div className="min-h-screen bg-paper dark:bg-ink py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="eyebrow mb-3">THE DOSSIER</p>
          <h1 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Interview Feedback
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {application.job?.title}
            {application.job?.company ? ` · ${application.job.company}` : ''}
          </p>
          {isDemoMode && (
            <span className="inline-block mt-2 px-3 py-1 font-data text-[11px] tracking-[0.14em] uppercase rounded-full bg-gray-100 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400">
              demo mode
            </span>
          )}
        </div>

        {tabs.length === 0 ? (
          <div className="relative overflow-hidden bg-white dark:bg-[#0B1122] rounded-xl shadow-sm px-8 py-16 text-center border border-line-light dark:border-line-dark">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-jade-400/[0.07] blur-3xl"
            />
            <div className="relative">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-line-light dark:border-line-dark bg-paper dark:bg-ink">
                <FileSearch className="h-7 w-7 text-jade-600 dark:text-jade-400" strokeWidth={1.5} aria-hidden />
              </div>
              <p className="eyebrow mb-3">NOTHING TO REVIEW YET</p>
              <h3 className="font-display text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No feedback yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                Complete an interview round to see your feedback here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs — quiet underline */}
            <div className="flex justify-center gap-8 mb-8 border-b border-line-light dark:border-line-dark">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 -mb-px text-sm font-semibold transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 rounded-t ${
                    activeTab === tab.key
                      ? 'border-jade-600 dark:border-jade-400 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'round1' && round1 && <RoundTab round={round1} />}
            {activeTab === 'round2' && round2 && <RoundTab round={round2} />}
            {activeTab === 'final' && <FinalReportTab application={application} />}
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mt-10">
          <button
            onClick={() => router.push('/candidate/applications')}
            className="w-full sm:w-auto px-8 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ink"
          >
            Back to Applications
          </button>
          <button
            onClick={() => router.push('/candidate/dashboard')}
            className="w-full sm:w-auto px-8 py-3 border border-jade-600 text-jade-700 dark:border-jade-400/60 dark:text-jade-400 font-data uppercase tracking-wide rounded font-semibold hover:bg-jade-50 dark:hover:bg-jade-400/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ink"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink">
          <div className="text-center">
            <div className="animate-spin motion-reduce:animate-none rounded-full h-14 w-14 border-2 border-line-light dark:border-line-dark border-b-jade-600 dark:border-b-jade-400 mx-auto mb-4"></div>
            <p className="eyebrow">Loading your results</p>
          </div>
        </div>
      }
    >
      <FeedbackPageContent />
    </Suspense>
  )
}
