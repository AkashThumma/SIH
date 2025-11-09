import db from '../config/db.js';
import { getUserProfile } from '../models/userModel.js';

export const getProfile = (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const userId = req.user.id;
  getUserProfile(userId, (err, user) => {
    if (err) {
      console.error('DB error getProfile:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  });
};