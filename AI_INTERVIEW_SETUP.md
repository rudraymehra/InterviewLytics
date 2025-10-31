# 🤖 AI Interview System - Setup Guide

## Overview
This guide walks you through setting up the complete AI-powered interview system for InterviewLytics.

## 📋 Prerequisites

1. **Supabase Project** (already set up)
2. **Groq API Key** - Get from https://console.groq.com/
3. **Optional: OpenAI API Key** - For enhanced speech-to-text (if needed)

---

## 🗄️ Database Setup

### 1. Run the SQL Schema

Go to Supabase SQL Editor and run `DATABASE_SCHEMA.sql`:

```sql
-- This creates:
-- ✓ jobs table
-- ✓ applications table (with match_percentage)
-- ✓ interview_sessions table
-- ✓ interview_questions table
-- ✓ interviews table (scheduled interviews)
```

### 2. Create Storage Buckets

In Supabase Dashboard → Storage, create these buckets:

1. **`candidate-resumes`** (private or public)
   - For job application resumes
   
2. **`profile-resumes`** (private)
   - For profile resume uploads
   
3. **`profile-avatars`** (public)
   - For user profile pictures

### 3. Set Storage Policies (if needed)

If you want row-level security:

```sql
-- Example: Allow service role full access
create policy "Service role can manage resumes"
on storage.objects for all
to service_role
using (bucket_id = 'candidate-resumes');
```

---

## 🔑 Environment Variables

### Local Development (`.env.local`)

```bash
# Copy from env.example
JWT_SECRET=your-strong-secret-key-min-32-chars

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-public-key

# AI Services
GROQ_API_KEY=gsk_your_groq_api_key_here

# Optional: OpenAI for Whisper STT (if needed)
OPENAI_API_KEY=sk-your-openai-key-optional
```

### Vercel Deployment

Add these in Vercel Dashboard → Project Settings → Environment Variables:

- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `GROQ_API_KEY`
- `OPENAI_API_KEY` (optional)

---

## 🚀 How the AI Interview System Works

### Flow Overview

```
1. Recruiter posts job with requirements
   ↓
2. Candidate applies with resume
   ↓
3. AI analyzes resume vs job → Match %
   ↓
4. Candidate starts AI interview
   ↓
5. AI generates 3 resume-based + 3 job-based questions
   ↓
6. For each question:
   - AI speaks question (text-to-speech)
   - Candidate records answer (speech-to-text)
   - AI evaluates answer & generates cross-question
   ↓
7. AI generates overall feedback & grade
   ↓
8. Results visible to candidate & recruiter
```

### API Endpoints

#### Jobs
- `POST /api/jobs` - Create job posting (recruiter)
- `GET /api/jobs` - Get all active jobs (candidate) or recruiter's jobs
- `GET /api/jobs/[jobId]` - Get job details
- `PATCH /api/jobs/[jobId]` - Update job (recruiter)

#### Applications
- `POST /api/applications` - Submit application with resume (includes AI matching)
- `GET /api/applications` - Get candidate's applications or job's applications (recruiter)

#### Interview
- `POST /api/interview/start` - Start AI interview session
- `GET /api/interview/[sessionId]` - Get interview questions and progress
- `POST /api/interview/answer` - Submit answer, get evaluation, optionally generate cross-question
- `POST /api/interview/complete` - Complete interview, generate final feedback

---

## 🧪 Testing the System

### 1. Test as Recruiter

1. Sign up/login as recruiter
2. Go to `/recruiter/jobs`
3. Create a job posting with detailed requirements
4. View the job listing

### 2. Test as Candidate

1. Sign up/login as candidate
2. Go to `/candidate/jobs`
3. Apply to a job with resume upload
4. Check `/candidate/applications` for match percentage
5. **Important**: Manually update application status to `interview_scheduled` in Supabase:

```sql
update applications 
set status = 'interview_scheduled' 
where candidate_id = 'your-candidate-id';
```

6. Click "Start AI Interview" button
7. Complete the interview:
   - Click "Read Question" to hear AI speak
   - Click "Start Recording" and speak your answer
   - Click "Stop Recording" when done
   - Click "Submit Answer" to continue
   - AI will evaluate and ask cross-questions
8. After all questions, view results at `/candidate/feedback`

---

## 🎯 Features Implemented

### Resume Matching
- ✅ AI analyzes resume vs job requirements
- ✅ Calculates match percentage (0-100)
- ✅ Provides detailed analysis (matched/missing skills)
- ✅ Visible to both candidate and recruiter

### Interview Question Generation
- ✅ 3 resume-based questions from candidate's experience
- ✅ 3 job-based questions from job requirements
- ✅ Dynamic cross-questions based on answers
- ✅ Context-aware question generation

### Interview Experience
- ✅ Text-to-speech: AI reads questions aloud
- ✅ Speech-to-text: Converts candidate answers to text
- ✅ Live webcam feed (visual only, not recorded)
- ✅ Real-time transcription display
- ✅ Progress tracking

### AI Evaluation
- ✅ Scores each answer (0-100)
- ✅ Evaluates correctness, clarity, depth, relevance
- ✅ Provides specific feedback per answer
- ✅ Generates overall grade (A-F)
- ✅ Lists strengths and weaknesses
- ✅ Comprehensive final report

### Results & Feedback
- ✅ Beautiful results page with grade and score
- ✅ Question-by-question breakdown
- ✅ Detailed evaluation metrics
- ✅ Actionable feedback for improvement
- ✅ Recruiter can view all interview results

---

## 🔧 Groq API Configuration

### Getting Your Groq API Key

1. Go to https://console.groq.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new API key
5. Copy and add to `.env.local`

### Groq Models Used

- **Question Generation**: `llama-3.1-70b-versatile`
- **Answer Evaluation**: `llama-3.1-70b-versatile`
- **Resume Matching**: `llama-3.1-70b-versatile`

These models are fast, accurate, and cost-effective.

---

## 🐛 Troubleshooting

### Speech Recognition Not Working
- **Issue**: Browser doesn't support Web Speech API
- **Solution**: Use Chrome/Edge (best support)
- **Alternative**: Add OpenAI Whisper integration

### AI API Errors
- **Issue**: `GROQ_API_KEY is not configured`
- **Solution**: Ensure environment variable is set and app is restarted
- **Check**: API key is valid at https://console.groq.com/

### Resume Upload Failing
- **Issue**: Storage bucket doesn't exist
- **Solution**: Create `candidate-resumes` bucket in Supabase Storage
- **Check**: Bucket policies allow service role access

### Interview Session Not Found
- **Issue**: Session ID not passed correctly
- **Solution**: Check URL has `?session_id=...` parameter
- **Debug**: Check browser console for errors

### No Match Percentage Showing
- **Issue**: AI matching API failed silently
- **Solution**: Application still created, just without match score
- **Check**: Groq API key and quota
- **Note**: System continues to work even if matching fails

---

## 📊 Database Queries for Testing

### View All Applications with Match Scores

```sql
select 
  a.id,
  u.name as candidate_name,
  j.title as job_title,
  j.company,
  a.match_percentage,
  a.status,
  a.applied_at
from applications a
join users u on a.candidate_id = u.id
join jobs j on a.job_id = j.id
order by a.match_percentage desc nulls last;
```

### View Interview Results

```sql
select 
  s.id,
  u.name as candidate_name,
  j.title as job_title,
  s.overall_score,
  s.overall_grade,
  s.completed_at
from interview_sessions s
join users u on s.candidate_id = u.id
join jobs j on s.job_id = j.id
where s.status = 'completed'
order by s.completed_at desc;
```

### Manually Set Application to Interview Ready

```sql
update applications 
set status = 'interview_scheduled'
where id = 'application-id-here';
```

---

## 🎨 UI Pages Summary

### Recruiter Pages
- `/recruiter/jobs` - Create and manage job postings
- `/recruiter/applicants?job_id=...` - View applications with match scores
- `/recruiter/analytics` - View interview results and candidate performance

### Candidate Pages
- `/candidate/jobs` - Browse and apply to jobs
- `/candidate/applications` - View applications with match scores & start interviews
- `/candidate/interview?session_id=...` - Take AI interview
- `/candidate/feedback?session_id=...` - View detailed results

---

## 🚢 Deployment Checklist

- [ ] Run `DATABASE_SCHEMA.sql` in Supabase
- [ ] Create storage buckets (candidate-resumes, profile-resumes, profile-avatars)
- [ ] Get Groq API key
- [ ] Add all environment variables to Vercel
- [ ] Test recruiter job posting
- [ ] Test candidate application with resume
- [ ] Verify match percentage appears
- [ ] Test AI interview flow end-to-end
- [ ] Verify feedback page shows results

---

## 📝 Notes

1. **Video Recording**: The webcam is for visual presence only and is NOT recorded/stored (as requested)
2. **Resume Parsing**: Currently basic - can be enhanced with pdf-parse or mammoth libraries
3. **Cross-Questions**: Generated for the first 6 main questions (3 resume + 3 job)
4. **Groq Rate Limits**: Free tier has limits; upgrade if needed
5. **Speech APIs**: Uses browser Web Speech API (free, no server cost)

---

## 🎉 You're All Set!

The complete AI interview system is now ready. Test the full flow from job posting → application → interview → results.

For questions or issues, check the browser console and Vercel logs for detailed error messages.

