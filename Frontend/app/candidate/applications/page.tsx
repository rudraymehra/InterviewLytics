'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { apiClient, Application, Job } from '@/utils/apiClient'
import {
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Building2
} from 'lucide-react'
import toast from 'react-hot-toast'

const CandidateApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [applicationsData, jobsData] = await Promise.all([
        apiClient.getApplications(),
        apiClient.getJobs()
      ])
      setApplications(applicationsData)
      setJobs(jobsData)
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

  const getJobDetails = (jobId: string) => {
    return jobs.find(job => job.id === jobId)
  }

  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600">Track your job applications and their status</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => {
          const jobDetails = getJobDetails(application.jobId)
          return (
            <Card key={application.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                        {application.score && (
                          <div className="flex items-center text-sm font-medium text-gray-600">
                            <Star className="w-4 h-4 mr-1" />
                            {application.score}/100
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {application.company}
                        </div>
                        {jobDetails?.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {jobDetails.location}
                          </div>
                        )}
                        {jobDetails?.salary && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {jobDetails.salary}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {jobDetails?.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {jobDetails.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Job
                        </Button>
                        {application.status === 'shortlisted' && (
                          <Button size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            Start Interview
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusIcon(application.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'You haven\'t applied to any jobs yet'
              }
            </p>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Find Jobs
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Application Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(app => app.status === 'shortlisted').length}
            </div>
            <div className="text-sm text-gray-600">Shortlisted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(app => app.status === 'hired').length}
            </div>
            <div className="text-sm text-gray-600">Hired</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {applications.length > 0 
                ? Math.round((applications.filter(app => app.status === 'hired').length / applications.length) * 100)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CandidateApplications
