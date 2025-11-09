import express from 'express';
import {
  getAllReports,
  updateReportStatus,
  reportFalseAndBlockUser,
  getStats,
  getLeaderboard
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, requireRole('admin'));

router.get('/reports', getAllReports);
router.patch('/reports/:id/status', updateReportStatus);
router.post('/reports/:id/report-false', reportFalseAndBlockUser);
router.get('/stats', getStats);
router.get('/leaderboard', getLeaderboard);

export default router;