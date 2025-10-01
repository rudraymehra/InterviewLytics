'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button, FormInput, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Textarea3D } from '@/components/ui'
import Animated from '@/components/Animated'
import { useToggle } from '@/hooks'
import { apiClient, InterviewMessage } from '@/utils/apiClient'
import { useSearchParams } from 'next/navigation'
import {
  Send,
  Bot,
  User,
  Clock,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const CandidateInterview: React.FC = () => {
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { state: isRecording, toggle: toggleRecording } = useToggle(false)
  const { state: isVideoOn, toggle: toggleVideo } = useToggle(false)
  const { state: isInCall, toggle: toggleCall } = useToggle(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const searchParams = useSearchParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const recognitionRef = useRef<any>(null)
  const [srAvailable, setSrAvailable] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')

  useEffect(() => {
    // Start webcam
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    }).catch(() => {})

    // Init speech recognition if available
    try {
      const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      if (SR) {
        setSrAvailable(true)
        const rec = new SR()
        rec.continuous = false
        rec.interimResults = true
        rec.lang = 'en-US'
        rec.onresult = (event: any) => {
          let finalText = ''
          let interimText = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) finalText += transcript
            else interimText += transcript
          }
          // Keep voice transcript separate so AI can receive both voice + typed
          setVoiceTranscript(finalText || interimText)
        }
        rec.onerror = () => {}
        rec.onend = () => {
          // stop recording state if ended
          if (isRecording) toggleRecording()
        }
        recognitionRef.current = rec
      }
    } catch (_) {}

    // Start session
    const jobId = searchParams?.get('jobId') || 'demo-job-id'
    ;(async () => {
      try {
        const s = await apiClient.startInterview(jobId)
        setSessionId(s.sessionId)
        setCurrentQuestion(s.question || '')
      } catch (e) {
        // fallback to mock messages if needed
        fetchMessages()
      }
    })()
  }, [])

  const fetchMessages = async () => {
    try {
      const messagesData = await apiClient.getInterviewMessages()
      setMessages(messagesData)
    } catch (error) {
      console.error('Failed to load messages')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && !voiceTranscript.trim()) return

    setIsLoading(true)
    try {
      if (sessionId) {
        // Combine voice + text so AI gets access to both modalities
        const combined = [voiceTranscript.trim(), newMessage.trim()].filter(Boolean).join('\n\n')
        const { nextQuestion } = await apiClient.submitInterviewAnswer(sessionId, combined)
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'candidate', message: combined, timestamp: new Date().toISOString() }])
        setNewMessage('')
        setVoiceTranscript('')
        if (nextQuestion) {
          setCurrentQuestion(nextQuestion)
          setMessages(prev => [...prev, { id: (Date.now()+1).toString(), sender: 'ai', message: nextQuestion, timestamp: new Date().toISOString() }])
        } else {
          setCurrentQuestion('Interview completed. Thank you!')
        }
      } else {
        // fallback mock
        const combined = [voiceTranscript.trim(), newMessage.trim()].filter(Boolean).join('\n\n')
        const sentMessage = await apiClient.sendMessage(combined)
        setMessages(prev => [...prev, sentMessage])
        setNewMessage('')
        setVoiceTranscript('')
        setTimeout(() => { fetchMessages() }, 2000)
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleRecording = () => {
    if (!srAvailable || !recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser')
      return
    }
    const next = !isRecording
    toggleRecording()
    if (next) {
      try {
        recognitionRef.current.start()
        toast.success('Listening...')
      } catch (_) {
        // already started
      }
    } else {
      try { recognitionRef.current.stop() } catch (_) {}
      toast.success('Stopped listening')
    }
  }

  const handleToggleVideo = () => {
    const next = !isVideoOn
    toggleVideo()
    toast.success(next ? 'Video turned on' : 'Video turned off')
  }

  const handleToggleCall = () => {
    const next = !isInCall
    toggleCall()
    toast.success(next ? 'Call started' : 'Call ended')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Interview</h1>
          <p className="text-gray-600">Conduct your interview with our AI assistant</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isInCall ? "destructive" : "primary"}
            onClick={handleToggleCall}
          >
            {isInCall ? (
              <>
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Start Call
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                {currentQuestion ? 'Current Question' : 'Interview Chat'}
              </CardTitle>
              <CardDescription>
                {currentQuestion || 'Ask questions and get responses from our AI interviewer'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <Animated key={message.id} className={`flex ${message.sender === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'candidate'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === 'ai' && (
                          <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                        )}
                        {message.sender === 'candidate' && (
                          <User className="w-4 h-4 mt-1 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Animated>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <div className="flex-1">
                  <Textarea3D
                    value={newMessage}
                    onChange={(e: any) => setNewMessage(e.target.value)}
                    placeholder="Speak or type your answer (paste code if needed)..."
                    disabled={isLoading}
                    rows={4}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    loading={isLoading}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button variant={isRecording ? 'destructive' : 'outline'} type="button" onClick={handleToggleRecording}>
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right pane: transcript & controls */}
        <div className="space-y-6">
          {/* Webcam (left) */}
          <Card>
            <CardHeader>
              <CardTitle>Camera</CardTitle>
              <CardDescription>Preview only</CardDescription>
            </CardHeader>
            <CardContent>
              <video ref={videoRef} className="w-full rounded-lg" autoPlay playsInline muted />
            </CardContent>
          </Card>
          {/* Interview Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Controls</CardTitle>
              <CardDescription>Manage your interview session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={toggleRecording}
                  className="h-12 flex-col"
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5 mb-1" />
                  ) : (
                    <Mic className="w-5 h-5 mb-1" />
                  )}
                  <span className="text-xs">
                    {isRecording ? 'Stop' : 'Record'}
                  </span>
                </Button>
                
                <Button
                  variant={isVideoOn ? "primary" : "outline"}
                  onClick={toggleVideo}
                  className="h-12 flex-col"
                >
                  {isVideoOn ? (
                    <VideoOff className="w-5 h-5 mb-1" />
                  ) : (
                    <Video className="w-5 h-5 mb-1" />
                  )}
                  <span className="text-xs">
                    {isVideoOn ? 'Video Off' : 'Video On'}
                  </span>
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Interview Duration</span>
                  <span>15:32</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Questions Asked</span>
                  <span>{messages.filter(m => m.sender === 'ai').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live transcript helper */}
          <Card>
            <CardHeader>
              <CardTitle>Live Transcript (what AI heard)</CardTitle>
              <CardDescription>Helps catch misunderstandings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 min-h-[60px] p-3 bg-gray-50 rounded">{voiceTranscript || '...'}</div>
            </CardContent>
          </Card>

          {/* Current focus */}
          <Card>
            <CardHeader>
              <CardTitle>Current Focus</CardTitle>
              <CardDescription>What we're discussing now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">{currentQuestion || 'Starting...'}</p>
                <p className="text-xs text-blue-700 mt-1">Answer verbally; we’ll transcribe and adapt follow-ups.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CandidateInterview
