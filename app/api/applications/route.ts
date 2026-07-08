import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/apiAuth'
import {
  createApplication,
  getApplicationsByCandidate,
  getJobById,
  removeUploadedResume,
  updateApplication,
  uploadResume,
} from '@/lib/jobStore'
import { analyzeResumeMatch } from '@/lib/aiService'
import { findUserById } from '@/lib/userStore'
import { sendStatusEmail } from '@/lib/notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_RESUME_BYTES = 4 * 1024 * 1024 // 4MB
const ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
// Browsers can report an empty/nonstandard MIME for valid Office files, so a
// recognized extension is accepted as an alternative to a recognized MIME.
const EXTENSION_MIMES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

/**
 * GET /api/applications — the authenticated candidate's applications.
 */
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request, 'candidate')

    const applications = await getApplicationsByCandidate(user.id)
    return NextResponse.json({ data: { applications } })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

/**
 * POST /api/applications — apply to a job (multipart form: job_id, resume,
 * cover_letter?). Uploads the resume, creates the application, then runs
 * AI resume screening and returns the screened application.
 */
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request, 'candidate')

    const formData = await request.formData()
    const jobId = formData.get('job_id')
    const resumeFile = formData.get('resume')
    const coverLetter = formData.get('cover_letter')

    if (typeof jobId !== 'string' || jobId.trim().length === 0) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 })
    }

    const job = await getJobById(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    if (job.status !== 'active') {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      )
    }

    if (!(resumeFile instanceof File) || resumeFile.size === 0) {
      return NextResponse.json({ error: 'A resume file is required' }, { status: 400 })
    }
    if (resumeFile.size > MAX_RESUME_BYTES) {
      return NextResponse.json(
        { error: 'Resume file is too large (max 4MB)' },
        { status: 413 }
      )
    }
    const extension = resumeFile.name.split('.').pop()?.toLowerCase() ?? ''
    const extensionMime = EXTENSION_MIMES[extension]
    if (!ALLOWED_MIMES.includes(resumeFile.type) && !extensionMime) {
      return NextResponse.json(
        { error: 'Resume must be a PDF or Word document' },
        { status: 415 }
      )
    }
    const resumeMime = ALLOWED_MIMES.includes(resumeFile.type)
      ? resumeFile.type
      : extensionMime ?? 'application/pdf'

    const { path, name } = await uploadResume(user.id, resumeFile)

    // Duplicate applications (unique job_id + candidate_id) surface as a
    // Postgres 23505 unique violation, mapped to 409 in the catch below —
    // no racy fetch-all pre-check.
    let application
    try {
      application = await createApplication({
        job_id: jobId,
        candidate_id: user.id,
        resume_path: path,
        resume_name: name,
        resume_mime: resumeMime,
        cover_letter: typeof coverLetter === 'string' && coverLetter.trim() ? coverLetter.trim() : undefined,
        status: 'applied',
      })
    } catch (createError) {
      // Best-effort cleanup of the orphaned storage object.
      await removeUploadedResume(path)
      throw createError
    }

    // AI resume screening. The service falls back internally, but even if it
    // throws we still mark the application as screened (with a null match).
    let screened
    try {
      const buffer = Buffer.from(await resumeFile.arrayBuffer())
      const match = await analyzeResumeMatch(
        { buffer, mime: resumeFile.type, name },
        {
          title: job.title,
          company: job.company,
          description: job.description,
          requirements: job.requirements,
        }
      )
      screened = await updateApplication(application.id, {
        match_percentage: match.matchPercentage,
        match_analysis: {
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          summary: match.summary,
          demoMode: match.demoMode,
        },
        status: 'screened',
      })
    } catch (aiError) {
      // Whatever happens during screening, the application must not stay
      // stranded in 'applied' — mark it screened with a null match.
      console.error('Resume screening failed, marking screened without match:', aiError)
      try {
        screened = await updateApplication(application.id, {
          match_percentage: null,
          match_analysis: null,
          status: 'screened',
        })
      } catch (updateError) {
        console.error('Failed to mark application screened after AI failure:', updateError)
        screened = application
      }
    }

    try {
      const candidate = await findUserById(user.id)
      await sendStatusEmail({
        to: user.email,
        candidateName: candidate?.name || user.email,
        jobTitle: job.title,
        company: job.company,
        kind: 'application_received',
      })
    } catch (emailError) {
      console.warn('Failed to send application-received email:', emailError)
    }

    return NextResponse.json({ data: { application: screened } }, { status: 201 })
  } catch (error) {
    const authResponse = handleAuthError(error)
    if (authResponse) return authResponse
    if (error instanceof Error && (error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 409 }
      )
    }
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
