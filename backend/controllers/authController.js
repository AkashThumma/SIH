import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail, updatePassword } from '../models/userModel.js';
import { saveOtp, verifyOtp, markOtpVerified } from '../models/otpModel.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = (req, res) => {
  const { email } = req.body;
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Waste Management Signup',
    html: `<h3>Your OTP is: <b>${otp}</b></h3><p>It expires in 5 minutes.</p>`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
      return res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
    saveOtp(email, otp, expiresAt, (error) => {
      if (error) return res.status(500).json({ success: false, message: 'DB Error saving OTP' });
      res.json({ success: true, message: 'OTP sent successfully' });
    });
  });
};

export const verifyUserOtp = (req, res) => {
  const { email, otp } = req.body;
  verifyOtp(email, otp, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (result.length === 0) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    markOtpVerified(email, () => res.json({ success: true, message: 'OTP verified successfully' }));
  });
};

export const registerUser = (req, res) => {
  const { fullname, email, role, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  getUserByEmail(email, (err, result) => {
    if (result.length > 0) return res.status(400).json({ success: false, message: 'User already exists' });
    createUser(fullname, email, hashed, role, (error) => {
      if (error) return res.status(500).json({ success: false, message: 'Error creating user' });
      res.json({ success: true, message: 'Signup successful' });
    });
  });
};

export const loginUser = (req, res) => {
  const { email, password } = req.body;
  getUserByEmail(email, (err, result) => {
    if (result.length === 0) return res.status(400).json({ success: false, message: 'User not found' });
    const user = result[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid password' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, message: 'Login successful', role: user.role, token });
  });
};

export const forgotPasswordOtp = (req, res) => {
  const { email } = req.body;
  getUserByEmail(email, (err, result) => {
    if (result.length === 0) return res.status(400).json({ success: false, message: 'No account found' });
    sendOtp(req, res);
  });
};

export const resetPassword = (req, res) => {
  const { email, otp, newPassword } = req.body;
  verifyOtp(email, otp, (err, result) => {
    if (result.length === 0) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    const hashed = bcrypt.hashSync(newPassword, 10);
    updatePassword(email, hashed, (error) => {
      if (error) return res.status(500).json({ success: false, message: 'Error updating password' });
      res.json({ success: true, message: 'Password reset successful' });
    });
  });
};