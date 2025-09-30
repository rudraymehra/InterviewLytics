# InterviewLytics Frontend

A complete, fully functional frontend for the InterviewLytics AI-powered hiring platform, built according to detailed specifications with Next.js, TypeScript, Tailwind CSS, and Chart.js.

## ✨ Features

### 🏠 **Landing Page**
- Modern hero section with animated elements
- Features showcase with AI-powered capabilities
- How it works process explanation
- User testimonials and success stories
- Pricing plans (Free, Pro, Enterprise)
- Responsive design for all devices

### 🔐 **Authentication System**
- **Separate login pages** for candidates and recruiters
- **Dedicated signup forms** with role selection
- **Form validation** and error handling
- **Password visibility toggle**
- **Social login options** (Google, Twitter)
- **Secure authentication context**

### 👔 **Recruiter Dashboard**
- **Dashboard** with key metrics and analytics
- **Jobs Management** - Create, edit, delete job postings
- **Applicants Management** - Review and manage candidates
- **Analytics** - Charts and insights with Chart.js
- **Profile Settings** - Account management

### 👤 **Candidate Dashboard**
- **Dashboard** with application tracking
- **Applications** - View all job applications
- **AI Interview** - Chat-style interview interface
- **Feedback** - Detailed performance analysis with radar charts
- **Profile** - Resume upload and account settings

### 📊 **Analytics & Visualizations**
- **Bar charts** for application trends
- **Radar charts** for skills assessment
- **Real-time metrics** and KPIs
- **Interactive dashboards**

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **State Management**: Zustand + React Context

## 📁 Project Structure

```
Frontend/
├── app/
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── about/page.tsx           # About page
│   ├── contact/page.tsx         # Contact page
│   ├── pricing/page.tsx         # Pricing page
│   ├── features/page.tsx        # Features page
│   ├── login-candidate/page.tsx # Candidate login
│   ├── login-recruiter/page.tsx # Recruiter login
│   ├── signup-candidate/page.tsx # Candidate signup
│   ├── signup-recruiter/page.tsx # Recruiter signup
│   ├── recruiter/
│   │   ├── layout.tsx           # Recruiter layout with sidebar
│   │   ├── dashboard/page.tsx   # Recruiter dashboard
│   │   ├── jobs/page.tsx        # Jobs management
│   │   ├── applicants/page.tsx  # Applicants management
│   │   ├── analytics/page.tsx   # Analytics dashboard
│   │   └── profile/page.tsx     # Profile settings
│   └── candidate/
│       ├── layout.tsx           # Candidate layout with sidebar
│       ├── dashboard/page.tsx   # Candidate dashboard
│       ├── applications/page.tsx # Applications tracking
│       ├── interview/page.tsx   # AI interview interface
│       ├── feedback/page.tsx    # Performance feedback
│       └── profile/page.tsx     # Profile settings
├── components/
│   ├── Navbar.tsx               # Main navigation
│   ├── Sidebar.tsx              # Dashboard sidebar
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── FormInput.tsx
│   ├── charts/                  # Chart components
│   │   ├── BarChart.tsx
│   │   └── RadarChart.tsx
│   └── [other components]
├── context/
│   └── AuthContext.tsx          # Authentication context
├── utils/
│   └── apiClient.ts             # Mock API client
└── lib/
    └── utils.ts                 # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Navigate to the frontend directory:**
```bash
cd Frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Environment:**
Create a `.env.local` in `Frontend/`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=InterviewLytics
```

5. **Open your browser:**
Visit `http://localhost:3000`

## 🎯 Key Features Implemented

### ✅ **Complete Page Structure**
- Landing page with all sections
- Separate auth pages for candidates/recruiters
- Role-based dashboards with sidebars
- All specified pages and functionality

### ✅ **Authentication System**
- Role-based access control
- Protected routes for dashboards
- Login/signup forms with validation
- User context and state management

### ✅ **Dashboard Functionality**
- **Recruiter**: Jobs, applicants, analytics, profile
- **Candidate**: Applications, interview, feedback, profile
- Real-time data with mock API
- Interactive charts and visualizations

### ✅ **UI/UX Components**
- Reusable component library
- Responsive design
- Modern animations
- Toast notifications
- Modal dialogs
- Form components

### ✅ **Charts & Analytics**
- Bar charts for trends
- Radar charts for skills
- Interactive dashboards
- Real-time metrics

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📱 Responsive Design

- **Mobile-first** approach
- **Tablet and desktop** optimized
- **Touch-friendly** interfaces
- **Accessible** navigation

## 🎨 Customization

### Colors
Update `tailwind.config.js`:
```javascript
colors: {
  primary: { /* Your primary colors */ },
  secondary: { /* Your secondary colors */ }
}
```

### Components
All components are modular and easily customizable in the `components/` directory.

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Other Platforms
```bash
npm run build
npm run start
```

## 📊 Mock Data

The application includes comprehensive mock data for:
- Job postings and applications
- User profiles and authentication
- Interview messages and feedback
- Analytics and metrics

## 🔐 Security Features

- Role-based access control
- Protected routes
- Form validation
- Secure authentication flow

## 📈 Performance

- **Optimized** for speed and SEO
- **Lazy loading** for components
- **Efficient** state management
- **Minimal** bundle size

# Frontend deployment

- Build: docker build -t interviewlytics-frontend .
- Run: docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=... interviewlytics-frontend
