'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormInput } from '@/components/ui/FormInput'
import { apiClient, Applicant } from '@/utils/apiClient'
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

const RecruiterApplicants: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [sortByScore, setSortByScore] = useState<'desc' | 'asc' | 'none'>('none')

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    try {
      const applicantsData = await apiClient.getApplicants()
      setApplicants(applicantsData)
    } catch (error) {
      toast.error('Failed to load applicants')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicantId: string, newStatus: Applicant['status']) => {
    try {
      await apiClient.updateApplicantStatus(applicantId, newStatus)
      toast.success('Status updated successfully!')
      fetchApplicants()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  let filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = 
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (sortByScore !== 'none') {
    filteredApplicants = filteredApplicants.slice().sort((a, b) => {
      const da = a.score || 0
      const db = b.score || 0
      return sortByScore === 'desc' ? db - da : da - db
    })
  }

  const getStatusColor = (status: Applicant['status']) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'hired':
        return 'bg-blue-100 text-blue-800'
      default:
  return 'bg-accent-100 text-accent-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-accent-600'
    return 'text-red-600'
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
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-600">Review and manage candidate applications</p>
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
                  placeholder="Search applicants..."
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
              <Button variant="outline" onClick={() => setSortByScore(prev => prev === 'desc' ? 'asc' : prev === 'asc' ? 'none' : 'desc')}>
                <Filter className="w-4 h-4 mr-2" />
                Sort by Score: {sortByScore}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredApplicants.map((applicant) => (
          <Card key={applicant.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {applicant.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{applicant.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(applicant.status)}`}>
                        {applicant.status}
                      </span>
                      <div className={`flex items-center text-sm font-medium ${getScoreColor(applicant.score)}`}>
                        <Star className="w-4 h-4 mr-1" />
                        {applicant.score}/100
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {applicant.email}
                      </div>
                      {applicant.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {applicant.phone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Experience:</strong> {applicant.experience}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Education:</strong> {applicant.education}
                      </p>
                      <div className="flex items-center flex-wrap gap-1 mt-2">
                        {applicant.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        View Resume
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  {applicant.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(applicant.id, 'shortlisted')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(applicant.id, 'rejected')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {applicant.status === 'shortlisted' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(applicant.id, 'hired')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Hire
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplicants.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'No applications have been received yet'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Applicant Details</CardTitle>
              <CardDescription>
                Complete information about {selectedApplicant.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{selectedApplicant.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedApplicant.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Skills</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedApplicant.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Experience</label>
                    <p className="text-gray-900">{selectedApplicant.experience}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Education</label>
                    <p className="text-gray-900">{selectedApplicant.education}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default RecruiterApplicants
