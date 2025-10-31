'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

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

interface Question {
  id: string
  question_number: number
  question_type: string
  question_text: string
  context?: string
  candidate_answer?: string
  answer_score?: number
  answer_feedback?: string
}

interface InterviewSession {
  id: string
  status: string
  overall_score?: number
  overall_grade?: string
}

function InterviewPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')

  const [token, setToken] = useState<string | null>(null)
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showWebcam, setShowWebcam] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    setToken(storedToken)
    
    if (!storedToken || !sessionId) {
      router.push('/candidate/applications')
      return
    }
    fetchInterviewData()
    setupWebcam()
    setupSpeechRecognition()

    return () => {
      cleanup()
    }
  }, [sessionId, router])

  const fetchInterviewData = async () => {
    try {
      const response = await fetch(`/api/interview/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        setQuestions(data.questions)
        
        // Find first unanswered question
        const firstUnanswered = data.questions.findIndex((q: Question) => !q.candidate_answer)
        setCurrentQuestionIndex(firstUnanswered >= 0 ? firstUnanswered : 0)
      } else {
        toast.error('Failed to load interview')
        router.push('/candidate/applications')
      }
    } catch (error) {
      console.error('Error fetching interview:', error)
      toast.error('Failed to load interview')
    } finally {
      setLoading(false)
    }
  }

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
      toast.error('Please allow camera access for the interview')
    }
  }

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in your browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' '
        } else {
          interimTranscript += transcriptPiece
        }
      }

      setTranscript((prev) => prev + finalTranscript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error !== 'no-speech') {
        toast.error('Speech recognition error')
      }
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
    if (synthRef.current) {
      window.speechSynthesis.cancel()
    }
  }

  const speakQuestion = (questionText: string) => {
    return new Promise<void>((resolve) => {
      const synth = window.speechSynthesis
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
    const currentQuestion = questions[currentQuestionIndex]
    if (currentQuestion) {
      await speakQuestion(currentQuestion.question_text)
    }
  }

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not available')
      return
    }

    setTranscript('')
    setIsRecording(true)
    recognitionRef.current.start()
    toast.success('Recording started. Speak your answer.')
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
    toast.success('Recording stopped')
  }

  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) {
      toast.error('Please record your answer first')
      return
    }

    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    setSubmitting(true)

    try {
      // Determine if we should generate a cross-question
      const isMainQuestion = currentQuestion.question_type !== 'cross_question'
      const shouldGenerateCross = isMainQuestion && currentQuestionIndex < 6 // First 6 main questions

      const response = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          answer: transcript,
          generate_cross_question: shouldGenerateCross,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update the question with the evaluation
        const updatedQuestions = [...questions]
        updatedQuestions[currentQuestionIndex] = {
          ...currentQuestion,
          candidate_answer: transcript,
          answer_score: data.evaluation.score,
          answer_feedback: data.evaluation.feedback,
        }

        // If cross-question was generated, add it to the list
        if (data.cross_question) {
          updatedQuestions.push(data.cross_question)
        }

        setQuestions(updatedQuestions)
        setTranscript('')

        // Show score
        toast.success(`Answer submitted! Score: ${data.evaluation.score}/100`)

        // Move to next question
        if (currentQuestionIndex < updatedQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          // Auto-read next question after delay
          setTimeout(() => {
            handleReadQuestion()
          }, 2000)
        } else {
          // Interview complete
          toast.success('All questions answered! Finalizing interview...')
          setTimeout(() => {
            completeInterview()
          }, 2000)
        }
      } else {
        toast.error(data.error || 'Failed to submit answer')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const completeInterview = async () => {
    try {
      const response = await fetch('/api/interview/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Interview completed! Overall Score: ${data.feedback.overallScore}/100`)
        setTimeout(() => {
          router.push(`/candidate/feedback?session_id=${sessionId}`)
        }, 2000)
      } else {
        toast.error(data.error || 'Failed to complete interview')
      }
    } catch (error) {
      console.error('Error completing interview:', error)
      toast.error('Failed to complete interview')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl dark:text-white">Loading your interview...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Interview Session
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

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
          </div>

          {/* Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                    {currentQuestion?.question_type?.replace('_', ' ') || 'Question'}
                  </span>
                </div>
                <button
                  onClick={handleReadQuestion}
                  disabled={isSpeaking}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-semibold"
                >
                  {isSpeaking ? '🔊 Speaking...' : '🔊 Read Question'}
                </button>
              </div>

              <div className="mb-6">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                  {currentQuestion?.question_text || 'Loading question...'}
                </p>
                {currentQuestion?.context && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 italic">
                    Context: {currentQuestion.context}
                  </p>
                )}
              </div>

              {/* Recording Controls */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 text-lg"
                    >
                      🎤 Start Recording Answer
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-rose-700 transition-all text-lg animate-pulse"
                    >
                      ⏹️ Stop Recording
                    </button>
                  )}
                </div>

                {/* Transcript Display */}
                {transcript && (
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Your Answer:
                    </p>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {transcript}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                {transcript && !isRecording && (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 text-lg"
                  >
                    {submitting ? 'Submitting & Evaluating...' : 'Submit Answer & Continue'}
                  </button>
                )}
              </div>
            </div>

            {/* Previous Answers */}
            {currentQuestionIndex > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Previous Answers
                </h3>
                <div className="space-y-3">
                  {questions.slice(0, currentQuestionIndex).reverse().slice(0, 3).map((q, idx) => (
                    <div key={q.id} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
                          Q{q.question_number}: {q.question_text}
                        </p>
                        {q.answer_score !== undefined && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            q.answer_score >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                            q.answer_score >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl dark:text-white">Loading interview...</div>
      </div>
    }>
      <InterviewPageContent />
    </Suspense>
  )
}
