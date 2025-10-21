'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, FormInput, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import Animated from '@/components/Animated'
import { apiClient, InterviewMessage } from '@/utils/apiClient'
import { Send, Bot, User, Mic, MicOff, Video, VideoOff, Phone, PhoneOff, MessageCircle, Code } from 'lucide-react'
import toast from 'react-hot-toast'

const CandidateInterview: React.FC = () => {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [answerText, setAnswerText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const jobId = searchParams?.get('jobId') || 'demo-job-id' // Fallback for demo
    startInterviewSession(jobId);
    setupWebcam();

    return () => {
      stopSpeechRecognition();
      stopWebcam();
    };
  }, []);

  const startInterviewSession = async (jobId: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.startInterviewSession(jobId);
      setSessionId(res.sessionId);
      setCurrentQuestion(res.question);
      setMessages([{ id: 'initial-q', sender: 'ai', message: res.question, timestamp: new Date().toISOString() }]);
    } catch (error) {
      toast.error('Failed to start interview session.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaStreamRef.current = stream;
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast.error('Failed to access webcam. Please ensure camera permissions are granted.');
    }
  };

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const toggleSpeechRecognition = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser. Please use text input.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      toast.success('Recording stopped.');
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setLiveTranscript('');
        toast.success('Recording started. Speak now!');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        setLiveTranscript(finalTranscript + interimTranscript);
        setAnswerText(prev => prev + finalTranscript); // Append final transcript to answer
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast.error(`Speech recognition error: ${event.error}.`);
      };

      recognition.onend = () => {
        setIsRecording(false);
        toast.info('Speech recognition ended.');
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const stopSpeechRecognition = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const combinedAnswer = (liveTranscript.trim() + ' ' + answerText.trim()).trim();
    if (!combinedAnswer) return;

    setIsLoading(true);
    stopSpeechRecognition(); // Stop recording when submitting

    try {
      const res = await apiClient.submitInterviewAnswer(sessionId!, combinedAnswer);
      setMessages(prev => [...prev,
        { id: Date.now().toString(), sender: 'candidate', message: combinedAnswer, timestamp: new Date().toISOString() }
      ]);
      setAnswerText('');
      setLiveTranscript('');

      if (res.nextQuestion) {
        setCurrentQuestion(res.nextQuestion);
        setMessages(prev => [...prev,
          { id: (Date.now() + 1).toString(), sender: 'ai', message: res.nextQuestion, timestamp: new Date().toISOString() }
        ]);
      } else {
        setCurrentQuestion(null);
        toast.success('Interview completed! Redirecting to feedback...');
        // Redirect to feedback page
        setTimeout(() => {
          window.location.href = `/candidate/feedback?applicationId=${searchParams?.get('applicationId')}&sessionId=${sessionId}`;
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to submit answer.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Interview</h1>
          <p className="text-gray-600">Conduct your interview with our AI assistant</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isRecording ? "destructive" : "outline"}
            onClick={toggleSpeechRecognition}
            disabled={isLoading}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Speaking
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Speaking
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webcam Feed */}
        <Card className="h-[600px] flex flex-col items-center justify-center bg-gray-900 relative overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover"></video>
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
            Live Camera
          </div>
        </Card>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Interview Chat
            </CardTitle>
            <CardDescription>
              {currentQuestion || 'Interview completed!'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2 border rounded-lg bg-gray-50">
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

            {/* Live Transcript / Text Input */}
            <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
              {liveTranscript && (
                <div className="text-sm text-gray-600 p-2 border border-blue-300 bg-blue-50 rounded-lg">
                  <span className="font-semibold">AI Heard:</span> {liveTranscript}
                </div>
              )}
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer or code here..."
                className="flex-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                rows={4}
                disabled={isLoading || !currentQuestion}
              />
              <Button
                type="submit"
                disabled={(!answerText.trim() && !liveTranscript.trim()) || isLoading || !currentQuestion}
                loading={isLoading}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Answer
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateInterview;