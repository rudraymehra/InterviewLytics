import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { getApplicationById } from '@/lib/jobStore'
import { getJobById } from '@/lib/jobStore'
import { createInterviewSession, addInterviewQuestion } from '@/lib/interviewStore'
import { generateInterviewQuestions } from '@/lib/aiService'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * POST /api/interview/start - Start a new AI interview session
 * Body: { application_id: string }
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
        { error: 'Only candidates can start interviews' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { application_id } = body

    if (!application_id) {
      return NextResponse.json(
        { error: 'Missing application_id' },
        { status: 400 }
      )
    }

    // Get application details
    const application = await getApplicationById(application_id)
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (application.candidate_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'Not your application' },
        { status: 403 }
      )
    }

    // Get job details
    const job = await getJobById(application.job_id)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Get resume content from storage
    const supabase = getSupabaseAdmin()
    const { data: resumeData, error: downloadError } = await supabase.storage
      .from('candidate-resumes')
      .download(application.resume_path)

    if (downloadError) {
      console.error('Error downloading resume:', downloadError)
      return NextResponse.json(
        { error: 'Failed to access resume' },
        { status: 500 }
      )
    }

    // Extract text from resume (simplified - in production use proper PDF parser)
    const resumeText = await resumeData.text()

    // Generate interview questions using AI
    const questions = await generateInterviewQuestions(
      resumeText,
      job.requirements,
      job.title
    )

    // Create interview session
    const session = await createInterviewSession(
      application_id,
      decoded.userId,
      application.job_id
    )

    // Add resume-based questions
    let questionNumber = 1
    for (const q of questions.resumeQuestions) {
      await addInterviewQuestion({
        session_id: session.id,
        question_number: questionNumber++,
        question_type: 'resume_based',
        question_text: q.question,
        context: q.context,
      })
    }

    // Add job-based questions
    for (const q of questions.jobQuestions) {
      await addInterviewQuestion({
        session_id: session.id,
        question_number: questionNumber++,
        question_type: 'job_based',
        question_text: q.question,
        context: q.context,
      })
    }

    return NextResponse.json({
      session_id: session.id,
      message: 'Interview session started',
    })
  } catch (error: any) {
    console.error('Error starting interview:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start interview' },
      { status: 500 }
    )
  }
}

