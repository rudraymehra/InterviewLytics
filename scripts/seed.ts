/**
 * Seed script: creates storage buckets, demo users, and sample jobs.
 * Run with: npm run seed  (requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local)
 */
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { config } from 'dotenv'

config({ path: '.env.local' })

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.local)')
  process.exit(1)
}

const supabase = createClient(url, key)

const BUCKETS: Array<{ name: string; isPublic: boolean }> = [
  { name: 'candidate-resumes', isPublic: false },
  { name: 'profile-resumes', isPublic: false },
  { name: 'profile-avatars', isPublic: true },
]

const DEMO_PASSWORD = 'Demo1234'

const USERS = [
  { name: 'Demo Recruiter', email: 'recruiter@demo.test', role: 'recruiter' as const, company: 'Acme Corp' },
  { name: 'Demo Candidate', email: 'candidate@demo.test', role: 'candidate' as const },
]

const JOBS = [
  {
    title: 'Senior Frontend Engineer',
    company: 'Acme Corp',
    description:
      'Own the design system and core product surfaces of our hiring platform. You will build accessible, high-performance React interfaces, collaborate with design on interaction details, and mentor mid-level engineers.',
    requirements:
      'React, TypeScript, Next.js, Tailwind CSS, accessibility (WCAG), performance profiling, 5+ years frontend experience, design-system experience, REST APIs',
    location: 'San Francisco, CA (Remote)',
    job_type: 'full-time',
    experience_level: 'senior',
    salary_range: '$150k – $190k',
    round1_pass_threshold: 60,
  },
  {
    title: 'Backend Engineer (Node.js)',
    company: 'Acme Corp',
    description:
      'Build and scale the APIs behind our AI interview pipeline: job postings, applications, scoring, and reporting. You will design Postgres schemas, harden auth, and keep latency low while AI calls stream.',
    requirements:
      'Node.js, TypeScript, PostgreSQL, REST API design, authentication/JWT, cloud storage, testing, 3+ years backend experience',
    location: 'New York, NY (Hybrid)',
    job_type: 'full-time',
    experience_level: 'mid',
    salary_range: '$130k – $165k',
    round1_pass_threshold: 60,
  },
  {
    title: 'Machine Learning Intern',
    company: 'Acme Corp',
    description:
      'Work with the AI team on resume-matching quality: evaluation datasets, prompt iteration, and scoring calibration for our two-round interview system.',
    requirements: 'Python, basic ML/NLP knowledge, data analysis with pandas, curiosity about LLMs, currently enrolled in a CS program',
    location: 'Remote',
    job_type: 'internship',
    experience_level: 'entry',
    salary_range: '$35/hr',
    round1_pass_threshold: 40,
  },
]

async function ensureBuckets() {
  const { data: existing } = await supabase.storage.listBuckets()
  const names = new Set((existing ?? []).map((b) => b.name))
  for (const bucket of BUCKETS) {
    if (names.has(bucket.name)) {
      console.log(`bucket ${bucket.name}: exists`)
      continue
    }
    const { error } = await supabase.storage.createBucket(bucket.name, { public: bucket.isPublic })
    if (error) throw new Error(`Failed to create bucket ${bucket.name}: ${error.message}`)
    console.log(`bucket ${bucket.name}: created (${bucket.isPublic ? 'public' : 'private'})`)
  }
}

async function ensureUsers(): Promise<Record<string, string>> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)
  const ids: Record<string, string> = {}
  for (const user of USERS) {
    const { data: existing } = await supabase.from('users').select('id').eq('email', user.email).maybeSingle()
    if (existing) {
      ids[user.role] = existing.id
      console.log(`user ${user.email}: exists`)
      continue
    }
    const id = randomUUID()
    const { error } = await supabase.from('users').insert({
      id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: 'company' in user ? user.company : null,
      password_hash: passwordHash,
    })
    if (error) throw new Error(`Failed to create user ${user.email}: ${error.message}`)
    ids[user.role] = id
    console.log(`user ${user.email}: created (password: ${DEMO_PASSWORD})`)
  }
  return ids
}

async function ensureJobs(recruiterId: string) {
  const { data: existing } = await supabase.from('jobs').select('title').eq('recruiter_id', recruiterId)
  const titles = new Set((existing ?? []).map((j) => j.title))
  for (const job of JOBS) {
    if (titles.has(job.title)) {
      console.log(`job "${job.title}": exists`)
      continue
    }
    const { error } = await supabase.from('jobs').insert({ ...job, recruiter_id: recruiterId, status: 'active' })
    if (error) throw new Error(`Failed to create job "${job.title}": ${error.message}`)
    console.log(`job "${job.title}": created`)
  }
}

async function main() {
  await ensureBuckets()
  const ids = await ensureUsers()
  await ensureJobs(ids.recruiter)
  console.log('\nSeed complete. Demo logins (password Demo1234):')
  console.log('  recruiter@demo.test  → /login-recruiter')
  console.log('  candidate@demo.test  → /login-candidate')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
