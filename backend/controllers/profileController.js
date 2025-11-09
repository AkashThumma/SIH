import { getUserProfile, updateUsername, deductPoints } from '../models/userModel.js';

export const updateUserProfile = (req, res) => {
  const userId = req.user.id;
  const { username } = req.body;
  getUserProfile(userId, (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const cost = user.username ? 5 : 0; // Free for first time, 5 points for edits
    if (user.points < cost) return res.status(400).json({ success: false, message: 'Not enough points' });
    deductPoints(userId, cost, (err2) => {
      if (err2) return res.status(500).json({ success: false, message: 'Error deducting points' });
      updateUsername(userId, username, (err3) => {
        if (err3) return res.status(500).json({ success: false, message: 'Error updating username' });
        res.json({ success: true, message: 'Username updated', pointsDeducted: cost });
      });
    });
  });
};