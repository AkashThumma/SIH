import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../config/db.js';
dotenv.config();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;
    const sql = 'SELECT id, fullname, email, role, points, badges AS badge, blocked_until FROM users WHERE id = ?';
    db.query(sql, [userId], (err, rows) => {
      if (err) {
        console.error('DB error in authenticateToken:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      if (!rows || rows.length === 0) return res.status(401).json({ success: false, message: 'User not found' });
      const user = rows[0];
      if (user.blocked_until && new Date(user.blocked_until) > new Date()) {
        return res.status(403).json({ success: false, message: 'User blocked until ' + user.blocked_until });
      }
      req.user = user;
      next();
    });
  } catch (err) {
    console.error('Token verify error:', err);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (req.user.role !== role) return res.status(403).json({ success: false, message: 'Permission denied' });
  next();
};