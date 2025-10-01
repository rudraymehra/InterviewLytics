// Mock API client - replace with actual API calls

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract'
  salary?: string
  description: string
  requirements: string[]
  status: 'active' | 'paused' | 'closed'
  createdAt: string
  applicantsCount: number
}

export interface Applicant {
  id: string
  name: string
  email: string
  phone?: string
  resume: string
  score: number
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired'
  appliedAt: string
  skills: string[]
  experience: string
  education: string
  analysisSummary?: string
  extractedSkills?: string[]
}

export interface Application {
  id: string
  jobId: string
  jobTitle: string
  company: string
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired'
  appliedAt: string
  score?: number
}

export interface InterviewMessage {
  id: string
  sender: 'ai' | 'candidate'
  message: string
  timestamp: string
}

export interface Feedback {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  skills: {
    technical: number
    communication: number
    problemSolving: number
    leadership: number
    teamwork: number
  }
  recommendations: string[]
}

// Mock data
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: '$120,000 - $150,000',
    description: 'We are looking for a senior frontend developer to join our team...',
    requirements: ['React', 'TypeScript', '5+ years experience'],
    status: 'active',
    createdAt: '2024-01-15',
    applicantsCount: 24
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'StartupXYZ',
    location: 'Remote',
    type: 'full-time',
    salary: '$100,000 - $130,000',
    description: 'Lead product development and strategy...',
    requirements: ['Product management', 'Agile', '3+ years experience'],
    status: 'active',
    createdAt: '2024-01-10',
    applicantsCount: 18
  }
]

const mockApplicants: Applicant[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1-555-0123',
    resume: 'john_smith_resume.pdf',
    score: 85,
    status: 'shortlisted',
    appliedAt: '2024-01-20',
    skills: ['React', 'TypeScript', 'Node.js'],
    experience: '5 years',
    education: 'BS Computer Science'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1-555-0124',
    resume: 'sarah_johnson_resume.pdf',
    score: 92,
    status: 'pending',
    appliedAt: '2024-01-19',
    skills: ['Vue.js', 'Python', 'AWS'],
    experience: '4 years',
    education: 'MS Software Engineering'
  }
]

const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Senior Frontend Developer',
    company: 'Tech Corp',
    status: 'pending',
    appliedAt: '2024-01-20',
    score: 78
  },
  {
    id: '2',
    jobId: '2',
    jobTitle: 'Product Manager',
    company: 'StartupXYZ',
    status: 'shortlisted',
    appliedAt: '2024-01-18',
    score: 85
  }
]

const mockInterviewMessages: InterviewMessage[] = [
  {
    id: '1',
    sender: 'ai',
    message: 'Hello! Welcome to your AI-powered interview. Let\'s start with a brief introduction. Can you tell me about yourself and your background?',
    timestamp: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    sender: 'candidate',
    message: 'Hi! I\'m a software developer with 5 years of experience in React and TypeScript. I\'ve worked on various web applications and have a strong passion for creating user-friendly interfaces.',
    timestamp: '2024-01-20T10:01:00Z'
  }
]

const mockFeedback: Feedback = {
  overallScore: 85,
  strengths: [
    'Strong technical skills in React and TypeScript',
    'Good communication and problem-solving abilities',
    'Experience with modern development practices'
  ],
  weaknesses: [
    'Limited experience with backend technologies',
    'Could improve on system design knowledge'
  ],
  skills: {
    technical: 80,
    communication: 90,
    problemSolving: 85,
    leadership: 70,
    teamwork: 88
  },
  recommendations: [
    'Consider learning Node.js for full-stack development',
    'Practice system design interviews',
    'Continue building side projects to showcase skills'
  ]
}

// API functions
export const apiClient = {
  // Jobs
  getJobs: async (): Promise<Job[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockJobs
  },

  getJob: async (id: string): Promise<Job | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockJobs.find(job => job.id === id) || null
  },

  createJob: async (jobData: Omit<Job, 'id' | 'createdAt' | 'applicantsCount'>): Promise<Job> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      applicantsCount: 0
    }
    mockJobs.push(newJob)
    return newJob
  },

  updateJob: async (id: string, updates: Partial<Job>): Promise<Job | null> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const jobIndex = mockJobs.findIndex(job => job.id === id)
    if (jobIndex === -1) return null
    mockJobs[jobIndex] = { ...mockJobs[jobIndex], ...updates }
    return mockJobs[jobIndex]
  },

  deleteJob: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const jobIndex = mockJobs.findIndex(job => job.id === id)
    if (jobIndex === -1) return false
    mockJobs.splice(jobIndex, 1)
    return true
  },

  // Applicants
  getApplicants: async (jobId?: string): Promise<Applicant[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return jobId ? mockApplicants : mockApplicants
  },

  getApplicant: async (id: string): Promise<Applicant | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockApplicants.find(applicant => applicant.id === id) || null
  },

  updateApplicantStatus: async (id: string, status: Applicant['status']): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const applicant = mockApplicants.find(app => app.id === id)
    if (!applicant) return false
    applicant.status = status
    return true
  },

  // Attempt to rescore an application via backend when possible; otherwise simulate
  rescoreApplication: async (applicationId: string): Promise<{ score: number; analysisSummary?: string; extractedSkills?: string[] }> => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (API_BASE && token && applicationId && applicationId.length === 24) {
      try {
        const res = await fetch(`${API_BASE}/applications/${applicationId}/score`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const { data } = await res.json()
          const updated = { score: Number(data.matchScore) || 0, analysisSummary: data.analysisSummary, extractedSkills: data.extractedSkills }
          return updated
        }
      } catch (_) {}
    }
    // Fallback simulation for demo
    const applicant = mockApplicants.find(a => a.id === applicationId)
    if (applicant) {
      applicant.score = Math.min(100, Math.max(0, Math.round(applicant.score + (Math.random() * 20 - 10))))
      applicant.analysisSummary = `Simulated analysis updated at ${new Date().toLocaleString()}`
      applicant.extractedSkills = applicant.skills.slice(0, 5)
      return { score: applicant.score, analysisSummary: applicant.analysisSummary, extractedSkills: applicant.extractedSkills }
    }
    return { score: Math.round(Math.random() * 100) }
  },

  // Applications
  getApplications: async (): Promise<Application[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockApplications
  },

  createApplication: async (jobId: string): Promise<Application> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const job = mockJobs.find(j => j.id === jobId)
    if (!job) throw new Error('Job not found')
    
    const newApplication: Application = {
      id: Date.now().toString(),
      jobId,
      jobTitle: job.title,
      company: job.company,
      status: 'pending',
      appliedAt: new Date().toISOString().split('T')[0]
    }
    mockApplications.push(newApplication)
    return newApplication
  },

  // Interview
  getInterviewMessages: async (): Promise<InterviewMessage[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockInterviewMessages
  },

  sendMessage: async (message: string): Promise<InterviewMessage> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newMessage: InterviewMessage = {
      id: Date.now().toString(),
      sender: 'candidate',
      message,
      timestamp: new Date().toISOString()
    }
    mockInterviewMessages.push(newMessage)
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: InterviewMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: 'Thank you for your response. Can you tell me about a challenging project you worked on recently?',
        timestamp: new Date().toISOString()
      }
      mockInterviewMessages.push(aiResponse)
    }, 2000)
    
    return newMessage
  },

  // Feedback
  getFeedback: async (): Promise<Feedback> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockFeedback
  },

  // Analytics
  getAnalytics: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      totalJobs: mockJobs.length,
      totalApplicants: mockApplicants.length,
      averageScore: mockApplicants.reduce((sum, app) => sum + app.score, 0) / mockApplicants.length,
      statusDistribution: {
        pending: mockApplicants.filter(app => app.status === 'pending').length,
        shortlisted: mockApplicants.filter(app => app.status === 'shortlisted').length,
        rejected: mockApplicants.filter(app => app.status === 'rejected').length,
        hired: mockApplicants.filter(app => app.status === 'hired').length
      }
    }
  }
}
