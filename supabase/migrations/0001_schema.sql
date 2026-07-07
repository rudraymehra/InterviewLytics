-- ============================================
-- InterviewLytics — full schema
-- Two-round AI interview pipeline:
--   applied → screened → round1_in_progress → (round1_completed | round2_available)
--   → round2_in_progress → round2_completed → shortlisted/rejected/hired
-- ============================================

-- 1. USERS (custom JWT auth, bcrypt password hashes)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('candidate', 'recruiter')),
  company text,
  password_hash text not null,
  created_at timestamptz default now()
);

create index if not exists users_email_idx on public.users(email);

-- 2. PROFILES (candidate/recruiter extended profile)
create table if not exists public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  phone text,
  location text,
  bio text,
  resume_path text,
  resume_name text,
  avatar_path text,
  avatar_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. JOBS
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  company text not null,
  description text not null,
  requirements text not null,
  requirements_document_path text,
  requirements_document_name text,
  location text,
  job_type text,
  experience_level text,
  salary_range text,
  status text not null default 'active' check (status in ('active', 'closed', 'draft')),
  round1_pass_threshold integer check (round1_pass_threshold between 0 and 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists jobs_recruiter_id_idx on public.jobs(recruiter_id);
create index if not exists jobs_status_idx on public.jobs(status);

-- 4. APPLICATIONS (one per candidate per job; carries pipeline state + scores)
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.users(id) on delete cascade,
  resume_path text not null,
  resume_name text not null,
  resume_mime text not null default 'application/pdf',
  cover_letter text,
  match_percentage integer,
  match_analysis jsonb,
  status text not null default 'applied' check (status in (
    'applied',
    'screened',
    'round1_in_progress',
    'round1_completed',
    'round2_available',
    'round2_in_progress',
    'round2_completed',
    'shortlisted',
    'rejected',
    'hired'
  )),
  round1_score integer,
  round1_grade text,
  round2_score integer,
  round2_grade text,
  final_score integer,
  final_grade text,
  final_report jsonb,
  applied_at timestamptz default now(),
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  unique (job_id, candidate_id)
);

create index if not exists applications_job_id_idx on public.applications(job_id);
create index if not exists applications_candidate_id_idx on public.applications(candidate_id);
create index if not exists applications_status_idx on public.applications(status);

-- 5. INTERVIEW SESSIONS (one per application per round)
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  candidate_id uuid not null references public.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  round smallint not null default 1 check (round in (1, 2)),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  overall_score integer,
  overall_grade text,
  overall_feedback text,
  strengths jsonb,
  weaknesses jsonb,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists interview_sessions_application_id_idx on public.interview_sessions(application_id);
create index if not exists interview_sessions_candidate_id_idx on public.interview_sessions(candidate_id);
create index if not exists interview_sessions_job_id_idx on public.interview_sessions(job_id);
-- One live/finished session per application per round (abandoned ones can be retried)
create unique index if not exists interview_sessions_app_round_active
  on public.interview_sessions(application_id, round)
  where status in ('in_progress', 'completed');

-- 6. INTERVIEW QUESTIONS
create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  question_number integer not null,
  question_type text not null check (question_type in ('resume_based', 'job_based', 'cross_question')),
  parent_question_id uuid references public.interview_questions(id),
  question_text text not null,
  context text,
  candidate_answer text,
  answer_score integer,
  answer_feedback text,
  answer_evaluation jsonb,
  answered_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists interview_questions_session_id_idx on public.interview_questions(session_id);
create index if not exists interview_questions_parent_id_idx on public.interview_questions(parent_question_id);

-- Grants: the app talks to Postgres through PostgREST using the service_role key.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- Storage buckets are created by scripts/seed.ts (or manually in the dashboard):
--   candidate-resumes (private), profile-resumes (private), profile-avatars (public)
