'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RadarChart } from '@/components/charts/RadarChart'
import { apiClient, Feedback } from '@/utils/apiClient'
import {
  Star,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

const CandidateFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const feedbackData = await apiClient.getFeedback()
      setFeedback(feedbackData)
    } catch (error) {
      toast.error('Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
  }

  const skillsData = feedback ? {
    labels: ['Technical', 'Communication', 'Problem Solving', 'Leadership', 'Teamwork'],
    datasets: [
      {
        label: 'Your Skills Score',
        data: [
          feedback.skills.technical,
          feedback.skills.communication,
          feedback.skills.problemSolving,
          feedback.skills.leadership,
          feedback.skills.teamwork
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
      }
    ]
  } : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!feedback) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback available</h3>
        <p className="text-gray-600 mb-4">Complete an interview to receive detailed feedback</p>
        <Button>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Feedback</h1>
          <p className="text-gray-600">Detailed analysis of your interview performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-4">
              <span className={`text-3xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                {feedback.overallScore}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Overall Score: {feedback.overallScore}/100
            </h2>
            <p className={`text-lg font-medium ${getScoreColor(feedback.overallScore)}`}>
              {getScoreLabel(feedback.overallScore)}
            </p>
            <p className="text-gray-600 mt-2">
              Based on your interview performance and responses
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              Strengths
            </CardTitle>
            <CardDescription>Areas where you excelled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.strengths.map((strength, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{strength}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              Areas for Improvement
            </CardTitle>
            <CardDescription>Areas to focus on for future interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{weakness}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Assessment</CardTitle>
          <CardDescription>Detailed breakdown of your skills performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {skillsData && <RadarChart data={skillsData} />}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Skills Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Skills Scores</CardTitle>
          <CardDescription>Individual scores for each skill area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(feedback.skills).map(([skill, score]) => (
              <div key={skill} className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 relative">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={getScoreColor(score)}
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${score}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 capitalize">
                  {skill.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-sm text-gray-600">{score}/100</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-blue-600">
            <Lightbulb className="w-5 h-5 mr-2" />
            Recommendations
          </CardTitle>
          <CardDescription>Actionable advice for your career development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedback.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-sm text-blue-900">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>What you can do to improve your interview performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Immediate Actions</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Practice technical questions in your weak areas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Work on communication skills through mock interviews
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Build projects to strengthen your portfolio
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Long-term Development</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Target className="w-4 h-4 text-blue-500 mr-2" />
                  Take online courses in identified skill gaps
                </li>
                <li className="flex items-center">
                  <Target className="w-4 h-4 text-blue-500 mr-2" />
                  Join professional communities and networks
                </li>
                <li className="flex items-center">
                  <Target className="w-4 h-4 text-blue-500 mr-2" />
                  Seek mentorship opportunities
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CandidateFeedback
