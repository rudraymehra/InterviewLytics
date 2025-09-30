'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BarChart } from '@/components/charts/BarChart'
import { apiClient, Job, Applicant } from '@/utils/apiClient'
import {
  Briefcase,
  Users,
  MessageCircle,
  Target,
  TrendingUp,
  Plus,
  Eye,
  UserCheck,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [jobs, setJobs] = useState<Job[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [jobsData, applicantsData, analyticsData] = await Promise.all([
        apiClient.getJobs(),
        apiClient.getApplicants(),
        apiClient.getAnalytics()
      ])
      
      setJobs(jobsData)
      setApplicants(applicantsData)
      setAnalytics(analyticsData)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: 'Active Jobs',
      value: jobs.length,
      change: '+2',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Applicants',
      value: applicants.length,
      change: '+15%',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Interviews Conducted',
      value: 89,
      change: '+8',
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Hires This Month',
      value: 5,
      change: '+2',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Applications',
        data: [9, 17, 2, 3, 1, 2],
        backgroundColor: isDark ? [
          'rgba(59, 130, 246, 0.9)',
          'rgba(59, 130, 246, 0.9)', 
          'rgba(59, 130, 246, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(59, 130, 246, 0.9)'
        ] : [
          'rgba(212, 175, 55, 0.9)',
          'rgba(212, 175, 55, 0.9)', 
          'rgba(212, 175, 55, 0.9)',
          'rgba(212, 175, 55, 0.9)',
          'rgba(212, 175, 55, 0.9)',
          'rgba(212, 175, 55, 0.9)'
        ],
        borderColor: isDark ? [
          'rgba(59, 130, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(59, 130, 246, 1)'
        ] : [
          'rgba(212, 175, 55, 1)',
          'rgba(212, 175, 55, 1)',
          'rgba(212, 175, 55, 1)',
          'rgba(212, 175, 55, 1)',
          'rgba(212, 175, 55, 1)',
          'rgba(212, 175, 55, 1)'
        ],
        borderWidth: 3,
        borderRadius: 12,
        borderSkipped: false,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 8,
        shadowColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(212, 175, 55, 0.3)',
      },
      {
        label: 'Hires',
        data: [1, 2, 9, 3, 1, 2],
        backgroundColor: isDark ? [
          'rgba(147, 51, 234, 0.9)',
          'rgba(147, 51, 234, 0.9)',
          'rgba(147, 51, 234, 0.9)',
          'rgba(147, 51, 234, 0.9)',
          'rgba(147, 51, 234, 0.9)',
          'rgba(147, 51, 234, 0.9)'
        ] : [
          'rgba(17, 24, 39, 0.9)',
          'rgba(17, 24, 39, 0.9)',
          'rgba(17, 24, 39, 0.9)',
          'rgba(17, 24, 39, 0.9)',
          'rgba(17, 24, 39, 0.9)',
          'rgba(17, 24, 39, 0.9)'
        ],
        borderColor: isDark ? [
          'rgba(147, 51, 234, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(147, 51, 234, 1)'
        ] : [
          'rgba(17, 24, 39, 1)',
          'rgba(17, 24, 39, 1)',
          'rgba(17, 24, 39, 1)',
          'rgba(17, 24, 39, 1)',
          'rgba(17, 24, 39, 1)',
          'rgba(17, 24, 39, 1)'
        ],
        borderWidth: 3,
        borderRadius: 12,
        borderSkipped: false,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 8,
        shadowColor: isDark ? 'rgba(147, 51, 234, 0.3)' : 'rgba(17, 24, 39, 0.3)',
      }
    ]
  }

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
          <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.name}!</p>
        </div>
        <Button onClick={() => window.location.href = '/recruiter/jobs'}>
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{stat.change}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Your latest job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{job.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{job.company} • {job.location}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.applicantsCount} applicants</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applicants */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applicants</CardTitle>
            <CardDescription>Latest applications received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applicants.slice(0, 3).map((applicant) => (
                <div key={applicant.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-300">
                        {applicant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{applicant.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{applicant.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Score: {applicant.score}/100</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      applicant.status === 'shortlisted' 
                        ? 'bg-green-100 text-green-800'
                        : applicant.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-accent-100 text-accent-800'
                    }`}>
                      {applicant.status}
                    </span>
                    <Button variant="ghost" size="sm">
                      <UserCheck className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Applications & Hires Trend</CardTitle>
          <CardDescription>Monthly overview of applications and successful hires</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="h-[400px] w-full">
            <BarChart data={chartData} />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.location.href = '/recruiter/jobs'}
            >
              <Plus className="w-6 h-6 mb-2" />
              Create New Job
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.location.href = '/recruiter/applicants'}
            >
              <Users className="w-6 h-6 mb-2" />
              View All Applicants
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.location.href = '/recruiter/schedule'}
            >
              <MessageCircle className="w-6 h-6 mb-2" />
              Schedule Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RecruiterDashboard
