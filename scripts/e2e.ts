/**
 * End-to-end lifecycle test, driven over HTTP against a running dev server.
 *
 *   npm run fixtures            # once, to generate the sample resume PDF
 *   npm run dev                 # in another terminal (with .env.local configured)
 *   npm run e2e                 # this script
 *
 * Covers: recruiter signup → post job → candidate signup → apply with PDF →
 * AI screening → Round 1 interview (incl. cross-questions) → auto-advance →
 * Round 2 → final report → recruiter reviews applicant detail → hire →
 * candidate sees status.
 */
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000'
const here = dirname(fileURLToPath(import.meta.url))
const stamp = Date.now()

let passed = 0
function ok(name: string, cond: unknown, detail?: unknown) {
  if (cond) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    console.error(`  ✗ FAIL: ${name}`, detail ?? '')
    process.exit(1)
  }
}

async function api(path: string, opts: { method?: string; token?: string; body?: any; form?: FormData } = {}) {
  const headers: Record<string, string> = {}
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`
  let body: any
  if (opts.form) {
    body = opts.form
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }
  const res = await fetch(`${BASE}/api${path}`, { method: opts.method || 'GET', headers, body })
  const json: any = await res.json().catch(() => ({}))
  return { status: res.status, json, data: json?.data !== undefined ? json.data : json }
}

const ANSWERS: Record<string, string[]> = {
  strong: [
    'At Nimbus Analytics I led the design-system effort: I built roughly 40 React components in TypeScript with Tailwind, documented them in Storybook, and drove adoption across five product teams. The hardest part was the accessibility bar — every component had to pass WCAG 2.1 AA, so I wrote automated axe-core checks into CI and manually tested keyboard flows. Adoption cut our UI defect rate by about 40% over two quarters.',
    'The performance work started when our main dashboard took 4.2 seconds to become interactive. I profiled it with Lighthouse and the React Profiler, found we were shipping the whole charting library upfront, and introduced route-level code-splitting plus memoized selectors. Time-to-interactive dropped to 1.1 seconds and we set a performance budget in CI so it could not regress.',
    'I mentored three mid-level engineers through weekly pairing and a frontend guild. One concrete example: I coached one of them through owning our migration to the new data-fetching layer end to end — she designed the adapter, wrote the migration codemod, and presented it to the team. Two of the three have since been promoted.',
    'For the customer portal at Brightpath I owned the REST integration layer. I designed a typed client with normalized error handling — every endpoint returned a discriminated union of success and typed failure, so UI code could exhaustively handle errors. That killed a whole class of unhandled-promise bugs and made retries consistent.',
    'I introduced Playwright end-to-end tests covering the five highest-traffic flows, running on every PR in about six minutes with trace artifacts on failure. Regression escapes to production dropped roughly 30% in the first quarter, and the traces cut our time-to-diagnose flaky UI bugs dramatically.',
  ],
}

async function answerAllQuestions(token: string, sessionId: string, questions: any[], answers: string[]) {
  let queue = [...questions].filter((q) => !q.candidate_answer)
  let i = 0
  let crossCount = 0
  while (queue.length > 0) {
    const q = queue.shift()!
    const echo = `To answer your question — "${String(q.question_text).slice(0, 160)}" — here is my honest experience. `
    const answer = echo + answers[i % answers.length] + (q.question_type === 'cross_question' ? ' To be specific: I personally wrote the implementation, measured the results with our metrics pipeline, and presented the outcome to leadership.' : '')
    i++
    const r = await api('/interview/answer', { method: 'POST', token, body: { question_id: q.id, answer } })
    ok(`answered Q${q.question_number} (${q.question_type}) — score ${r.data?.question?.answer_score}`, r.status === 200 && typeof r.data?.question?.answer_score === 'number', r.json)
    if (r.data.crossQuestion) {
      crossCount++
      queue.unshift(r.data.crossQuestion)
    }
    if (r.data.remaining === 0) break
  }
  return crossCount
}

async function main() {
  console.log(`E2E against ${BASE}\n`)
  const resumePdf = readFileSync(join(here, 'fixtures', 'sample-resume.pdf'))

  // ── Recruiter: signup + post job ──
  console.log('Recruiter setup')
  const rEmail = `e2e-recruiter-${stamp}@test.dev`
  let r = await api('/auth/signup', { method: 'POST', body: { name: 'E2E Recruiter', email: rEmail, password: 'Passw0rd123', role: 'recruiter', company: 'E2E Corp' } })
  ok('recruiter signup', r.status === 201 && r.data?.token, r.json)
  const rTok = r.data.token

  r = await api('/jobs', {
    method: 'POST', token: rTok,
    body: {
      title: 'Senior Frontend Engineer (E2E)', company: 'E2E Corp',
      description: 'Build accessible, high-performance React interfaces and own the design system.',
      requirements: 'React, TypeScript, Next.js, Tailwind CSS, accessibility, performance profiling, Playwright, design systems',
      location: 'Remote', job_type: 'full-time', experience_level: 'senior', salary_range: '$150k+',
      // Low threshold: canned answers can't fully match dynamically generated questions,
      // so this exercises the auto-advance MECHANISM (the fail path is covered by rigorous
      // scoring in real usage — an off-topic answer scores near zero).
      round1_pass_threshold: 10,
    },
  })
  ok('job posted', r.status === 201 && r.data?.job?.id, r.json)
  const jobId = r.data.job.id

  // ── Candidate: signup + browse + apply ──
  console.log('\nCandidate apply + AI screening')
  const cEmail = `e2e-candidate-${stamp}@test.dev`
  r = await api('/auth/signup', { method: 'POST', body: { name: 'E2E Candidate', email: cEmail, password: 'Passw0rd123', role: 'candidate' } })
  ok('candidate signup', r.status === 201 && r.data?.token, r.json)
  const cTok = r.data.token

  r = await api('/jobs', { token: cTok })
  ok('candidate sees job listing', r.status === 200 && r.data.jobs?.some((j: any) => j.id === jobId), r.json)

  const form = new FormData()
  form.append('job_id', jobId)
  form.append('resume', new File([resumePdf], 'sample-resume.pdf', { type: 'application/pdf' }))
  form.append('cover_letter', 'I am excited to apply — my design-system and performance background matches this role.')
  r = await api('/applications', { method: 'POST', token: cTok, form })
  ok('application created + screened', r.status === 201 && r.data?.application?.status === 'screened', r.json)
  const appId = r.data.application.id
  const match = r.data.application.match_percentage
  ok(`match percentage present (${match}%)`, typeof match === 'number', r.json)

  // duplicate application must 409
  const dupForm = new FormData()
  dupForm.append('job_id', jobId)
  dupForm.append('resume', new File([resumePdf], 'sample-resume.pdf', { type: 'application/pdf' }))
  r = await api('/applications', { method: 'POST', token: cTok, form: dupForm })
  ok('duplicate application rejected (409)', r.status === 409, r.json)

  // round 2 must be locked
  r = await api('/interview/start', { method: 'POST', token: cTok, body: { application_id: appId, round: 2 } })
  ok('round 2 locked before round 1', r.status === 400, r.json)

  // ── Round 1 ──
  console.log('\nRound 1 (resume-based)')
  r = await api('/interview/start', { method: 'POST', token: cTok, body: { application_id: appId, round: 1 } })
  ok('round 1 started with 5 questions', (r.status === 201 || r.status === 200) && r.data?.questions?.length === 5, r.json)
  ok('questions are resume_based', r.data.questions.every((q: any) => q.question_type === 'resume_based'), r.data.questions)
  const s1 = r.data.session
  const cross1 = await answerAllQuestions(cTok, s1.id, r.data.questions, ANSWERS.strong)
  console.log(`  (cross-questions asked: ${cross1})`)

  r = await api('/interview/complete', { method: 'POST', token: cTok, body: { session_id: s1.id } })
  ok('round 1 completed', r.status === 200 && r.data?.session?.status === 'completed', r.json)
  ok(`round 1 scored (${r.data.application.round1_score}, threshold ${r.data.passThreshold})`, typeof r.data.application.round1_score === 'number', r.json)
  ok('auto-advanced to round 2', r.data.advanced === true && r.data.application.status === 'round2_available', r.json)

  // ── Round 2 ──
  console.log('\nRound 2 (JD-based)')
  r = await api('/interview/start', { method: 'POST', token: cTok, body: { application_id: appId, round: 2 } })
  ok('round 2 started with 5 questions', (r.status === 201 || r.status === 200) && r.data?.questions?.length === 5, r.json)
  ok('questions are job_based', r.data.questions.every((q: any) => q.question_type === 'job_based'), r.data.questions)
  const s2 = r.data.session
  await answerAllQuestions(cTok, s2.id, r.data.questions, ANSWERS.strong)

  r = await api('/interview/complete', { method: 'POST', token: cTok, body: { session_id: s2.id } })
  ok('round 2 completed', r.status === 200 && r.data?.application?.status === 'round2_completed', r.json)
  ok(`final score computed (${r.data.application.final_score}, grade ${r.data.application.final_grade})`, typeof r.data.application.final_score === 'number', r.json)
  ok('final report generated', !!r.data.application.final_report?.recommendation, r.json)

  // candidate feedback detail
  r = await api(`/applications/${appId}`, { token: cTok })
  ok('candidate feedback detail has both rounds', r.status === 200 && r.data?.rounds?.length === 2, r.json)
  ok('resume signed URL present', typeof r.data.resume_url === 'string' && r.data.resume_url.length > 0, r.json)

  // ── Recruiter review ──
  console.log('\nRecruiter review + hire')
  r = await api('/recruiter/applicants', { token: rTok })
  ok('recruiter sees applicant', r.status === 200 && r.data.applicants?.some((a: any) => a.id === appId), r.json)

  r = await api(`/recruiter/applications/${appId}`, { token: rTok })
  ok('recruiter detail: transcripts + report', r.status === 200 && r.data?.rounds?.length === 2 && !!r.data.final_report, r.json)
  ok('recruiter detail: resume URL', typeof r.data.resume_url === 'string', r.json)

  // security: another recruiter cannot access
  let r2 = await api('/auth/signup', { method: 'POST', body: { name: 'Other Recruiter', email: `e2e-other-${stamp}@test.dev`, password: 'Passw0rd123', role: 'recruiter', company: 'Rival Inc' } })
  const otherTok = r2.data.token
  r2 = await api(`/recruiter/applications/${appId}`, { token: otherTok })
  ok('foreign recruiter blocked (403)', r2.status === 403, r2.json)

  r = await api(`/recruiter/applications/${appId}`, { method: 'PATCH', token: rTok, body: { status: 'hired' } })
  ok('recruiter hires candidate', r.status === 200 && r.data?.application?.status === 'hired', r.json)

  r = await api(`/recruiter/applications/${appId}`, { method: 'PATCH', token: rTok, body: { status: 'rejected' } })
  ok('terminal status locked (409)', r.status === 409, r.json)

  r = await api('/applications', { token: cTok })
  ok('candidate sees hired status', r.data.applications?.find((a: any) => a.id === appId)?.status === 'hired', r.json)

  // dashboards + analytics smoke
  console.log('\nDashboards')
  r = await api('/dashboard/candidate', { token: cTok })
  ok('candidate dashboard', r.status === 200 && r.data?.stats, r.json)
  r = await api('/dashboard/recruiter', { token: rTok })
  ok('recruiter dashboard', r.status === 200 && r.data?.stats, r.json)
  r = await api('/recruiter/analytics', { token: rTok })
  ok('recruiter analytics', r.status === 200 && typeof r.data?.totalCandidates === 'number', r.json)

  console.log(`\nALL ${passed} CHECKS PASSED ✅`)
}

main().catch((err) => {
  console.error('E2E crashed:', err)
  process.exit(1)
})
