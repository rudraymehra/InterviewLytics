'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  interviewApi,
  ApiError,
  InterviewQuestion,
  InterviewSession,
  Job,
  CompleteResult,
} from '@/utils/apiClient'

// TypeScript definitions for Web Speech API
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

/**
 * Order questions: primary questions by question_number asc, with each
 * cross-question placed right after its parent (keeping the server's
 * insertion order among siblings).
 */
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
  // Any orphaned cross-questions go at the end (defensive)
  for (const cross of crosses) {
    if (!ordered.includes(cross)) ordered.push(cross)
  }
  return ordered
}

function InterviewPageContent() {
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams?.get('applicationId')
  const roundParam = searchParams?.get('round')
  const round: 1 | 2 = roundParam === '2' ? 2 : 1

  const [session, setSession] = useState<InterviewSession | null>(null)
  const [job, setJob] = useState<Job | undefined>(undefined)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [answerText, setAnswerText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completion, setCompletion] = useState<CompleteResult | null>(null)
  const [showWebcam, setShowWebcam] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)
  const [lastFeedback, setLastFeedback] = useState<{ score: number | null; feedback: string | null } | null>(null)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const startedRef = useRef(false)

  const orderedQuestions = sortQuestions(questions)
  const currentQuestion = orderedQuestions.find((q) => q.candidate_answer == null) || null
  const answeredCount = orderedQuestions.filter((q) => q.candidate_answer != null).length
  const totalCount = orderedQuestions.length

  const completeInterview = useCallback(
    async (sessionId: string) => {
      setCompleting(true)
      try {
        const result = await interviewApi.complete(sessionId)
        setCompletion(result)
      } catch (err: any) {
        toast.error(err.message || 'Failed to complete interview')
      } finally {
        setCompleting(false)
      }
    },
    []
  )

  const startInterview = useCallback(async () => {
    if (!applicationId) return
    try {
      const detail = await interviewApi.start(applicationId, round)
      setSession(detail.session)
      setJob(detail.job)
      setQuestions(detail.questions)

      // If everything is already answered but the session is still open,
      // finalize immediately (e.g. a resume after a failed completion call).
      const unanswered = detail.questions.filter((q) => q.candidate_answer == null)
      if (unanswered.length === 0 && detail.session.status === 'in_progress') {
        await completeInterview(detail.session.id)
      }
    } catch (err: any) {
      if (err instanceof ApiError && [400, 403, 409].includes(err.status)) {
        toast.error(err.message)
        router.push('/candidate/applications')
        return
      }
      toast.error(err.message || 'Failed to start interview')
      router.push('/candidate/applications')
    } finally {
      setLoading(false)
    }
  }, [applicationId, round, router, completeInterview])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login-candidate')
      return
    }
    if (!applicationId) {
      toast.error('No application selected')
      router.push('/candidate/applications')
      return
    }
    if (startedRef.current) return
    startedRef.current = true

    startInterview()
    setupWebcam()
    setupSpeechRecognition()

    return () => {
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, applicationId, round])

  const setupWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setShowWebcam(true)
    } catch (error) {
      console.error('Webcam access denied:', error)
      toast.error('Camera unavailable — you can still complete the interview')
    }
  }

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' '
        }
      }
      if (finalTranscript) {
        // Append live transcript into the textarea
        setAnswerText((prev) => (prev ? prev + ' ' : '') + finalTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast.error('Speech recognition error')
      }
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
  }

  const cleanup = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  const speakQuestion = (questionText: string) => {
    return new Promise<void>((resolve) => {
      const synth = window.speechSynthesis
      if (!synth) {
        resolve()
        return
      }
      const utterance = new SpeechSynthesisUtterance(questionText)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        resolve()
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        resolve()
      }

      synthRef.current = utterance
      synth.speak(utterance)
    })
  }

  const handleReadQuestion = async () => {
    if (currentQuestion) {
      await speakQuestion(currentQuestion.question_text)
    }
  }

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not available in this browser — type your answer instead')
      return
    }
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch {
        // start() throws if already started
        setIsRecording(true)
      }
    }
  }

  const handleSubmitAnswer = async () => {
    const trimmed = answerText.trim()
    if (!trimmed) {
      toast.error('Please provide an answer first')
      return
    }
    if (!currentQuestion || !session) return

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }

    setSubmitting(true)
    try {
      const result = await interviewApi.answer(currentQuestion.id, trimmed)

      setQuestions((prev) => {
        const updated = prev.map((q) => (q.id === result.question.id ? result.question : q))
        if (result.crossQuestion) {
          updated.push(result.crossQuestion)
        }
        return updated
      })
      setAnswerText('')
      setLastFeedback({
        score: result.question.answer_score ?? null,
        feedback: result.question.answer_feedback ?? null,
      })
      if (result.question.answer_score != null) {
        toast.success(`Answer scored ${result.question.answer_score}/100`)
      } else {
        toast.success('Answer submitted')
      }
      if (result.crossQuestion) {
        toast('Follow-up question added', { icon: '💬' })
      }

      if (result.remaining === 0) {
        await completeInterview(session.id)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  const roundTitle = round === 1 ? 'Round 1 · Resume Deep-Dive' : 'Round 2 · Role Fit Interview'

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl dark:text-white">Preparing your interview...</p>
        </div>
      </div>
    )
  }

  // ---------- Completion screen ----------
  if (completion) {
    const { session: completedSession, advanced, passThreshold } = completion
    const score = completedSession.overall_score ?? 0
    const isRound1 = completedSession.round === 1

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-10 border border-gray-200 dark:border-slate-700 text-center">
          {isRound1 ? (
            advanced ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  You passed Round 1!
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                  Score <span className="font-bold text-green-600 dark:text-green-400">{score}</span>{' '}
                  ≥ threshold {passThreshold}. Round 2 is unlocked.
                </p>
                {completedSession.overall_feedback && (
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {completedSession.overall_feedback}
                  </p>
                )}
                <div className="flex justify-center gap-4 flex-wrap">
                  <button
                    onClick={() => {
                      setCompletion(null)
                      setSession(null)
                      setQuestions([])
                      setLastFeedback(null)
                      setLoading(true)
                      startedRef.current = false
                      router.push(`/candidate/interview?applicationId=${applicationId}&round=2`)
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Start Round 2 now
                  </button>
                  <button
                    onClick={() => router.push('/candidate/applications')}
                    className="px-8 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Back to applications
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Round 1 complete
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                  Your score: <span className="font-bold">{score}</span>/100. The recruiter will
                  review your results.
                </p>
                {completedSession.overall_feedback && (
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {completedSession.overall_feedback}
                  </p>
                )}
                <div className="flex justify-center gap-4 flex-wrap">
                  <button
                    onClick={() => router.push(`/candidate/feedback?applicationId=${applicationId}`)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    View feedback
                  </button>
                  <button
                    onClick={() => router.push('/candidate/applications')}
                    className="px-8 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Back to applications
                  </button>
                </div>
              </>
            )
          ) : (
            <>
              <div className="text-6xl mb-4">🏁</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                All interviews complete
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                Round 2 score: <span className="font-bold">{score}</span>/100. Your final report is
                ready.
              </p>
              {completedSession.overall_feedback && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {completedSession.overall_feedback}
                </p>
              )}
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={() => router.push(`/candidate/feedback?applicationId=${applicationId}`)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  View final report
                </button>
                <button
                  onClick={() => router.push('/candidate/applications')}
                  className="px-8 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Back to applications
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (completing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl dark:text-white">Evaluating your interview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{roundTitle}</h1>
          {job && (
            <p className="text-gray-600 dark:text-gray-400">
              {job.title} · {job.company}
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Progress: {answeredCount} of {totalCount} answered
          </p>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Voice not supported banner */}
        {!speechSupported && (
          <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
            Voice input is not supported in this browser — type your answers instead.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Video Preview
              </h2>
              {showWebcam ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full rounded-lg bg-gray-900"
                ></video>
              ) : (
                <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
                  Camera not available
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                📹 Video for interview atmosphere only (not recorded)
              </p>
            </div>

            {/* Last answer feedback */}
            {lastFeedback && (
              <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Last Answer
                </h3>
                {lastFeedback.score != null && (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${
                      lastFeedback.score >= 80
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : lastFeedback.score >= 60
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {lastFeedback.score}/100
                  </span>
                )}
                {lastFeedback.feedback && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{lastFeedback.feedback}</p>
                )}
              </div>
            )}
          </div>

          {/* Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                    {currentQuestion?.question_type === 'cross_question'
                      ? 'Follow-up question'
                      : currentQuestion?.question_type?.replace(/_/g, ' ') || 'Question'}
                  </span>
                </div>
                <button
                  onClick={handleReadQuestion}
                  disabled={isSpeaking || !currentQuestion}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-semibold"
                >
                  {isSpeaking ? '🔊 Speaking...' : '🔊 Read Question'}
                </button>
              </div>

              <div className="mb-6">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                  {currentQuestion?.question_text || 'All questions answered'}
                </p>
                {currentQuestion?.context && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 italic">
                    Context: {currentQuestion.context}
                  </p>
                )}
              </div>

              {/* Answer input */}
              <div className="space-y-4">
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={6}
                  disabled={submitting || !currentQuestion}
                  placeholder={
                    speechSupported
                      ? 'Type your answer here, or use the mic to dictate it...'
                      : 'Type your answer here...'
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white disabled:opacity-50"
                />

                <div className="flex gap-4">
                  {speechSupported && (
                    <button
                      onClick={toggleRecording}
                      disabled={submitting || !currentQuestion}
                      className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all disabled:opacity-50 text-lg text-white ${
                        isRecording
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 animate-pulse'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      }`}
                    >
                      {isRecording ? '⏹️ Stop Dictating' : '🎤 Dictate Answer'}
                    </button>
                  )}
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answerText.trim() || !currentQuestion}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 text-lg"
                  >
                    {submitting ? 'Submitting & Evaluating...' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            </div>

            {/* Previous Answers */}
            {answeredCount > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Previous Answers
                </h3>
                <div className="space-y-3">
                  {orderedQuestions
                    .filter((q) => q.candidate_answer != null)
                    .reverse()
                    .slice(0, 3)
                    .map((q) => (
                      <div
                        key={q.id}
                        className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
                            {q.question_type === 'cross_question' ? '↳ ' : `Q${q.question_number}: `}
                            {q.question_text}
                          </p>
                          {q.answer_score != null && (
                            <span
                              className={`ml-2 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                                q.answer_score >= 80
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                  : q.answer_score >= 60
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              }`}
                            >
                              {q.answer_score}/100
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {q.candidate_answer}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl dark:text-white">Loading interview...</div>
        </div>
      }
    >
      <InterviewPageContent />
    </Suspense>
  )
}
