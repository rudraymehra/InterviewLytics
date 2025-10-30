# Vercel Deployment Guide for InterviewLytics

## 🔐 Environment Variables for Vercel

When deploying to Vercel, you need to set the following environment variables in your Vercel project settings:

### Required Environment Variables

Copy and paste these into Vercel's Environment Variables section:

#### 1. JWT_SECRET
```
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random-and-secure-min-32-chars
```

**Important:** Replace the value with a strong, random string. You can generate one using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. NEXT_PUBLIC_API_BASE_URL (Optional)
```
NEXT_PUBLIC_API_BASE_URL=/api
```

This tells the frontend to use the internal Next.js API routes. You can leave this as `/api` or omit it entirely (it defaults to `/api`).

---

## 📋 Step-by-Step Vercel Deployment

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Add password validation and fix authentication"
git push origin frontend
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New Project"
4. Import your repository: `InterviewLytics copy 2`

### 3. Configure Environment Variables
In the Vercel project configuration, add these environment variables:

| Name | Value | Notes |
|------|-------|-------|
| `JWT_SECRET` | Generate using crypto | **CRITICAL - Must be secure** |
| `NEXT_PUBLIC_API_BASE_URL` | `/api` | Optional, defaults to `/api` |

**To generate a secure JWT_SECRET:**
```bash
# Run this in your terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET` value.

### 4. Deploy
1. Select the `frontend` branch
2. Click "Deploy"
3. Wait for the deployment to complete

---

## 🧪 Test Accounts

After deployment, you can test with these accounts:

### Candidate Account
- **Email:** `test@example.com`
- **Password:** `Test123`

### Recruiter Account
- **Email:** `recruiter@example.com`
- **Password:** `Recruit123`

---

## 🔒 Password Requirements (NEW)

The authentication now enforces strong password requirements:

✅ **Minimum 8 characters**
✅ **At least one uppercase letter (A-Z)**
✅ **At least one lowercase letter (a-z)**
✅ **At least one number (0-9)**

Examples of valid passwords:
- `Test123`
- `MyPassword1`
- `SecurePass99`

Examples of invalid passwords:
- `test123` (no uppercase)
- `TEST123` (no lowercase)
- `TestPass` (no number)
- `Test12` (too short)

---

## 🐛 Fixed Issues

### ✅ Authentication Validation
- Added comprehensive password validation on both frontend and backend
- Backend now properly validates password strength before creating accounts
- Login only accepts valid credentials (no random passwords)
- Proper error messages for validation failures

### ✅ Security Improvements
- Password must meet strength requirements
- Email format validation
- Role-based access control enforced
- JWT tokens properly verified

---

## 📝 Environment Variables Reference

### Complete `.env.local` Example (for local development)
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=/api

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_INTERVIEW=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Auth (Next API) - CHANGE THIS!
JWT_SECRET=your-generated-secret-here-use-crypto-randomBytes-32-hex
```

### For Vercel Deployment
You only need to set:
1. `JWT_SECRET` - **REQUIRED** - Generate a secure random string
2. `NEXT_PUBLIC_API_BASE_URL` - **OPTIONAL** - Defaults to `/api`

---

## 🚀 Quick Copy-Paste for Vercel

### Environment Variable: JWT_SECRET

**Name:**
```
JWT_SECRET
```

**Value:** (Generate one using the command below)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output (don't use this exact value):
```
a7f3b9c2d8e1f4a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
```

### Environment Variable: NEXT_PUBLIC_API_BASE_URL (Optional)

**Name:**
```
NEXT_PUBLIC_API_BASE_URL
```

**Value:**
```
/api
```

---

## 🔧 Troubleshooting

### Issue: "Invalid email or password" with correct credentials
**Solution:** Make sure the password meets the new requirements (8+ chars, uppercase, lowercase, number)

### Issue: JWT_SECRET not set
**Error:** You'll see authentication errors
**Solution:** Add `JWT_SECRET` to Vercel environment variables and redeploy

### Issue: Can't create account
**Solution:** Check that your password meets all requirements:
- At least 8 characters
- Contains uppercase letter
- Contains lowercase letter
- Contains number

---

## 📞 Support

If you encounter any issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Ensure your password meets the new requirements
4. Test with the provided test accounts first

---

## 🎉 You're All Set!

Your InterviewLytics application is now ready for deployment with secure authentication and proper password validation!

