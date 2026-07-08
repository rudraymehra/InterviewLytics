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
import ScoreDial, { scoreTextClass } from '@/components/ui/ScoreDial'

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
 * Order questions like a live conversation: by question_number asc, and within
 * the same number the main question first, then its follow-up chain in the
 * order the probes were asked (created_at asc).
 */
function sortQuestions(questions: InterviewQuestion[]): InterviewQuestion[] {
  return [...questions].sort((a, b) => {
    if (a.question_number !== b.question_number) return a.question_number - b.question_number
    const aCross = a.question_type === 'cross_question'
    const bCross = b.question_type === 'cross_question'
    if (aCross !== bCross) return aCross ? 1 : -1
    return (a.created_at || '').localeCompare(b.created_at || '')
  })
}

/** Questions that are easier to answer in writing (code, DSA, SQL, …).
 * Deliberately narrow: talking ABOUT code (e.g. "code-splitting") stays voice-first;
 * only questions asking you to WRITE something auto-open the editor. */
const CODE_QUESTION_RE =
  /\b(write (a |some |the )?(code|function|program|query|snippet)|coding (challenge|problem|exercise|question)|time complexity|space complexity|big-?o|data structure|pseudo-?code|leetcode|dsa|sql query|regular expression|solve (this|the) (problem|challenge))\b/i

// ---------- Small inline icons (stroke = currentColor) ----------

function MicIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  )
}

function StopIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
    </svg>
  )
}

function CameraIcon({ off = false, className = 'h-5 w-5' }: { off?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 8l-6 4 6 4V8Z" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
      {off && <line x1="2" y1="2" x2="22" y2="22" />}
    </svg>
  )
}

function SpeakerIcon({ muted = false, className = 'h-5 w-5' }: { muted?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      {muted ? (
        <>
          <line x1="16" y1="9" x2="22" y2="15" />
          <line x1="22" y1="9" x2="16" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      )}
    </svg>
  )
}

function AvatarIcon({ className = 'h-16 w-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-.5a8 8 0 0 1 16 0v.5" />
    </svg>
  )
}

/** Three cyan equalizer bars shown while the interviewer voice is playing. */
function SpeakingBars() {
  return (
    <span className="flex items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm bg-jade-600 dark:bg-jade-400 motion-safe:animate-pulse"
          style={{ height: i === 1 ? 14 : 9, animationDelay: `${i * 180}ms` }}
        />
      ))}
    </span>
  )
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
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsState, setTtsState] = useState<'idle' | 'loading' | 'playing'>('idle')
  const [needsPlayGesture, setNeedsPlayGesture] = useState(false)
  const [voiceMuted, setVoiceMuted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completion, setCompletion] = useState<CompleteResult | null>(null)
  const [showWebcam, setShowWebcam] = useState(false)
  const [camEnabled, setCamEnabled] = useState(true)
  const [speechSupported, setSpeechSupported] = useState(true)
  const [showTyping, setShowTyping] = useState(false)
  // Brief neutral acknowledgment after each answer — no scores mid-interview.
  const [justRecorded, setJustRecorded] = useState(false)
  const ackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const startedRef = useRef(false)
  // AI voice — one reusable audio element + a per-question blob-URL cache
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ttsCacheRef = useRef<Map<string, string>>(new Map())
  const autoplayUnlockedRef = useRef(false)
  const voiceMutedRef = useRef(false)
  const lastSpokenIdRef = useRef<string | null>(null)
  // True after the component unmounts — lets a pending getUserMedia stop its tracks.
  const unmountedRef = useRef(false)
  // Gate for speech-recognition finals: false after submit so late results are dropped.
  const acceptTranscriptRef = useRef(true)

  const orderedQuestions = sortQuestions(questions)
  const currentQuestion = orderedQuestions.find((q) => q.candidate_answer == null) || null
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
      // If the page unmounted while the permission prompt was pending, stop the
      // tracks immediately so the camera light doesn't stay on.
      if (unmountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
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

  // The camera can become ready while the loading screen is up (video not yet
  // mounted) — re-attach the stream whenever the stage renders.
  useEffect(() => {
    if (showWebcam && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current
    }
  }, [showWebcam, loading, completion, completing])

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
      // Drop late results flushed after the answer was submitted.
      if (!acceptTranscriptRef.current) return
      let finalTranscript = ''
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' '
        } else {
          interim += transcriptPiece
        }
      }
      setInterimTranscript(interim)
      if (finalTranscript) {
        // Final transcripts accumulate into the answer draft
        setAnswerText((prev) => (prev ? prev + ' ' : '') + finalTranscript.trim())
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast.error('Speech recognition error')
      }
      setIsRecording(false)
      setInterimTranscript('')
    }

    recognition.onend = () => {
      setIsRecording(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition
  }

  // No SpeechRecognition → typed input is the only path; open it with a notice.
  useEffect(() => {
    if (!speechSupported) setShowTyping(true)
  }, [speechSupported])

  const cleanup = () => {
    unmountedRef.current = true
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
    }
    ttsCacheRef.current.forEach((url) => URL.revokeObjectURL(url))
    ttsCacheRef.current.clear()
    if (ackTimerRef.current) {
      clearTimeout(ackTimerRef.current)
      ackTimerRef.current = null
    }
  }

  // ---------- AI voice (TTS with speechSynthesis fallback) ----------

  const getAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.onplaying = () => setTtsState('playing')
      audio.onended = () => setTtsState('idle')
      audio.onerror = () => setTtsState('idle')
      audioRef.current = audio
    }
    return audioRef.current
  }

  const stopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setTtsState('idle')
  }

  const fetchTtsUrl = async (question: InterviewQuestion): Promise<string> => {
    const cached = ttsCacheRef.current.get(question.id)
    if (cached) return cached
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text: question.question_text }),
    })
    if (!res.ok) throw new Error(`tts failed (${res.status})`)
    const url = URL.createObjectURL(await res.blob())
    ttsCacheRef.current.set(question.id, url)
    return url
  }

  /** Browser speechSynthesis — fallback when /api/tts is unavailable. */
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

  const speakCurrentQuestion = async (question: InterviewQuestion, userInitiated: boolean) => {
    stopVoice()
    setTtsState('loading')
    try {
      const url = await fetchTtsUrl(question)
      // Staleness guard: if the current question moved on while the TTS fetch
      // was in flight, discard this result instead of speaking over the new one.
      if (lastSpokenIdRef.current !== question.id) return
      const audio = getAudio()
      audio.src = url
      try {
        await audio.play()
        // First successful play unlocks autoplay for subsequent questions.
        autoplayUnlockedRef.current = true
        setNeedsPlayGesture(false)
      } catch {
        // Autoplay blocked before any user gesture — offer a manual play button.
        setTtsState('idle')
        if (!userInitiated) setNeedsPlayGesture(true)
      }
    } catch {
      // /api/tts returned 404 or failed → browser speechSynthesis fallback,
      // but only if this question is still the current one.
      if (lastSpokenIdRef.current !== question.id) return
      setTtsState('idle')
      setNeedsPlayGesture(false)
      await speakQuestion(question.question_text)
    }
  }

  // When a new current question appears: speak it (unless muted) and decide
  // whether the typed input should auto-open (code/DSA-shaped questions).
  useEffect(() => {
    if (!currentQuestion || loading || completion) return
    if (lastSpokenIdRef.current === currentQuestion.id) return
    lastSpokenIdRef.current = currentQuestion.id
    setShowTyping(CODE_QUESTION_RE.test(currentQuestion.question_text) || !speechSupported)
    if (!voiceMutedRef.current) {
      speakCurrentQuestion(currentQuestion, autoplayUnlockedRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, loading, completion])

  // Silence the interviewer once the round wraps up.
  useEffect(() => {
    if (completion || completing) stopVoice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completion, completing])

  const handleReplay = () => {
    if (!currentQuestion) return
    speakCurrentQuestion(currentQuestion, true)
  }

  const toggleVoiceMuted = () => {
    const next = !voiceMuted
    voiceMutedRef.current = next
    setVoiceMuted(next)
    if (next) stopVoice()
  }

  const toggleCamera = () => {
    const stream = mediaStreamRef.current
    if (!stream) {
      toast.error('Camera unavailable')
      return
    }
    const next = !camEnabled
    stream.getVideoTracks().forEach((track) => {
      track.enabled = next
    })
    setCamEnabled(next)
  }

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not available in this browser — type your answer instead')
      return
    }
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      setInterimTranscript('')
    } else {
      stopVoice() // don't record over the interviewer voice
      acceptTranscriptRef.current = true
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

    // Ignore any speech-recognition finals that flush after this point — they
    // belong to the answer being submitted, not the next question's draft.
    acceptTranscriptRef.current = false
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
      // Neutral acknowledgment only — scoring is silent until the debrief.
      setJustRecorded(true)
      if (ackTimerRef.current) clearTimeout(ackTimerRef.current)
      ackTimerRef.current = setTimeout(() => setJustRecorded(false), 4000)

      if (result.remaining === 0) {
        await completeInterview(session.id)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  const roundEyebrow = round === 1 ? 'ROUND 01 — RESUME DEEP-DIVE' : 'ROUND 02 — ROLE FIT'
  const voicePlaying = ttsState === 'playing' || isSpeaking

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-2 border-line-light dark:border-line-dark border-b-jade-600 dark:border-b-jade-400 mx-auto mb-4"></div>
          <p className="eyebrow">Preparing your interview</p>
        </div>
      </div>
    )
  }

  // No-params guidance (a redirect is also queued from the effect above)
  if (!applicationId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="hud-panel rounded-none max-w-md w-full p-8 text-center">
          <p className="eyebrow mb-3">NO APPLICATION SELECTED</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Open one of your applications and launch the interview from there.
          </p>
          <button
            onClick={() => router.push('/candidate/applications')}
            className="px-6 py-2.5 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink rounded font-data text-xs font-semibold uppercase tracking-wide hover:bg-jade-700 dark:hover:bg-jade-400 transition-colors"
          >
            Go to applications
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-2 border-line-light dark:border-line-dark border-b-jade-600 dark:border-b-jade-400 mx-auto mb-4"></div>
          <p className="eyebrow">Preparing your interview</p>
        </div>
      </div>
    )
  }

  // ---------- Completion screen ----------
  if (completion) {
    const { session: completedSession, advanced, passThreshold } = completion
    const score = completedSession.overall_score ?? 0
    const isRound1 = completedSession.round === 1

    const primaryBtn =
      'px-8 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink rounded font-data text-sm font-semibold uppercase tracking-wide hover:bg-jade-700 dark:hover:bg-jade-400 transition-colors'
    const secondaryBtn =
      'px-8 py-3 border border-line-light dark:border-line-dark text-gray-700 dark:text-gray-300 rounded font-data text-sm font-semibold uppercase tracking-wide hover:bg-gray-50 dark:hover:bg-white/5 transition-colors'

    return (
      <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink py-8 px-4">
        <div className="hud-panel max-w-2xl w-full rounded-none shadow-sm p-10 text-center">
          {isRound1 ? (
            advanced ? (
              <>
                <p className="eyebrow mb-6 !text-[#0D9488] dark:!text-[#34F5C5] dark:[text-shadow:0_0_12px_rgba(52,245,197,0.55)]">
                  ROUND 2 UNLOCKED
                </p>
                <div className="flex justify-center mb-6">
                  <ScoreDial value={score} size={140} grade="/ 100" />
                </div>
                <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  You passed Round 1
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                  Score <span className={`font-data font-semibold ${scoreTextClass(score)}`}>{score}</span>{' '}
                  ≥ threshold <span className="font-data">{passThreshold}</span>. Round 2 unlocked.
                </p>
                {completedSession.overall_feedback && (
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {completedSession.overall_feedback}
                  </p>
                )}
                <div className="flex justify-center gap-4 flex-wrap">
                  <button
                    onClick={() => {
                      // Full navigation (not router.push) so the whole page —
                      // camera, speech recognition, TTS cache, question state —
                      // re-initializes cleanly for Round 2, and browser Back
                      // returns to a working page instead of a dead one.
                      window.location.assign(
                        `/candidate/interview?applicationId=${applicationId}&round=2`
                      )
                    }}
                    className={primaryBtn}
                  >
                    Start Round 2 now
                  </button>
                  <button
                    onClick={() => router.push('/candidate/applications')}
                    className={secondaryBtn}
                  >
                    Back to applications
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow mb-6">ROUND 01 — COMPLETE</p>
                <div className="flex justify-center mb-6">
                  <ScoreDial value={score} size={140} grade="/ 100" />
                </div>
                <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Round 1 complete
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                  Your score: <span className={`font-data font-semibold ${scoreTextClass(score)}`}>{score}</span>/100.
                  The recruiter will review your results.
                </p>
                {completedSession.overall_feedback && (
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {completedSession.overall_feedback}
                  </p>
                )}
                <div className="flex justify-center gap-4 flex-wrap">
                  <button
                    onClick={() => router.push(`/candidate/feedback?applicationId=${applicationId}`)}
                    className={primaryBtn}
                  >
                    View feedback
                  </button>
                  <button
                    onClick={() => router.push('/candidate/applications')}
                    className={secondaryBtn}
                  >
                    Back to applications
                  </button>
                </div>
              </>
            )
          ) : (
            <>
              <p className="eyebrow mb-6">ROUND 02 — COMPLETE</p>
              <div className="flex justify-center mb-6">
                <ScoreDial value={score} size={140} grade="/ 100" />
              </div>
              <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-3">
                All interviews complete
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                Round 2 score: <span className={`font-data font-semibold ${scoreTextClass(score)}`}>{score}</span>/100.
                Your final report is ready.
              </p>
              {completedSession.overall_feedback && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {completedSession.overall_feedback}
                </p>
              )}
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={() => router.push(`/candidate/feedback?applicationId=${applicationId}`)}
                  className={primaryBtn}
                >
                  View final report
                </button>
                <button
                  onClick={() => router.push('/candidate/applications')}
                  className={secondaryBtn}
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
      <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-2 border-line-light dark:border-line-dark border-b-jade-600 dark:border-b-jade-400 mx-auto mb-4"></div>
          <p className="eyebrow">Evaluating your interview</p>
        </div>
      </div>
    )
  }

  const cameraVisible = showWebcam && camEnabled
  const allAnswered = !currentQuestion && totalCount > 0

  // ---------- The live interview room ----------
  return (
    <div className="mx-auto max-w-[1700px]">
      <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-7rem)] lg:min-h-[520px]">
        {/* ---------- LEFT — camera stage (full-bleed) ---------- */}
        <div className="relative w-full flex-1 min-w-0 aspect-video lg:aspect-auto lg:h-full rounded-lg overflow-hidden border border-jade-600/50 dark:border-jade-400/50 bg-[#060913]">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              cameraVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Camera denied / toggled off */}
          {!cameraVisible && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-600">
              <AvatarIcon className="h-20 w-20" />
              <p className="font-data text-[11px] tracking-[0.18em] uppercase text-gray-500">
                Camera off
              </p>
            </div>
          )}

          {/* LIVE chip — top-left */}
          <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full border border-line-dark bg-[#060913]/75 backdrop-blur px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#FF2ED1] motion-safe:animate-pulse" aria-hidden="true" />
            <span className="font-data text-[10px] tracking-[0.16em] uppercase text-gray-300">
              Live — preview only, not recorded
            </span>
          </div>

          {/* Interviewer speaking indicator — top-right */}
          {(voicePlaying || ttsState === 'loading') && (
            <div className="absolute top-3 right-3 flex items-center gap-2.5 rounded-full border border-jade-400/40 bg-[#060913]/75 backdrop-blur px-3 py-1.5">
              {voicePlaying ? (
                <SpeakingBars />
              ) : (
                <span className="h-2 w-2 rounded-full bg-jade-400 motion-safe:animate-pulse" aria-hidden="true" />
              )}
              <span className="font-data text-[10px] tracking-[0.16em] uppercase text-jade-400">
                {voicePlaying ? 'Interviewer speaking' : 'Interviewer…'}
              </span>
            </div>
          )}

          {/* Live transcript caption — while recording */}
          {isRecording && (
            <div className="absolute bottom-[5.5rem] left-1/2 -translate-x-1/2 w-[min(85%,42rem)] rounded border border-line-dark bg-[#060913]/80 backdrop-blur px-4 py-2">
              <p className="font-data text-xs leading-relaxed text-gray-200 text-center line-clamp-2">
                {interimTranscript || 'Listening…'}
              </p>
            </div>
          )}

          {/* Control bar — bottom center; wraps and shrinks on phones */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-[calc(100%-1rem)] rounded-2xl sm:rounded-full border border-line-dark bg-[#060913]/80 backdrop-blur px-3 py-2 sm:px-4 sm:py-2.5">
            {/* Camera toggle */}
            <button
              type="button"
              onClick={toggleCamera}
              aria-pressed={!camEnabled}
              aria-label={camEnabled ? 'Turn camera off' : 'Turn camera on'}
              title={camEnabled ? 'Turn camera off' : 'Turn camera on'}
              className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400 ${
                camEnabled
                  ? 'border-line-dark text-gray-300 hover:bg-white/5'
                  : 'border-[#FF2ED1]/60 text-[#FF2ED1] bg-[#FF2ED1]/10'
              }`}
            >
              <CameraIcon off={!camEnabled} />
            </button>

            {/* MIC — the primary action */}
            <button
              type="button"
              onClick={toggleRecording}
              disabled={submitting || !currentQuestion || !speechSupported}
              aria-pressed={isRecording}
              aria-label={isRecording ? 'Stop recording your answer' : 'Record your answer'}
              title={isRecording ? 'Stop recording' : 'Record your answer'}
              className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060913] ${
                isRecording
                  ? 'mic-pulse bg-[#FF2ED1] text-[#060913] focus-visible:ring-[#FF2ED1]'
                  : 'border-2 border-jade-400 text-jade-400 bg-[#060913]/60 hover:bg-jade-400/10 focus-visible:ring-jade-400'
              }`}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </button>

            {/* Interviewer voice mute toggle */}
            <button
              type="button"
              onClick={toggleVoiceMuted}
              aria-pressed={voiceMuted}
              aria-label={voiceMuted ? 'Unmute interviewer voice' : 'Mute interviewer voice'}
              title={voiceMuted ? 'Unmute interviewer voice' : 'Mute interviewer voice'}
              className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400 ${
                voiceMuted
                  ? 'border-[#FF2ED1]/60 text-[#FF2ED1] bg-[#FF2ED1]/10'
                  : 'border-line-dark text-gray-300 hover:bg-white/5'
              }`}
            >
              <SpeakerIcon muted={voiceMuted} />
            </button>

            {/* End round — only once every question is answered */}
            {allAnswered && session && (
              <button
                type="button"
                onClick={() => completeInterview(session.id)}
                className="h-9 px-4 sm:h-10 sm:px-5 rounded-full bg-jade-500 text-ink font-data text-xs font-semibold uppercase tracking-[0.12em] hover:bg-jade-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jade-400"
              >
                End round
              </button>
            )}
          </div>
        </div>

        {/* ---------- RIGHT — companion panel ---------- */}
        <div className="hud-panel rounded-none lg:w-[34%] lg:min-w-[330px] lg:max-w-[460px] flex flex-col lg:h-full lg:overflow-hidden">
          <div className="flex-1 lg:overflow-y-auto p-5 space-y-5">
            {/* Round header */}
            <div>
              <p className="eyebrow">{roundEyebrow}</p>
              {job && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                  {job.title} · {job.company}
                </p>
              )}
              {/* No question counter or progress bar — like a real interview,
                  the candidate never knows how many questions remain. */}
              <p className="font-data text-[10px] tracking-[0.14em] uppercase text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-jade-600 dark:bg-jade-400 motion-safe:animate-pulse"
                  aria-hidden="true"
                />
                Interview in progress
              </p>
            </div>

            {/* Current question */}
            <div className="border-t border-line-light dark:border-line-dark pt-4">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="px-2.5 py-1 bg-jade-100 dark:bg-jade-400/10 text-jade-700 dark:text-jade-400 rounded-full font-data text-[10px] tracking-[0.14em] uppercase font-medium">
                  {currentQuestion?.question_type === 'cross_question'
                    ? 'Follow-up'
                    : currentQuestion?.question_type?.replace(/_/g, ' ') || 'Question'}
                </span>
                {currentQuestion &&
                  (needsPlayGesture ? (
                    <button
                      type="button"
                      onClick={handleReplay}
                      className="px-3 py-1.5 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink rounded-full font-data text-[11px] font-semibold uppercase tracking-wide hover:bg-jade-700 dark:hover:bg-jade-400 transition-colors"
                    >
                      ▶ Play question
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReplay}
                      disabled={ttsState === 'loading'}
                      className="px-3 py-1.5 border border-line-light dark:border-line-dark text-gray-600 dark:text-gray-300 rounded-full text-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      🔊 Replay
                    </button>
                  ))}
              </div>
              <p className="text-base lg:text-lg font-medium text-gray-900 dark:text-white leading-snug">
                {currentQuestion?.question_text ||
                  (totalCount > 0 ? 'All questions answered — end the round when ready.' : 'Waiting for questions…')}
              </p>
              {currentQuestion?.context && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                  Context: {currentQuestion.context}
                </p>
              )}
              {voicePlaying && (
                <div className="flex items-center gap-2 mt-3" aria-live="polite">
                  <SpeakingBars />
                  <span className="font-data text-[10px] tracking-[0.16em] uppercase text-jade-600 dark:text-jade-400">
                    Interviewer speaking
                  </span>
                </div>
              )}
            </div>

            {/* Answer area */}
            <div className="border-t border-line-light dark:border-line-dark pt-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="eyebrow">Your answer</p>
                {speechSupported && (
                  <button
                    type="button"
                    onClick={() => setShowTyping((v) => !v)}
                    disabled={!currentQuestion}
                    className="px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400 border border-transparent rounded hover:border-line-light dark:hover:border-line-dark hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                  >
                    {showTyping ? '🎙 Voice only' : '⌨ Type instead'}
                  </button>
                )}
              </div>

              {!speechSupported && (
                <div className="p-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-300">
                  Voice input is not supported in this browser — type your answers below.
                </div>
              )}

              {showTyping ? (
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={7}
                  disabled={submitting || !currentQuestion}
                  placeholder="Type your answer — use this for code, DSA, or anything easier to write than say…"
                  aria-label="Type your answer"
                  className="w-full px-3 py-2.5 font-data text-sm leading-relaxed bg-white dark:bg-ink border border-line-light dark:border-line-dark rounded focus:border-jade-600 dark:focus:border-jade-400 focus:outline-none text-gray-900 dark:text-white disabled:opacity-50"
                />
              ) : (
                <div
                  className="min-h-[6rem] max-h-52 overflow-y-auto px-3 py-2.5 bg-paper dark:bg-ink border border-line-light dark:border-line-dark rounded"
                  aria-live="polite"
                >
                  {answerText ? (
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{answerText}</p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Tap the mic below the video to answer aloud — your words will appear here.
                    </p>
                  )}
                </div>
              )}

              {isRecording && (
                <p className="font-data text-[10px] tracking-[0.14em] uppercase text-[#FF2ED1]">
                  ● Recording — stop the mic to submit
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={submitting || !answerText.trim() || !currentQuestion || isRecording}
                className="w-full px-5 py-3 bg-jade-600 text-white dark:bg-jade-500 dark:text-ink rounded font-data text-sm uppercase tracking-wide font-semibold hover:bg-jade-700 dark:hover:bg-jade-400 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Sending answer…' : 'Submit answer'}
              </button>

              {/* Neutral acknowledgment — no scores or feedback mid-interview */}
              {(submitting || justRecorded) && (
                <p
                  className="font-data text-[10px] tracking-[0.14em] uppercase text-gray-500 dark:text-gray-400 flex items-center gap-2"
                  aria-live="polite"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-jade-600 dark:bg-jade-400 motion-safe:animate-pulse"
                    aria-hidden="true"
                  />
                  {submitting ? 'Answer recorded — the interviewer is thinking…' : 'Answer recorded'}
                </p>
              )}
            </div>
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
