# InterviewLytics

AI-powered hiring platform: recruiters post jobs, candidates apply with a resume, and Claude runs a **two-round AI interview pipeline** — Round 1 digs into the candidate's resume, Round 2 tests fit against the job description — producing scored transcripts and a final hiring report.

## How it works

```
Recruiter posts job (JD + optional Round-1 pass threshold)
        │
Candidate browses jobs → applies with resume (PDF/DOCX, ≤4MB)
        │
AI screening: Claude reads the resume natively vs the JD → match % + skill analysis
        │  status: screened
Round 1 — Resume Deep-Dive (4 main questions generated from the actual resume
          plus adaptive follow-up chains, voice or typed answers, per-answer scoring)
        │  score ≥ threshold → auto-advance          score < threshold
        ▼                                                    ▼
Round 2 — Role Fit Interview (4 JD-based questions plus      round1_completed
          adaptive follow-ups, informed by Round-1 performance) (recruiter decides)
        │
Final report: weighted score (resume 20% · R1 35% · R2 45%), grade,
strong_hire / hire / consider / no_hire recommendation
        │
Recruiter reviews applicants (transcripts, resume, report) → shortlist / reject / hire
```

## Stack

- **Next.js 14** (App Router) — one full-stack app: UI + API routes
- **Supabase** — Postgres + private storage buckets for resumes
- **Anthropic Claude** (`claude-opus-4-8`) — resume screening (native PDF reading), question generation, answer evaluation (structured outputs), cross-questioning, final reports
- **Web Speech API** — free in-browser voice answers (Chrome/Edge) + text-to-speech question readout; typing fallback everywhere
- **JWT auth** — separate candidate and recruiter portals

No key? The app runs in **demo mode** (deterministic question bank + keyword scoring) so every flow still works.

## Local setup

Prereqs: Node 18+, Docker (for local Supabase).

```bash
npm install

# 1. Start local Supabase (Postgres + storage) and apply the schema
npx supabase start          # prints local keys
npx supabase db reset       # applies supabase/migrations/0001_schema.sql

# 2. Configure env
cp env.example .env.local   # fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
                            # (from `supabase start` output), JWT_SECRET, ANTHROPIC_API_KEY

# 3. Buckets + demo data (recruiter@demo.test / candidate@demo.test, password Demo1234)
npm run seed

# 4. Run
npm run dev                 # http://localhost:3000
```

### Verification

```bash
npm run typecheck           # tsc --noEmit
npm run build               # production build
npm run fixtures            # generate scripts/fixtures/sample-resume.pdf
npm run e2e                 # full lifecycle test against a running dev server
npm run test:ui             # Playwright smoke tests (needs dev server + seed)
```

`npm run e2e` drives the entire product over HTTP: recruiter signup → job post → candidate apply with a real PDF → AI screening → Round 1 (with cross-questions) → auto-advance → Round 2 → final report → recruiter review → hire, including auth/ownership negative checks.

## Environment variables

See `env.example`. The load-bearing ones:

| Var | Purpose |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Database + storage (server-side only) |
| `JWT_SECRET` | Signs auth tokens |
| `ANTHROPIC_API_KEY` | Enables real AI (otherwise demo mode) |
| `ANTHROPIC_MODEL` | Defaults to `claude-opus-4-8` |
| `ROUND1_PASS_THRESHOLD` | Default Round-1 pass mark (%), per-job override in the job form |
| `SCORE_WEIGHT_RESUME/ROUND1/ROUND2` | Final score weights |
| `RESEND_API_KEY` (optional) | Real status emails; logged to console otherwise |

## Browser support

Voice input uses the Web Speech API (Chrome and Edge). Firefox/Safari users get a notice and can type their answers — every interview is fully completable by typing. The webcam preview is local-only; nothing is recorded.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel + hosted Supabase, including the bucket list, SQL to run, and serverless duration notes.

## Project structure

```
app/
  api/                    # All backend routes (auth, jobs, applications,
                          # interview/start|answer|complete, recruiter/*, dashboards)
  candidate/              # Candidate portal (jobs, applications, interview, feedback, ...)
  recruiter/              # Recruiter portal (jobs, applicants, analytics, ...)
lib/
  aiService.ts            # Claude facade (screening, questions, evaluation, reports)
  ai/                     # client, JSON schemas, resume ingestion, demo-mode fallback
  jobStore.ts             # Jobs + applications (Supabase)
  interviewStore.ts       # Interview sessions + questions
  apiAuth.ts              # JWT request auth for API routes
utils/apiClient.ts        # Typed client used by every page
supabase/migrations/      # Schema (single source of truth)
scripts/                  # seed, e2e, fixture generator
```
