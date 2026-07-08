'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  applicationsApi,
  Application,
  ApplicationDetail,
  InterviewQuestion,
  SessionDetail,
  STATUS_META,
} from '@/utils/apiClient'
import ScoreDial, { scoreTextClass, scoreBarClass } from '@/components/ui/ScoreDial'

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
      className={`rounded-lg border border-line-light dark:border-line-dark bg-paper dark:bg-ink ${
        isCross ? 'ml-8' : ''
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="px-2 py-1 bg-white dark:bg-[#0B1122] border border-line-light dark:border-line-dark text-gray-600 dark:text-gray-300 rounded-full font-data text-[11px] tracking-[0.14em] uppercase font-medium whitespace-nowrap">
            {isCross ? '↳ Follow-up' : `Q${String(question.question_number).padStart(2, '0')}`}
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
          <span className="text-gray-400">{open ? '▲' : '▼'}</span>
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
                      <div
                        className={`h-1.5 rounded-full ${scoreBarClass(value)}`}
                        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                      ></div>
                    </div>
                    <span className="font-data text-xs font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">
                      {value}
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

  return (
    <div className="space-y-8">
      {/* Overall Score Card */}
      <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-8 border border-line-light dark:border-line-dark">
        <div className="text-center">
          <p className="eyebrow mb-6">{eyebrow}</p>

          <div className="flex justify-center items-center gap-4 mb-6">
            {session.overall_score != null ? (
              <ScoreDial
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
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {session.overall_feedback}
            </p>
          )}
          {session.status === 'in_progress' && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-4">
              This round is still in progress — results shown are partial.
            </p>
          )}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      {((session.strengths && session.strengths.length > 0) ||
        (session.weaknesses && session.weaknesses.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-6 border border-line-light dark:border-line-dark">
            <p className="eyebrow mb-4">STRENGTHS</p>
            <ul className="space-y-3">
              {(session.strengths || []).map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-[#0D9488] dark:text-[#34F5C5] text-lg leading-6">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-6 border border-line-light dark:border-line-dark">
            <p className="eyebrow mb-4">AREAS TO IMPROVE</p>
            <ul className="space-y-3">
              {(session.weaknesses || []).map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-amber-600 dark:text-amber-400 text-lg leading-6">→</span>
                  <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Question-by-Question Breakdown */}
      <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-6 border border-line-light dark:border-line-dark">
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

  return (
    <div className="space-y-8">
      {/* Final score */}
      <div className="hud-panel rounded-none shadow-sm p-8 text-center">
        <p className="eyebrow mb-6">FINAL VERDICT</p>
        <div className="flex justify-center mb-6">
          <ScoreDial
            value={report.finalScore}
            size={160}
            grade={report.grade ? `GRADE ${report.grade}` : 'FINAL / 100'}
          />
        </div>
        <span
          className={`inline-block px-5 py-2 rounded-full font-data text-sm tracking-[0.08em] uppercase font-semibold ${rec.classes}`}
        >
          {rec.label}
        </span>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mt-6">
          {report.summary}
        </p>
      </div>

      {/* Weighted breakdown */}
      <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-6 border border-line-light dark:border-line-dark">
        <p className="eyebrow mb-2">WEIGHTED BREAKDOWN</p>
        <p className="font-data text-xs text-gray-500 dark:text-gray-400 mb-5">
          RESUME 20% · ROUND 01 35% · ROUND 02 45%
        </p>
        <div className="space-y-4">
          {[
            { label: 'RESUME 20%', value: application.match_percentage },
            { label: 'ROUND 01 35%', value: application.round1_score },
            { label: 'ROUND 02 45%', value: application.round2_score },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="font-data text-[11px] tracking-[0.14em] uppercase text-gray-600 dark:text-gray-400 w-36">
                {label}
              </span>
              <div className="flex-1 bg-line-light dark:bg-line-dark rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${value != null ? scoreBarClass(value) : 'bg-gray-300 dark:bg-gray-600'}`}
                  style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }}
                ></div>
              </div>
              <span className="font-data text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">
                {value != null ? value : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Round comparison */}
      {report.roundComparison && (
        <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-6 border border-line-light dark:border-line-dark">
          <p className="eyebrow mb-3">ROUND COMPARISON</p>
          <p className="text-gray-700 dark:text-gray-300">{report.roundComparison}</p>
        </div>
      )}

      {/* Strengths & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-6 border border-line-light dark:border-line-dark">
          <p className="eyebrow mb-4">STRENGTHS</p>
          <ul className="space-y-3">
            {report.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-[#0D9488] dark:text-[#34F5C5] text-lg leading-6">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-6 border border-line-light dark:border-line-dark">
          <p className="eyebrow mb-4">RISKS</p>
          <ul className="space-y-3">
            {report.risks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-[#DC2626] dark:text-[#FF3B5C] text-lg leading-6">!</span>
                <span className="text-gray-700 dark:text-gray-300">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
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
              Choose an application to review its feedback
            </p>
          </div>

          {applicationChoices && applicationChoices.length > 0 ? (
            <div className="space-y-4">
              {applicationChoices.map((app) => (
                <button
                  key={app.id}
                  onClick={() => router.push(`/candidate/feedback?applicationId=${app.id}`)}
                  className="scanline-hover w-full text-left bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-6 border border-line-light dark:border-line-dark hover:border-jade-600 dark:hover:border-jade-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {app.job?.title || 'Job'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {app.job?.company} · {STATUS_META[app.status]?.label || app.status}
                      </p>
                    </div>
                    <span className="text-jade-700 dark:text-jade-400 font-semibold text-sm">
                      View feedback →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-12 text-center border border-line-light dark:border-line-dark">
              <p className="eyebrow mb-4">NOTHING TO REVIEW YET</p>
              <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No feedback yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Complete an interview round to see feedback here.
              </p>
              <button
                onClick={() => router.push('/candidate/applications')}
                className="px-6 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors"
              >
                Go to My Applications
              </button>
            </div>
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
          <div className="bg-white dark:bg-[#0B1122] rounded-lg shadow-sm p-12 text-center border border-line-light dark:border-line-dark">
            <p className="eyebrow mb-4">NOTHING TO REVIEW YET</p>
            <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No feedback yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete an interview round to see your feedback here.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs — quiet underline */}
            <div className="flex justify-center gap-8 mb-8 border-b border-line-light dark:border-line-dark">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 -mb-px text-sm font-semibold transition-colors border-b-2 ${
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
        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={() => router.push('/candidate/applications')}
            className="px-8 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink hover:bg-jade-700 dark:hover:bg-jade-400 font-data uppercase tracking-wide rounded font-semibold transition-colors"
          >
            Back to Applications
          </button>
          <button
            onClick={() => router.push('/candidate/dashboard')}
            className="px-8 py-3 border border-jade-600 text-jade-700 dark:border-jade-400/60 dark:text-jade-400 font-data uppercase tracking-wide rounded font-semibold hover:bg-jade-50 dark:hover:bg-jade-400/10 transition-colors"
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl dark:text-white">Loading feedback...</div>
        </div>
      }
    >
      <FeedbackPageContent />
    </Suspense>
  )
}
