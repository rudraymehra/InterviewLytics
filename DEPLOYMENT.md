# Deployment — Vercel + hosted Supabase

One Next.js app serves both the UI and the API. Recommended: **Vercel** (app) + **Supabase cloud** (database + storage).

## 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com) → note the **Project URL** and **service_role key** (Settings → API).
2. **Schema**: open SQL Editor → paste and run the entire contents of `supabase/migrations/0001_schema.sql`.
3. **Buckets** (Storage → New bucket):
   - `candidate-resumes` — private
   - `profile-resumes` — private
   - `profile-avatars` — **public**
4. Optional demo data: run `npm run seed` locally with `.env.local` pointed at the hosted project (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`), which also creates the buckets for you.

## 2. Vercel

1. Import the GitHub repo (root = this app).
2. Environment variables (Settings → Environment Variables):

   | Var | Value |
   |---|---|
   | `SUPABASE_URL` | `https://<project-id>.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key (server-side only — never expose with `NEXT_PUBLIC_`) |
   | `JWT_SECRET` | `openssl rand -hex 32` |
   | `ANTHROPIC_API_KEY` | your Anthropic key |
   | `ANTHROPIC_MODEL` | `claude-opus-4-8` (optional) |
   | `ROUND1_PASS_THRESHOLD` | `60` (optional) |
   | `SCORE_WEIGHT_RESUME` / `SCORE_WEIGHT_ROUND1` / `SCORE_WEIGHT_ROUND2` | `20` / `35` / `45` (optional) |
   | `RESEND_API_KEY`, `EMAIL_FROM` | optional — real status emails |

3. Deploy.

## Serverless limits to know

- **Function duration**: AI routes declare `maxDuration = 60`. The Vercel **Hobby plan caps at 60s too since 2024, but with lower CPU** — question generation and final reports can take 20–50s with `claude-opus-4-8`. If you hit timeouts, either upgrade to Pro or set `ANTHROPIC_MODEL=claude-haiku-4-5` for faster (cheaper, less thorough) interviews.
- **Request body**: Vercel caps bodies at ~4.5MB — the app enforces a 4MB resume limit client- and server-side.
- **Emails**: without `RESEND_API_KEY`, notification emails are logged to the function console (visible in Vercel logs).

## Sanity check after deploy

1. Sign up as a recruiter → post a job.
2. Sign up as a candidate (different browser/incognito) → apply with a PDF resume → you should see a match % within ~15s.
3. Start Round 1 from **My Applications**, answer a question — a score should come back after each answer.
4. Complete both rounds → recruiter's **Applicants** page shows scores, transcripts, resume link, and the final report; Shortlist/Reject/Hire buttons update the candidate's view.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| 500s on every data route | `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` missing or wrong |
| "permission denied for table …" | Migration SQL not fully run (grants at the bottom of the file) |
| Resume upload fails | Buckets missing — create the three buckets above |
| Match % is generic / "demo mode" tag visible | `ANTHROPIC_API_KEY` missing or invalid — check function logs for `[aiService] falling back` |
| Interview start times out | Function duration — see Serverless limits above |
| Voice input missing | Expected outside Chrome/Edge — typing fallback is always available |
