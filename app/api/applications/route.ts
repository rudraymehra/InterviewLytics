import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import {
  createApplication,
  getApplicationsByCandidate,
  getApplicationsByJob,
  uploadResume,
  extractResumeText,
} from '@/lib/jobStore'
import { getJobById } from '@/lib/jobStore'
import { analyzeResumeMatch } from '@/lib/aiService'

/**
 * GET /api/applications - Get applications
 * Query params:
 * - candidate_id: Get applications for a candidate
 * - job_id: Get applications for a job (recruiter only)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const url = new URL(request.url)
    const jobId = url.searchParams.get('job_id')

    if (jobId && decoded.role === 'recruiter') {
      // Get applications for a specific job
      const applications = await getApplicationsByJob(jobId)
      return NextResponse.json({ applications })
    } else {
      // Get candidate's own applications
      const applications = await getApplicationsByCandidate(decoded.userId)
      return NextResponse.json({ applications })
    }
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications - Create a new application with resume upload and AI matching
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Only candidates can apply for jobs' },
        { status: 403 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const jobId = formData.get('job_id') as string
    const coverLetter = formData.get('cover_letter') as string
    const resumeFile = formData.get('resume') as File

    if (!jobId || !resumeFile) {
      return NextResponse.json(
        { error: 'Missing required fields (job_id, resume)' },
        { status: 400 }
      )
    }

    // Get job details
    const job = await getJobById(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Upload resume to Supabase Storage
    const { path: resumePath, name: resumeName } = await uploadResume(
      decoded.userId,
      resumeFile
    )

    // Extract text from resume for AI analysis
    const resumeText = await extractResumeText(resumeFile)

    // Analyze resume match with AI
    let matchPercentage: number | undefined
    let matchAnalysis: any = undefined

    try {
      const analysis = await analyzeResumeMatch(
        resumeText,
        job.requirements,
        job.title
      )
      matchPercentage = analysis.matchPercentage
      matchAnalysis = analysis.analysis
    } catch (aiError) {
      console.error('AI matching failed:', aiError)
      // Continue without match percentage if AI fails
    }

    // Create application
    const application = await createApplication({
      job_id: jobId,
      candidate_id: decoded.userId,
      resume_path: resumePath,
      resume_name: resumeName,
      cover_letter: coverLetter || undefined,
      match_percentage: matchPercentage,
      match_analysis: matchAnalysis,
      status: 'pending',
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create application' },
      { status: 500 }
    )
  }
}

