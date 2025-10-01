import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { startSession, getNextQuestion, submitAnswer } from '../controllers/interviewController';

const router = Router();

// Candidate starts and participates in interview
router.post('/start', authenticate, authorize('candidate'), startSession);
router.get('/:id/next', authenticate, authorize('candidate'), getNextQuestion);
router.post('/:id/answer', authenticate, authorize('candidate'), submitAnswer);

export default router;


