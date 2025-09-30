'use client'

import React, { useState, useEffect } from 'react'
import { Button, FormInput, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import Animated from '@/components/Animated'
import { useToggle } from '@/hooks'
import { apiClient, InterviewMessage } from '@/utils/apiClient'
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

  useEffect(() => {
    fetchMessages()
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
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      const sentMessage = await apiClient.sendMessage(newMessage)
      setMessages(prev => [...prev, sentMessage])
      setNewMessage('')
      
      // Simulate AI response after a delay
      setTimeout(() => {
        fetchMessages()
      }, 2000)
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleRecording = () => {
    const next = !isRecording
    toggleRecording()
    toast.success(next ? 'Recording started' : 'Recording stopped')
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
                Interview Chat
              </CardTitle>
              <CardDescription>
                Ask questions and get responses from our AI interviewer
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
                  <FormInput
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || isLoading}
                  loading={isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Controls and Info */}
        <div className="space-y-6">
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

          {/* Interview Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Tips</CardTitle>
              <CardDescription>Make the most of your interview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    Be specific and provide examples in your answers
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    Ask clarifying questions if needed
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    Take your time to think before responding
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    Be honest about your experience and skills
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          <Card>
            <CardHeader>
              <CardTitle>Current Focus</CardTitle>
              <CardDescription>What we're discussing now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  Technical Skills & Experience
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  We're exploring your technical background and relevant experience
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CandidateInterview
