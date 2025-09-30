import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts, please try again later.'
  }
});

// Public routes
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;
