# InterviewLytics Deployment Guide

## Overview
This is a monorepo with separate `frontend` and `backend` deployment branches. Each branch contains only its respective application at the repository root for independent deployment.

## Repository Structure
- **main branch**: Full monorepo with `/Frontend` and `/Backend` folders
- **frontend branch**: Frontend app at repo root (for Vercel)
- **backend branch**: Backend app at repo root (for Render)

---

## Backend Deployment (Render)

### Prerequisites
1. MongoDB Atlas database (or other hosted MongoDB)
2. Gemini API key from Google AI Studio
3. Git repository: `git@github.com:rudraymehra/InterviewLytics.git`

### Render Setup
1. **Create New Web Service**
   - Connect your GitHub repository
   - **Branch**: `backend`
   - **Root Directory**: Leave empty (blank)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

2. **Environment Variables** (Add in Render Dashboard)
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/interviewlytics
   JWT_SECRET=generate-a-strong-random-secret-here
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=your-gemini-api-key
   ENABLE_AI_SCORING=true
   ENABLE_AI_INTERVIEW=true
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Persistent Disk** (Optional, for file uploads)
   - Add a disk at `/var/data/uploads`
   - Update `uploadMiddleware.ts` destination if needed

4. **Deploy**
   - Render will auto-deploy on push to `backend` branch
   - Monitor build logs for any errors

### Updating Backend Branch
```bash
# From main branch
cd "/path/to/InterviewLytics copy 2"
git checkout main
git pull origin main

# Make your changes in Backend/ folder, then:
git add Backend/
git commit -m "feat(backend): your changes"
git push origin main

# Update backend deployment branch
git subtree split --prefix=Backend -b backend-update
git checkout backend
git merge backend-update --allow-unrelated-histories -X theirs
git branch -D backend-update
git push origin backend
```

---

## Frontend Deployment (Vercel)

### Prerequisites
1. Backend API URL (from Render deployment)
2. Git repository: `git@github.com:rudraymehra/InterviewLytics.git`

### Vercel Setup
1. **Create New Project**
   - Import from GitHub: `rudraymehra/InterviewLytics`
   - **Branch**: `frontend`
   - **Root Directory**: Leave empty (blank) – the frontend app is at repo root on this branch
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

2. **Environment Variables** (Add in Vercel Dashboard)
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api
   NEXT_PUBLIC_ENABLE_INTERVIEW=true
   NEXT_PUBLIC_ENABLE_ANALYTICS=true
   ```

3. **Deploy**
   - Vercel will auto-deploy on push to `frontend` branch
   - Production URL will be available immediately

### Updating Frontend Branch
```bash
# From main branch
cd "/path/to/InterviewLytics copy 2"
git checkout main
git pull origin main

# Make your changes in Frontend/ folder, then:
git add Frontend/
git commit -m "feat(frontend): your changes"
git push origin main

# Update frontend deployment branch
git subtree split --prefix=Frontend -b frontend-update
git checkout frontend
git merge frontend-update --allow-unrelated-histories -X theirs
git branch -D frontend-update
git push origin frontend
```

---

## Environment Variables Reference

### Backend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | Random 64-char string |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` |

### Backend Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRES_IN` | JWT token expiry | `7d` |
| `ENABLE_AI_SCORING` | Toggle AI resume scoring | `true` |
| `ENABLE_AI_INTERVIEW` | Toggle AI interviews | `true` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Frontend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `https://api.example.com/api` |

### Frontend Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_INTERVIEW` | Show interview features | `true` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Show analytics | `true` |

---

## Troubleshooting

### Backend Issues
- **Build fails**: Check Node.js version (use `.nvmrc` = 18)
- **Database connection fails**: Verify `MONGO_URI` and whitelist Render IPs in MongoDB Atlas
- **JWT errors**: Ensure `JWT_SECRET` is set (no fallback in production)
- **AI features not working**: Verify `GEMINI_API_KEY` is correct

### Frontend Issues
- **API calls fail**: Check `NEXT_PUBLIC_API_BASE_URL` matches your Render backend URL
- **CORS errors**: Ensure backend has proper CORS configuration for your Vercel domain
- **Build fails**: Check for TypeScript errors, run `npm run build` locally first

### Common Errors
1. **"Cannot find module 'express'"**: Missing `@types/node` in devDependencies
2. **"Duplicate schema index"**: Remove manual index definitions (fixed)
3. **"JWT_SECRET not defined"**: Set environment variable in Render/Vercel
4. **File upload errors**: Check file size limits and `multer` configuration

---

## Feature Flags

Feature flags allow you to enable/disable features without code changes:

### Backend
- `ENABLE_AI_SCORING`: Gemini-powered resume analysis
- `ENABLE_AI_INTERVIEW`: AI interview question generation

### Frontend
- `NEXT_PUBLIC_ENABLE_INTERVIEW`: Show/hide interview pages
- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Show/hide analytics dashboards

Set to `false` to disable features temporarily.

---

## Security Checklist

- [ ] Generate strong `JWT_SECRET` (64+ random characters)
- [ ] Set MongoDB network access rules (whitelist Render IPs)
- [ ] Enable Helmet security headers (already configured)
- [ ] Configure rate limiting (already configured)
- [ ] Use HTTPS for all API calls
- [ ] Rotate API keys periodically
- [ ] Review uploaded files for malicious content
- [ ] Enable MongoDB authentication

---

## Monitoring & Logs

### Render
- View logs in Render dashboard under "Logs" tab
- Set up log drains for persistent logging
- Monitor metrics: CPU, memory, response time

### Vercel
- View deployment logs in Vercel dashboard
- Check function logs for serverless errors
- Monitor analytics and performance

---

## Rollback Procedure

### Backend
```bash
# Find last working commit
git log backend --oneline

# Reset to that commit
git checkout backend
git reset --hard <commit-hash>
git push origin backend --force
```

### Frontend
```bash
# Vercel supports instant rollback via dashboard
# Or via CLI:
vercel rollback <deployment-url>
```

---

## Next Steps

1. **Email Notifications**: Integrate SendGrid/Mailgun for application updates
2. **Google Cloud Speech-to-Text**: Add credentials for voice interview transcription
3. **Analytics Backend**: Connect recruiter analytics to real data endpoints
4. **File Storage**: Move uploads to S3/Cloudinary for production scale
5. **CI/CD**: Add GitHub Actions for automated testing before deploy

---

## Support

For issues or questions, contact the development team or create an issue on GitHub.

