'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { BarChart, RadarChart } from '@/components/charts'
import { Users, CheckCircle, Star, TrendingUp } from 'lucide-react'
import { apiClient } from '@/utils/apiClient'
import toast from 'react-hot-toast'

const RecruiterAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const data = await apiClient.getAnalytics()
      setAnalyticsData(data)
    } catch (error) {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const scoreDistributionData = {
    labels: ['0-20', '20-40', '40-60', '60-80', '80-100'],
    datasets: [
      {
        label: 'Number of Applicants',
        data: [
          analyticsData?.statusDistribution?.rejected || 0,
          analyticsData?.statusDistribution?.pending || 0,
          analyticsData?.statusDistribution?.shortlisted || 0,
          analyticsData?.statusDistribution?.hired || 0,
          analyticsData?.statusDistribution?.hired || 0
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const funnelData = {
    labels: ['Applied', 'Screened', 'Interviewed', 'Shortlisted', 'Hired'],
    datasets: [
      {
        label: 'Candidates',
        data: [
          analyticsData?.totalApplicants || 0,
          (analyticsData?.totalApplicants || 0) * 0.8,
          (analyticsData?.totalApplicants || 0) * 0.5,
          analyticsData?.statusDistribution?.shortlisted || 0,
          analyticsData?.statusDistribution?.hired || 0
        ],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Recruiter Analytics</h1>
      <p className="text-gray-600">Overview of your hiring pipeline and candidate performance.</p>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalApplicants || 0}</div>
            <p className="text-xs text-gray-500">+20% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analyticsData?.averageScore || 0).toFixed(1)}</div>
            <p className="text-xs text-gray-500">Overall match score</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.statusDistribution?.shortlisted || 0}</div>
            <p className="text-xs text-gray-500">Candidates moved forward</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.statusDistribution?.hired || 0}</div>
            <p className="text-xs text-gray-500">Successful placements</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Breakdown of applicant match scores.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={scoreDistributionData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hiring Funnel</CardTitle>
            <CardDescription>Progress of candidates through the pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={funnelData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RecruiterAnalytics