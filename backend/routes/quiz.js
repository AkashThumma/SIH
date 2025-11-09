import express from 'express';
import { getQuiz, submitQuiz } from '../controllers/quizController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authenticateToken, getQuiz);
router.post('/:id/submit', authenticateToken, submitQuiz);

export default router;