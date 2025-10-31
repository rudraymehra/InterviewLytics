'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

interface Question {
  id: string
  question_number: number
  question_type: string
  question_text: string
  candidate_answer: string
  answer_score: number
  answer_feedback: string
  answer_evaluation: any
}

interface InterviewSession {
  id: string
  status: string
  overall_score: number
  overall_grade: string
  overall_feedback: string
  strengths: string[]
  weaknesses: string[]
  completed_at: string
}

function FeedbackPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')

  const [token, setToken] = useState<string | null>(null)
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    setToken(storedToken)
    
    if (!storedToken || !sessionId) {
      router.push('/candidate/applications')
      return
    }
    fetchFeedback()
  }, [sessionId, router])

  const fetchFeedback = async () => {
    try {
      const response = await fetch(`/api/interview/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        setQuestions(data.questions.filter((q: Question) => q.candidate_answer))
      } else {
        toast.error('Failed to load feedback')
        router.push('/candidate/applications')
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
      toast.error('Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl dark:text-white">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl dark:text-white">Interview not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Interview Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Completed on {new Date(session.completed_at).toLocaleString()}
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-slate-700">
          <div className="text-center">
            <div className={`inline-block px-8 py-4 bg-gradient-to-r ${getGradeColor(session.overall_grade)} text-white rounded-2xl text-6xl font-bold mb-6 shadow-lg`}>
              {session.overall_grade}
            </div>
            
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(session.overall_score)}`}>
                  {session.overall_score}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">out of 100</div>
              </div>
            </div>

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {session.overall_feedback}
            </p>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💪</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Strengths</h2>
            </div>
            <ul className="space-y-3">
              {session.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Areas to Improve</h2>
            </div>
            <ul className="space-y-3">
              {session.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-orange-600 dark:text-orange-400 text-xl">→</span>
                  <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question-by-Question Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Question Breakdown
          </h2>
          
          <div className="space-y-6">
            {questions.map((question, idx) => (
              <div
                key={question.id}
                className="p-5 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-semibold">
                        Q{question.question_number}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs font-semibold">
                        {question.question_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {question.question_text}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-3xl font-bold ${getScoreColor(question.answer_score)}`}>
                      {question.answer_score}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">/ 100</div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Your Answer:
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 p-3 rounded border border-gray-200 dark:border-slate-700">
                    {question.candidate_answer}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    Feedback:
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {question.answer_feedback}
                  </p>
                </div>

                {question.answer_evaluation && (
                  <div className="mt-3 grid grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                      <div className={`text-lg font-bold ${getScoreColor(question.answer_evaluation.correctness)}`}>
                        {question.answer_evaluation.correctness}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Correctness</div>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                      <div className={`text-lg font-bold ${getScoreColor(question.answer_evaluation.clarity)}`}>
                        {question.answer_evaluation.clarity}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Clarity</div>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                      <div className={`text-lg font-bold ${getScoreColor(question.answer_evaluation.depth)}`}>
                        {question.answer_evaluation.depth}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Depth</div>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                      <div className={`text-lg font-bold ${getScoreColor(question.answer_evaluation.relevance)}`}>
                        {question.answer_evaluation.relevance}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Relevance</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl dark:text-white">Loading feedback...</div>
      </div>
    }>
      <FeedbackPageContent />
    </Suspense>
  )
}
