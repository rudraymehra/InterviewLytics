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

type TabKey = 'round1' | 'round2' | 'final'

const RECOMMENDATION_META: Record<string, { label: string; classes: string }> = {
  strong_hire: {
    label: 'Strong Hire',
    classes: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
  },
  hire: {
    label: 'Hire',
    classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
  },
  consider: {
    label: 'Consider',
    classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200',
  },
  no_hire: {
    label: 'No Hire',
    classes: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
  },
}

function getGradeColor(grade?: string | null) {
  switch (grade) {
    case 'A':
      return 'from-green-600 to-emerald-600'
    case 'B':
      return 'from-blue-600 to-cyan-600'
    case 'C':
      return 'from-yellow-600 to-orange-600'
    case 'D':
      return 'from-orange-600 to-red-600'
    default:
      return 'from-red-600 to-rose-600'
  }
}

function getScoreColor(score?: number | null) {
  if (score == null) return 'text-gray-500 dark:text-gray-400'
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
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
      className={`rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 ${
        isCross ? 'ml-8' : ''
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-semibold whitespace-nowrap">
            {isCross ? '↳ Follow-up' : `Q${question.question_number}`}
          </span>
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {question.question_text}
          </p>
        </div>
        <div className="flex items-center gap-3 ml-3">
          {question.answer_score != null && (
            <span className={`text-lg font-bold ${getScoreColor(question.answer_score)}`}>
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
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Your Answer:
            </p>
            <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 p-3 rounded border border-gray-200 dark:border-slate-700 whitespace-pre-wrap">
              {question.candidate_answer || '—'}
            </p>
          </div>

          {question.answer_feedback && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Feedback:
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">{question.answer_feedback}</p>
            </div>
          )}

          {question.answer_evaluation && (
            <div className="space-y-2">
              {DIMENSION_LABELS.map(({ key, label }) => {
                const value = question.answer_evaluation?.[key]
                if (value == null) return null
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-24">{label}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">
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

  return (
    <div className="space-y-8">
      {/* Overall Score Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 border border-gray-200 dark:border-slate-700">
        <div className="text-center">
          {session.overall_grade && (
            <div
              className={`inline-block px-8 py-4 bg-gradient-to-r ${getGradeColor(
                session.overall_grade
              )} text-white rounded-2xl text-6xl font-bold mb-6 shadow-lg`}
            >
              {session.overall_grade}
            </div>
          )}

          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(session.overall_score)}`}>
                {session.overall_score ?? '—'}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">out of 100</div>
            </div>
          </div>

          {session.overall_feedback && (
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {session.overall_feedback}
            </p>
          )}
          {session.status === 'in_progress' && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-4">
              This round is still in progress — results shown are partial.
            </p>
          )}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      {((session.strengths && session.strengths.length > 0) ||
        (session.weaknesses && session.weaknesses.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💪</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Strengths</h2>
            </div>
            <ul className="space-y-3">
              {(session.strengths || []).map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Areas to Improve</h2>
            </div>
            <ul className="space-y-3">
              {(session.weaknesses || []).map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-orange-600 dark:text-orange-400 text-xl">→</span>
                  <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Question-by-Question Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Question Breakdown
        </h2>
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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 border border-gray-200 dark:border-slate-700 text-center">
        <div
          className={`inline-block px-8 py-4 bg-gradient-to-r ${getGradeColor(
            report.grade
          )} text-white rounded-2xl text-6xl font-bold mb-6 shadow-lg`}
        >
          {report.grade}
        </div>
        <div className={`text-5xl font-bold ${getScoreColor(report.finalScore)}`}>
          {report.finalScore}
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-sm mb-4">final score / 100</div>
        <span
          className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${rec.classes}`}
        >
          {rec.label}
        </span>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mt-6">
          {report.summary}
        </p>
      </div>

      {/* Weighted breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Weighted Breakdown
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Resume match 20% · Round 1 35% · Round 2 45%
        </p>
        <div className="space-y-4">
          {[
            { label: 'Resume match (20%)', value: application.match_percentage },
            { label: 'Round 1 (35%)', value: application.round1_score },
            { label: 'Round 2 (45%)', value: application.round2_score },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-40">{label}</span>
              <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                  style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">
                {value != null ? value : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Round comparison */}
      {report.roundComparison && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Round Comparison
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{report.roundComparison}</p>
        </div>
      )}

      {/* Strengths & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Strengths</h2>
          </div>
          <ul className="space-y-3">
            {report.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Risks</h2>
          </div>
          <ul className="space-y-3">
            {report.risks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-red-600 dark:text-red-400 text-xl">!</span>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl dark:text-white">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    // No applicationId in the URL: show a picker of applications with feedback.
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
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
                  className="w-full text-left bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all"
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
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                      View feedback →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-slate-700">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No feedback yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Complete an interview round to see feedback here.
              </p>
              <button
                onClick={() => router.push('/candidate/applications')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Interview Feedback
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {application.job?.title}
            {application.job?.company ? ` · ${application.job.company}` : ''}
          </p>
          {isDemoMode && (
            <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400">
              demo mode
            </span>
          )}
        </div>

        {tabs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-slate-700">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No feedback yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete an interview round to see your feedback here.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
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
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Back to Applications
          </button>
          <button
            onClick={() => router.push('/candidate/dashboard')}
            className="px-8 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
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
