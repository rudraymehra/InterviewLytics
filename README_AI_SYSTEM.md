# 🚀 InterviewLytics - Complete AI Interview System

## ✨ Overview

A fully functional AI-powered recruitment platform with intelligent resume matching and automated interview capabilities.

---

## 🎯 Key Features

### For Recruiters
- ✅ Post jobs with detailed requirements
- ✅ View applicants with AI-calculated match scores
- ✅ Review AI-generated interview results
- ✅ Track candidate performance across questions

### For Candidates  
- ✅ Browse and apply to jobs
- ✅ Get instant AI resume matching scores
- ✅ Take AI-powered interviews (no human needed!)
- ✅ Receive detailed performance feedback

### AI Capabilities
- ✅ **Resume Matching**: Analyzes resume vs job requirements (0-100% match)
- ✅ **Question Generation**: Creates 3 resume-based + 3 job-based questions
- ✅ **Cross-Questioning**: Dynamic follow-ups based on answers
- ✅ **Answer Evaluation**: Scores correctness, clarity, depth, relevance
- ✅ **Speech-to-Text**: Browser-based voice recording
- ✅ **Text-to-Speech**: AI reads questions aloud
- ✅ **Final Assessment**: Overall grade (A-F), strengths, weaknesses

---

## 📦 What's Included

### Frontend Pages
```
/recruiter/jobs          → Create & manage job postings
/recruiter/applicants    → View applications with match scores
/candidate/jobs          → Browse & apply to jobs
/candidate/applications  → Track applications, start interviews
/candidate/interview     → Take AI interview
/candidate/feedback      → View detailed results
```

### Backend APIs
```
POST /api/jobs                 → Create job posting
GET  /api/jobs                 → List jobs
POST /api/applications         → Submit application (+ AI matching)
GET  /api/applications         → Get applications
POST /api/interview/start      → Generate questions, start session
POST /api/interview/answer     → Submit answer, get evaluation
POST /api/interview/complete   → Finalize & generate report
GET  /api/interview/[id]       → Get session details
```

### Database Tables
- `jobs` - Job postings
- `applications` - Applications with match scores
- `interview_sessions` - Interview metadata & final scores
- `interview_questions` - Individual Q&A with evaluations

### AI Integration
- **Groq API** (LLaMA 3.1 70B) for all AI operations
- Fast, accurate, cost-effective
- No training required

---

## 🛠️ Setup Instructions

### 1. Database Setup

Run in Supabase SQL Editor:

```bash
# Execute the entire DATABASE_SCHEMA.sql file
```

This creates all necessary tables and indexes.

### 2. Storage Buckets

Create in Supabase Dashboard → Storage:

1. `candidate-resumes` (private)
2. `profile-resumes` (private)  
3. `profile-avatars` (public)

### 3. Environment Variables

**Local (`.env.local`):**
```bash
JWT_SECRET=your-strong-secret-min-32-chars
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
SUPABASE_ANON_KEY=xxx
GROQ_API_KEY=gsk_xxx
```

**Vercel:**
Add same variables in Project Settings → Environment Variables

### 4. Get Groq API Key

1. Visit https://console.groq.com/
2. Sign up (free tier available)
3. Generate API key
4. Add to `.env.local` and Vercel

---

## 🧪 Testing the System

### Complete Flow Test

#### As Recruiter:
1. Go to `/recruiter/jobs`
2. Click "Post New Job"
3. Fill in:
   - **Title**: "Senior React Developer"
   - **Requirements**: "React.js, TypeScript, Node.js, 5+ years experience, REST APIs, Git"
   - **Description**: Brief job description
4. Click "Post Job"

#### As Candidate:
1. Go to `/candidate/jobs`
2. Find the job, click "Apply Now"
3. Upload a resume (PDF/DOC)
4. Submit application
5. **Check**: Match percentage should appear (may take 5-10 seconds)
6. Go to `/candidate/applications`

#### Enable Interview:
**Manually in Supabase** (recruiters would do this via UI in production):
```sql
update applications 
set status = 'interview_scheduled'
where candidate_id = '<your-candidate-user-id>';
```

#### Take Interview:
1. Refresh `/candidate/applications`
2. Click "Start AI Interview"
3. Allow camera/microphone access
4. Click "🔊 Read Question" to hear AI
5. Click "🎤 Start Recording"
6. Speak your answer
7. Click "⏹️ Stop Recording"
8. Review transcript, click "Submit Answer"
9. AI evaluates and may ask cross-question
10. Repeat for all questions
11. View results at `/candidate/feedback`

---

## 📁 File Structure

```
app/
├── api/
│   ├── jobs/
│   │   ├── route.ts
│   │   └── [jobId]/route.ts
│   ├── applications/route.ts
│   └── interview/
│       ├── start/route.ts
│       ├── answer/route.ts
│       ├── complete/route.ts
│       └── [sessionId]/route.ts
├── recruiter/jobs/page.tsx
├── candidate/
│   ├── jobs/page.tsx
│   ├── applications/page.tsx
│   ├── interview/page.tsx
│   └── feedback/page.tsx

lib/
├── aiService.ts          # Groq API integration
├── jobStore.ts           # Jobs & applications
├── interviewStore.ts     # Interview sessions
└── supabaseAdmin.ts      # Shared DB client

DATABASE_SCHEMA.sql        # Complete schema
AI_INTERVIEW_SETUP.md      # Detailed setup guide
WHATS_NEW.md              # Feature summary
```

---

## 🤖 AI Implementation Details

### Resume Matching
```typescript
analyzeResumeMatch(resumeText, jobRequirements, jobTitle)
→ Returns: matchPercentage (0-100), matched_skills[], missing_skills[]
```

### Interview Generation
```typescript
generateInterviewQuestions(resumeText, jobRequirements, jobTitle)
→ Returns: 3 resume-based + 3 job-based questions with context
```

### Answer Evaluation
```typescript
evaluateAnswer(question, answer, context, questionType)
→ Returns: score (0-100), feedback, evaluation{correctness, clarity, depth, relevance}
```

### Cross-Questioning
```typescript
generateCrossQuestion(originalQuestion, candidateAnswer, context)
→ Returns: follow-up question based on answer
```

### Final Assessment
```typescript
generateOverallFeedback(allQuestions)
→ Returns: overallScore, grade (A-F), feedback, strengths[], weaknesses[]
```

---

## 🎨 UI Features

### Interview Page
- Real-time webcam preview (not recorded)
- Text-to-speech question reading
- Voice recording with live transcription
- Progress bar tracking
- Previous answers summary
- Smooth question transitions

### Feedback Page
- Large grade display (A-F)
- Overall score visualization
- Strengths/weaknesses cards
- Question-by-question breakdown
- Detailed metrics per answer
- Color-coded scoring

### Applications Page
- Match percentage badges
- Status tracking
- "Start Interview" button
- Resume download links
- Application timeline

---

## 🔧 Troubleshooting

### Speech Recognition Not Working
- **Browser**: Use Chrome or Edge (best support)
- **Permissions**: Allow microphone access
- **Alternative**: Type answers (modify code to add textarea)

### AI API Errors
- **Check**: Groq API key is valid
- **Quota**: Free tier has limits, upgrade if needed
- **Logs**: Check browser console and Vercel logs

### No Match Percentage
- **Cause**: AI API may have failed
- **Impact**: Application still works, just no score
- **Fix**: Check Groq API key and quota

### Interview Button Not Showing
- **Status**: Application must be `interview_scheduled`
- **Fix**: Update status in Supabase or via recruiter UI

---

## 💡 Tips & Best Practices

1. **Job Requirements**: Be specific for better AI matching
2. **Resume Format**: PDF works best for text extraction
3. **Interview Questions**: AI generates based on actual content
4. **Cross-Questions**: Triggered for first 6 main questions only
5. **Speech Clarity**: Speak clearly for accurate transcription
6. **Browser**: Chrome/Edge for full feature support

---

## 📊 Data Flow

```
1. Recruiter creates job
   ↓
2. Candidate applies with resume
   ↓
3. AI analyzes resume vs job → match %
   ↓
4. Recruiter reviews, sets to "interview_scheduled"
   ↓
5. Candidate clicks "Start Interview"
   ↓
6. AI generates 6 base questions
   ↓
7. For each question:
   - AI reads question (TTS)
   - Candidate records answer (STT)
   - AI evaluates answer
   - AI may generate cross-question
   ↓
8. After all questions:
   - AI generates overall feedback
   - Grade, score, strengths, weaknesses
   ↓
9. Results visible to both parties
```

---

## 🚀 Deployment

### Vercel Setup
1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy from `frontend` branch
5. Set Production Branch to `frontend`

### Supabase Setup
1. Run `DATABASE_SCHEMA.sql`
2. Create storage buckets
3. Copy credentials to Vercel

### Groq Setup
1. Get API key from console.groq.com
2. Add to Vercel environment variables
3. Verify quota (free tier available)

---

## 📝 Environment Checklist

- [ ] `JWT_SECRET` set (min 32 chars)
- [ ] `SUPABASE_URL` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `SUPABASE_ANON_KEY` set
- [ ] `GROQ_API_KEY` set
- [ ] `DATABASE_SCHEMA.sql` executed
- [ ] Storage buckets created
- [ ] Test job posted
- [ ] Test application submitted
- [ ] Test interview completed

---

## 🎉 You're Ready!

The complete AI interview system is now live. Test the end-to-end flow and watch the AI in action!

For detailed setup steps, see `AI_INTERVIEW_SETUP.md`.
For feature details, see `WHATS_NEW.md`.

**Happy Hiring! 🚀**

