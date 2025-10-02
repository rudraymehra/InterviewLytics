import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { startSession, getNextQuestion, submitAnswer, uploadAudio } from '../controllers/interviewController';
import multer from 'multer';

const router = Router();

// Candidate starts and participates in interview
router.post('/start', authenticate, authorize('candidate'), startSession);
router.get('/:id/next', authenticate, authorize('candidate'), getNextQuestion);
router.post('/:id/answer', authenticate, authorize('candidate'), submitAnswer);

// Placeholder: accepts audio and returns a dummy transcript; swap in Google STT later
const audioUpload = multer({ limits: { fileSize: 15 * 1024 * 1024 } });
router.post('/:id/audio', authenticate, authorize('candidate'), audioUpload.single('audio'), uploadAudio);

export default router;


