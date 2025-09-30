# InterviewLytics Backend API

A robust Node.js + Express + TypeScript backend API for the InterviewLytics AI-powered hiring platform.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Job Management** - CRUD operations for job postings
- **Application System** - Apply to jobs with resume upload
- **File Upload** - Resume handling with validation
- **Database** - MongoDB with Mongoose ODM
- **TypeScript** - Full type safety and better development experience
- **API Documentation** - RESTful API design

## 📁 Project Structure

```
Backend/
├── src/
│   ├── models/          # Mongoose schemas (User, Job, Application)
│   ├── routes/          # API routes (auth, jobs, applications)
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, upload, error handling
│   ├── config/          # Database configuration
│   ├── utils/           # Helper functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Validation**: Built-in validation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb://localhost:27017/interviewlytics

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # File Upload
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5242880

   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod

   # Or use MongoDB Atlas (cloud)
   # Update MONGO_URI in .env
   ```

4. **Run the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get job by ID (public)
- `POST /api/jobs` - Create job (recruiter only)
- `PUT /api/jobs/:id` - Update job (recruiter only)
- `DELETE /api/jobs/:id` - Delete job (recruiter only)
- `GET /api/jobs/my/jobs` - Get my jobs (recruiter only)

### Applications
- `POST /api/applications/jobs/:jobId/apply` - Apply to job (candidate only)
- `GET /api/applications/my/applications` - Get my applications (candidate only)
- `GET /api/applications/jobs/:jobId/applications` - Get job applications (recruiter only)
- `PUT /api/applications/:id/status` - Update application status (recruiter only)
- `GET /api/applications/:id` - Get application by ID

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Data Models

### User
- `name` - User's full name
- `email` - Email address (unique)
- `passwordHash` - Hashed password
- `role` - 'candidate' or 'recruiter'
- `company` - Company name (recruiters only)
- `phone` - Phone number
- `avatar` - Profile picture URL
- `isActive` - Account status

### Job
- `title` - Job title
- `description` - Job description
- `requirements` - Array of requirements
- `location` - Job location
- `type` - Job type (full-time, part-time, etc.)
- `salary` - Salary range
- `status` - Job status (active, paused, closed)
- `createdBy` - Reference to recruiter
- `applicantsCount` - Number of applicants

### Application
- `jobId` - Reference to job
- `candidateId` - Reference to candidate
- `resumeUrl` - Path to uploaded resume
- `coverLetter` - Cover letter text
- `status` - Application status
- `score` - AI-generated score
- `skills` - Extracted skills
- `experience` - Experience level
- `education` - Education requirements

## 🚀 Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### File Upload
Resume files are stored in the `./uploads` directory. Supported formats:
- PDF (.pdf)
- Microsoft Word (.doc, .docx)

Maximum file size: 5MB

## 🔧 Configuration

All configuration is done through environment variables. See the `.env` example above.

## 📈 Next Steps

This completes Phase 1 of the backend development. Next phases will include:

- **Phase 2**: AI Integration (resume parsing, scoring)
- **Phase 3**: Advanced Features (email notifications, real-time updates)
- **Phase 4**: Production Deployment (Docker, CI/CD)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
