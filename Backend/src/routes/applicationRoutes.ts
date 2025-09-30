import { Router } from 'express';
import { 
  applyToJob, 
  getMyApplications, 
  getApplicationById, 
  getJobApplications, 
  updateApplicationStatus 
} from '../controllers/applicationController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { uploadResume, handleUploadError } from '../middleware/uploadMiddleware';

const router = Router();

// Protected routes for candidates
router.post('/jobs/:jobId/apply', authenticate, authorize('candidate'), uploadResume, handleUploadError, applyToJob);
router.get('/my/applications', authenticate, authorize('candidate'), getMyApplications);

// Protected routes for recruiters
router.get('/jobs/:jobId/applications', authenticate, authorize('recruiter'), getJobApplications);
router.put('/:id/status', authenticate, authorize('recruiter'), updateApplicationStatus);

// General protected route
router.get('/:id', authenticate, getApplicationById);

export default router;
