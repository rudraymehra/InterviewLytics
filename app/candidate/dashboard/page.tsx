'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  FileText,
  MessageCircle,
  Star,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Plus
} from 'lucide-react'
import toast from 'react-hot-toast'

type ApplicationStatus = 'pending' | 'shortlisted' | 'rejected' | 'hired'

interface DashboardApplication {
  id: string
  jobTitle: string
  company: string
  status: ApplicationStatus
  appliedAt: string
  score?: number
}

interface DashboardInterview {
  id: string
  title: string
  company: string
  interviewType?: string
  scheduledAt: string
  meetingLink?: string
}

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth()
  const [applications, setApplications] = useState<DashboardApplication[]>([])
  const [interviews, setInterviews] = useState<DashboardInterview[]>([])
  const [stats, setStats] = useState({ totalApplications: 0, shortlisted: 0, hired: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/dashboard/candidate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = typeof json?.message === 'string' ? json.message : 'Failed to load dashboard'
        throw new Error(message)
      }

      setApplications(json?.data?.applications ?? [])
      setInterviews(json?.data?.interviews ?? [])
      setStats(json?.data?.stats ?? { totalApplications: 0, shortlisted: 0, hired: 0 })
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Failed to load dashboard'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: DashboardApplication['status']) => {
    switch (status) {
      case 'hired':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'shortlisted':
        return <Star className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: DashboardApplication['status']) => {
    switch (status) {
      case 'hired':
        return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200'
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200'
    }
  }

  const statsCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-200',
      bgColor: 'bg-blue-100 dark:bg-blue-500/20'
    },
    {
      title: 'Shortlisted',
      value: stats.shortlisted,
      icon: Star,
      color: 'text-yellow-600 dark:text-yellow-200',
      bgColor: 'bg-yellow-100 dark:bg-yellow-500/20'
    },
    {
      title: 'Interviews',
      value: interviews.length,
      icon: MessageCircle,
      color: 'text-purple-600 dark:text-purple-200',
      bgColor: 'bg-purple-100 dark:bg-purple-500/20'
    },
    {
      title: 'Hired',
      value: stats.hired,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-200',
      bgColor: 'bg-green-100 dark:bg-green-500/20'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-300">Welcome back, {user?.name}!</p>
        </div>
        <Button>
          <Search className="w-4 h-4 mr-2" />
          Find Jobs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-300">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center` }>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your latest job applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 3).map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(application.status)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{application.jobTitle}</h3>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{application.company}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    {application.score && (
                      <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                        {application.score}/100
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" className="h-16 flex-col dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/80">
                <Search className="w-6 h-6 mb-2" />
                <span>Find New Jobs</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/80">
                <MessageCircle className="w-6 h-6 mb-2" />
                <span>Start Interview</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/80">
                <Star className="w-6 h-6 mb-2" />
                <span>View Feedback</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Applications */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>Complete list of your job applications</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-colors">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(application.status)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{application.jobTitle}</h3>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{application.company}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {application.score && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-slate-300">Score</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{application.score}/100</p>
                      </div>
                    )}
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications yet</h3>
              <p className="text-gray-600 dark:text-slate-300 mb-4">Start applying to jobs to see them here</p>
              <Button>
                <Search className="w-4 h-4 mr-2" />
                Find Jobs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Interviews */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
          <CardDescription>Scheduled interviews and assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: 'AI Interview - Senior Frontend Developer',
                company: 'Tech Corp',
                time: 'Today, 2:00 PM',
                type: 'AI Interview'
              },
              {
                title: 'Technical Assessment - Product Manager',
                company: 'StartupXYZ',
                time: 'Tomorrow, 10:00 AM',
                type: 'Technical'
              }
            ].map((interview, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-slate-800/70 border border-blue-100 dark:border-slate-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{interview.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-300">{interview.company}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">{interview.time}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200 rounded-full">
                    {interview.type}
                  </span>
                  <Button size="sm">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CandidateDashboard
