import express from 'express';
import { uploadMiddleware, submitReportHandler, getMyReportsHandler, getCitizenLeaderboard } from '../controllers/citizenController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit-report', authenticateToken, uploadMiddleware, submitReportHandler);
router.get('/my-reports', authenticateToken, getMyReportsHandler);
router.get('/leaderboard', authenticateToken, getCitizenLeaderboard);

export default router;