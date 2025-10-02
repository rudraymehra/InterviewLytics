import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { getRecruiterReport, getCandidateFeedback } from '../controllers/reportController';

const router = express.Router();

// Recruiter report (detailed analysis for hiring decision)
router.get('/recruiter/:applicationId', authenticate, authorize('recruiter'), getRecruiterReport);

// Candidate feedback (constructive feedback for improvement)
router.get('/candidate/:applicationId', authenticate, getCandidateFeedback);

export default router;

