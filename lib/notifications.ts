// Candidate email notifications (Resend). Falls back to console logging when
// RESEND_API_KEY is not configured. Never throws — callers fire-and-forget.

export type NotificationKind =
  | 'application_received'
  | 'round1_passed'
  | 'round1_completed'
  | 'interviews_completed'
  | 'status_changed'

export interface StatusEmailOptions {
  to: string
  candidateName: string
  jobTitle: string
  company: string
  kind: NotificationKind
  status?: string
}

function buildTemplate(opts: StatusEmailOptions): { subject: string; html: string } {
  const { candidateName, jobTitle, company, status } = opts
  const greeting = `<p>Hi ${escapeHtml(candidateName)},</p>`
  const footer = `<p>— The InterviewLytics Team</p>`
  const role = `<strong>${escapeHtml(jobTitle)}</strong> at <strong>${escapeHtml(company)}</strong>`

  switch (opts.kind) {
    case 'application_received':
      return {
        subject: `Application received — ${jobTitle} at ${company}`,
        html: `${greeting}<p>We received your application for ${role}. Your resume has been screened and your Round 1 AI interview is ready whenever you are.</p>${footer}`,
      }
    case 'round1_passed':
      return {
        subject: `Round 1 passed — ${jobTitle} at ${company}`,
        html: `${greeting}<p>Great news! You passed Round 1 of the interview for ${role}. Round 2 is now unlocked — log in to continue.</p>${footer}`,
      }
    case 'round1_completed':
      return {
        subject: `Round 1 completed — ${jobTitle} at ${company}`,
        html: `${greeting}<p>Thanks for completing Round 1 of the interview for ${role}. Your results are available on your dashboard.</p>${footer}`,
      }
    case 'interviews_completed':
      return {
        subject: `Interviews completed — ${jobTitle} at ${company}`,
        html: `${greeting}<p>You have completed both interview rounds for ${role}. The recruiting team will review your results and get back to you.</p>${footer}`,
      }
    case 'status_changed':
      return {
        subject: `Application update — ${jobTitle} at ${company}`,
        html: `${greeting}<p>Your application for ${role} has been updated to: <strong>${escapeHtml(status || 'updated')}</strong>.</p>${footer}`,
      }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Send a status notification email to a candidate.
 * No-ops (console log) without RESEND_API_KEY. Never throws.
 */
export async function sendStatusEmail(opts: StatusEmailOptions): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    const { subject, html } = buildTemplate(opts)

    if (!apiKey) {
      console.log(
        `[notifications] (email disabled) to=${opts.to} kind=${opts.kind} subject="${subject}"`
      )
      return
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'InterviewLytics <onboarding@resend.dev>',
        to: [opts.to],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error(`[notifications] Resend error ${res.status}: ${detail}`)
    }
  } catch (error) {
    console.error('[notifications] Failed to send email:', error)
  }
}
