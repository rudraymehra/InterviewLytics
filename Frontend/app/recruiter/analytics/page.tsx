'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart } from '@/components/charts/BarChart'
import { RadarChart } from '@/components/charts/RadarChart'
import { apiClient } from '@/utils/apiClient'
import {
  TrendingUp,
  Users,
  Briefcase,
  Target,
  Clock,
  Star,
  BarChart3,
  PieChart
} from 'lucide-react'

const RecruiterAnalytics: React.FC = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await apiClient.getAnalytics()
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const applicationsData = {
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
      }
    ]
  }

  const skillsData = {
    labels: ['Technical', 'Communication', 'Problem Solving', 'Leadership', 'Teamwork'],
    datasets: [
      {
        label: 'Average Skills Score',
        data: [85, 78, 92, 65, 88],
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(212, 175, 55, 0.3)',
        borderColor: isDark ? 'rgba(59, 130, 246, 1)' : 'rgba(212, 175, 55, 1)',
        pointBackgroundColor: isDark ? 'rgba(59, 130, 246, 1)' : 'rgba(212, 175, 55, 1)',
        pointBorderColor: isDark ? '#1f2937' : '#fff',
        pointHoverBackgroundColor: isDark ? '#1f2937' : '#fff',
        pointHoverBorderColor: isDark ? 'rgba(59, 130, 246, 1)' : 'rgba(212, 175, 55, 1)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  }

  const statusDistributionData = {
    labels: ['Pending', 'Shortlisted', 'Rejected', 'Hired'],
    datasets: [
      {
        label: 'Applicants',
        data: [25, 45, 15, 15],
        backgroundColor: isDark ? [
          'rgba(251, 191, 36, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(239, 68, 68, 0.9)',
          'rgba(34, 197, 94, 0.9)'
        ] : [
          'rgba(212, 175, 55, 0.8)',
          'rgba(17, 24, 39, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: isDark ? [
          'rgba(251, 191, 36, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)'
        ] : [
          'rgba(212, 175, 55, 1)',
          'rgba(17, 24, 39, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 3,
        borderRadius: 12,
        borderSkipped: false,
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-300">Insights and metrics for your recruitment process</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalJobs || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12%</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applicants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalApplicants || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8%</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(analytics?.averageScore || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+5%</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hire Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">15%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+3%</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Trend */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Applications & Hires Trend</CardTitle>
            <CardDescription>Monthly overview of applications and successful hires</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex-1">
            <div className="h-[400px] w-full">
              <BarChart data={applicationsData} />
            </div>
          </CardContent>
        </Card>

        {/* Skills Analysis */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Skills Analysis</CardTitle>
            <CardDescription>Average skills scores across all candidates</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex-1">
            <div className="h-[400px] w-full">
              <RadarChart data={skillsData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status Distribution</CardTitle>
          <CardDescription>Current status of all applications</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="h-[400px] w-full">
            <BarChart
              data={statusDistributionData}
              options={{
                barPercentage: 0.6,
                categoryPercentage: 0.5,
                layout: { padding: { top: 10, right: 10, bottom: 24, left: 10 } },
                elements: { bar: { borderRadius: 12, maxBarThickness: 48 } },
                scales: {
                  x: {
                    grid: { display: false, drawTicks: false },
                    border: { display: false },
                    ticks: { padding: 6 },
                  },
                  y: {
                    beginAtZero: true,
                    max: 50,
                    ticks: { stepSize: 10 },
                    grid: { color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0,0,0,0.05)', drawBorder: false },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Jobs</CardTitle>
            <CardDescription>Jobs with the highest application rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Senior Frontend Developer', applications: 24, conversion: '12%' },
                { title: 'Product Manager', applications: 18, conversion: '8%' },
                { title: 'Backend Developer', applications: 15, conversion: '10%' }
              ].map((job, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{job.applications} applications</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{job.conversion} conversion</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recruitment Insights </CardTitle>
            <CardDescription>Key metrics and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-200">Time to Hire</h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Average: 12 days (Industry: 15 days)</p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <h4 className="font-medium text-green-900 dark:text-green-200">Quality Score</h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">85% of candidates meet requirements</p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <h4 className="font-medium text-purple-900 dark:text-purple-200">Response Time</h4>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Average: 2.5 hours (Excellent)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RecruiterAnalytics
