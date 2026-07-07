// Resume file handling: turn an uploaded resume into Claude content blocks.

import mammoth from 'mammoth'
import type { ResumeInput } from './types'

const PDF_MIME = 'application/pdf'
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const DOC_MIME = 'application/msword'
const MAX_UNKNOWN_TEXT_CHARS = 50_000

function isDocx(resume: ResumeInput): boolean {
  const name = (resume.name || '').toLowerCase()
  return (
    resume.mime === DOCX_MIME ||
    resume.mime === DOC_MIME ||
    name.endsWith('.docx') ||
    name.endsWith('.doc')
  )
}

/**
 * Build the user-message content blocks for a request that needs the resume.
 *
 * - PDF: native document block (base64) followed by the text prompt.
 * - DOC/DOCX: text extracted via mammoth, prepended to the prompt.
 * - text/plain: raw utf8 text prepended to the prompt.
 * - Unknown: best-effort utf8, truncated to ~50k chars.
 */
export async function getResumeContentBlocks(resume: ResumeInput, prompt: string): Promise<any[]> {
  if (resume.mime === PDF_MIME) {
    return [
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: resume.buffer.toString('base64'),
        },
      },
      { type: 'text', text: prompt },
    ]
  }

  const text = await extractResumeTextNonPdf(resume)
  return [{ type: 'text', text: `RESUME:\n${text}\n\n${prompt}` }]
}

/**
 * Extract plain resume text without calling the API. Returns null for PDFs
 * (no local PDF parsing — used by the demo-mode fallback, where PDFs score
 * a neutral match).
 */
export async function extractResumeText(resume: ResumeInput): Promise<string | null> {
  if (resume.mime === PDF_MIME) return null
  return extractResumeTextNonPdf(resume)
}

async function extractResumeTextNonPdf(resume: ResumeInput): Promise<string> {
  if (isDocx(resume)) {
    const result = await mammoth.extractRawText({ buffer: resume.buffer })
    return result.value
  }
  if (resume.mime === 'text/plain') {
    return resume.buffer.toString('utf8')
  }
  // Unknown type — try utf8 and truncate.
  return resume.buffer.toString('utf8').slice(0, MAX_UNKNOWN_TEXT_CHARS)
}
