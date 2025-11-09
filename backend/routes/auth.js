import express from 'express';
import {
  sendOtp,
  verifyUserOtp,
  registerUser,
  loginUser,
  forgotPasswordOtp,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyUserOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password-otp', forgotPasswordOtp);
router.post('/reset-password', resetPassword);

export default router;