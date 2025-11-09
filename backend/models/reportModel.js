import db from '../config/db.js';

export const createReport = (userId, imagePath, lat, lng, callback) => {
  const sql = 'INSERT INTO reports (user_id, image_path, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(sql, [userId, imagePath, lat, lng], callback);
};

export const getReportsByUserId = (userId, callback) => {
  const sql = 'SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC';
  db.query(sql, [userId], callback);
};

export const getAllReports = (callback) => {
  const sql = 'SELECT r.*, u.fullname, u.email FROM reports r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC';
  db.query(sql, [], callback);
};