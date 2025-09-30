import { Router } from 'express';
import { 
  createJob, 
  getJobs, 
  getJobById, 
  updateJob, 
  deleteJob, 
  getMyJobs 
} from '../controllers/jobController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes (recruiter only)
router.post('/', authenticate, authorize('recruiter'), createJob);
router.get('/my/jobs', authenticate, authorize('recruiter'), getMyJobs);
router.put('/:id', authenticate, authorize('recruiter'), updateJob);
router.delete('/:id', authenticate, authorize('recruiter'), deleteJob);

export default router;
