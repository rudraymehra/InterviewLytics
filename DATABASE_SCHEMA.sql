-- ============================================
-- InterviewLytics AI Interview System Schema
-- ============================================

-- 1. JOBS TABLE (Recruiter posts jobs with requirements)
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  company text not null,
  description text not null,
  requirements text not null, -- Job requirements/skills needed
  requirements_document_path text, -- Optional: uploaded requirements doc
  requirements_document_name text,
  location text,
  job_type text, -- 'full-time', 'part-time', 'contract', 'internship'
  experience_level text, -- 'entry', 'mid', 'senior'
  salary_range text,
  status text not null default 'active', -- 'active', 'closed', 'draft'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists jobs_recruiter_id_idx on public.jobs(recruiter_id);
create index if not exists jobs_status_idx on public.jobs(status);

-- 2. APPLICATIONS TABLE (Updated with resume matching)
drop table if exists public.applications cascade;
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.users(id) on delete cascade,
  resume_path text not null, -- Stored in Supabase Storage
  resume_name text not null,
  cover_letter text,
  match_percentage integer, -- AI-calculated match score (0-100)
  match_analysis jsonb, -- Detailed matching analysis from AI
  status text not null default 'pending', -- 'pending', 'shortlisted', 'rejected', 'interview_scheduled', 'hired'
  applied_at timestamptz default now(),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists applications_job_id_idx on public.applications(job_id);
create index if not exists applications_candidate_id_idx on public.applications(candidate_id);
create index if not exists applications_status_idx on public.applications(status);

-- 3. INTERVIEW SESSIONS (Tracks each AI interview)
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  candidate_id uuid not null references public.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status text not null default 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  overall_score integer, -- Final score (0-100)
  overall_grade text, -- 'A', 'B', 'C', 'D', 'F'
  overall_feedback text, -- AI-generated summary
  strengths jsonb, -- Array of strength points
  weaknesses jsonb, -- Array of improvement areas
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists interview_sessions_application_id_idx on public.interview_sessions(application_id);
create index if not exists interview_sessions_candidate_id_idx on public.interview_sessions(candidate_id);
create index if not exists interview_sessions_job_id_idx on public.interview_sessions(job_id);

-- 4. INTERVIEW QUESTIONS (Individual questions in each session)
create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  question_number integer not null, -- Order in the interview
  question_type text not null, -- 'resume_based', 'job_based', 'cross_question'
  parent_question_id uuid references public.interview_questions(id), -- For cross-questions
  question_text text not null,
  context text, -- Why this question was asked (for AI generation context)
  candidate_answer text, -- Speech-to-text transcription
  answer_score integer, -- Score for this specific answer (0-100)
  answer_feedback text, -- AI feedback on this answer
  answer_evaluation jsonb, -- Detailed evaluation (correctness, clarity, depth, etc.)
  answered_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists interview_questions_session_id_idx on public.interview_questions(session_id);
create index if not exists interview_questions_parent_id_idx on public.interview_questions(parent_question_id);

-- 5. Update existing interviews table for scheduled interviews
drop table if exists public.interviews cascade;
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete set null,
  candidate_id uuid not null references public.users(id) on delete cascade,
  recruiter_id uuid references public.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  title text not null,
  company text not null,
  interview_type text not null, -- 'AI Interview', 'Technical', 'HR Round', 'Final'
  scheduled_at timestamptz not null,
  meeting_link text, -- For AI interviews, link to /candidate/interview
  session_id uuid references public.interview_sessions(id), -- Link to completed session
  status text not null default 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  created_at timestamptz default now()
);

create index if not exists interviews_candidate_id_idx on public.interviews(candidate_id);
create index if not exists interviews_recruiter_id_idx on public.interviews(recruiter_id);
create index if not exists interviews_application_id_idx on public.interviews(application_id);
create index if not exists interviews_scheduled_at_idx on public.interviews(scheduled_at);

-- ============================================
-- Storage Buckets (Run in Supabase Dashboard)
-- ============================================
-- 1. job-requirements (for recruiter uploaded requirement docs)
-- 2. candidate-resumes (for application resumes)
-- Note: profile-avatars and profile-resumes already exist

-- ============================================
-- Sample Data (Optional)
-- ============================================
-- Insert a sample job
-- insert into public.jobs (recruiter_id, title, company, description, requirements, job_type, experience_level, location)
-- values (
--   '<recruiter-user-id>',
--   'Senior Frontend Developer',
--   'Tech Corp',
--   'We are looking for an experienced frontend developer to join our team.',
--   'React.js, TypeScript, Next.js, Tailwind CSS, 3+ years experience, Strong problem-solving skills, Experience with RESTful APIs',
--   'full-time',
--   'senior',
--   'San Francisco, CA (Remote)'
-- );

