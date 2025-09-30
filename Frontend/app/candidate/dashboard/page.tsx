'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { apiClient, Application } from '@/utils/apiClient'
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

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const applicationsData = await apiClient.getApplications()
      setApplications(applicationsData)
    } catch (error) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Application['status']) => {
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

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'hired':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const stats = [
    {
      title: 'Total Applications',
      value: applications.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Shortlisted',
      value: applications.filter(app => app.status === 'shortlisted').length,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Interviews',
      value: 3,
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Hired',
      value: applications.filter(app => app.status === 'hired').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <Button>
          <Search className="w-4 h-4 mr-2" />
          Find Jobs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
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
                <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(application.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{application.jobTitle}</h3>
                      <p className="text-sm text-gray-600">{application.company}</p>
                      <p className="text-sm text-gray-500">
                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    {application.score && (
                      <span className="text-sm font-medium text-gray-600">
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
              <Button variant="outline" className="h-16 flex-col">
                <Search className="w-6 h-6 mb-2" />
                <span>Find New Jobs</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <MessageCircle className="w-6 h-6 mb-2" />
                <span>Start Interview</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
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
                <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(application.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{application.jobTitle}</h3>
                      <p className="text-sm text-gray-600">{application.company}</p>
                      <p className="text-sm text-gray-500">
                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {application.score && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Score</p>
                        <p className="text-lg font-semibold text-gray-900">{application.score}/100</p>
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
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-4">Start applying to jobs to see them here</p>
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
              <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{interview.title}</h3>
                  <p className="text-sm text-gray-600">{interview.company}</p>
                  <p className="text-sm text-blue-600">{interview.time}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
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
