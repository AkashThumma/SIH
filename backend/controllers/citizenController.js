import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReport, getReportsByUserId } from '../models/reportModel.js';
import { getUserByEmail, addPoints } from '../models/userModel.js';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});

const upload = multer({ storage: storage });

export const submitReportHandler = (req, res) => {
  const { email, latitude, longitude } = req.body;
  const file = req.file;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });
  if (!file) return res.status(400).json({ success: false, message: 'Image required' });
  getUserByEmail(email, (err, result) => {
    if (err) {
      console.error('DB error finding user:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!result || result.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    const user = result[0];
    const userId = user.id;
    const imagePath = '/uploads/' + file.filename;
    createReport(userId, imagePath, latitude || '', longitude || '', (err2, insertRes) => {
      if (err2) {
        console.error('DB error creating report:', err2);
        return res.status(500).json({ success: false, message: 'Failed to create report' });
      }
      addPoints(userId, 10, (err3) => {
        if (err3) console.error('Failed to add points:', err3);
        return res.json({ success: true, message: 'Report submitted', reportId: insertRes.insertId });
      });
    });
  });
};

export const uploadMiddleware = upload.single('image');

export const getMyReportsHandler = (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });
  getUserByEmail(email, (err, result) => {
    if (err) {
      console.error('DB find user error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!result || result.length === 0) return res.status(400).json({ success: false, message: 'User not found' });
    const userId = result[0].id;
    getReportsByUserId(userId, (err2, rows) => {
      if (err2) {
        console.error('DB get reports error:', err2);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      const host = (req.protocol + '://' + req.get('host'));
      const reports = (rows || []).map(r => ({
        ...r,
        image_url: r.image_path ? host + r.image_path : null
      }));
      res.json({ success: true, reports });
    });
  });
};

export const getCitizenLeaderboard = (req, res) => {
  const sql = 'SELECT id, username, fullname, email, points, badges AS badge FROM users WHERE role = "citizen" ORDER BY points DESC LIMIT 100';
  db.query(sql, [], (err, rows) => {
    if (err) {
      console.error('DB error getCitizenLeaderboard:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, leaderboard: rows });
  });
};