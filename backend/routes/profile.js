import express from 'express';
import { updateUserProfile } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/update', authenticateToken, updateUserProfile);

export default router;