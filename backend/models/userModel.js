import db from '../config/db.js';

export const createUser = (fullName, email, password, role, callback) => {
  const sql = 'INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(sql, [fullName, email, password, role], callback);
};

export const getUserByEmail = (email, callback) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], callback);
};

export const updatePassword = (email, newPassword, callback) => {
  const sql = 'UPDATE users SET password = ? WHERE email = ?';
  db.query(sql, [newPassword, email], callback);
};

export const addPoints = (userId, points, callback) => {
  const sql = 'UPDATE users SET points = points + ? WHERE id = ?';
  db.query(sql, [points, userId], callback);
};

export const getUserProfile = (userId, callback) => {
  const sql = 'SELECT id, fullname, email, role, points, badges AS badge, username FROM users WHERE id = ?';
  db.query(sql, [userId], (err, rows) => {
    if (err) return callback(err, null);
    const user = rows[0];
    if (user) {
      // Calculate badge based on points
      if (user.points >= 100) user.badge = 'Platinum';
      else if (user.points >= 50) user.badge = 'Gold';
      else if (user.points >= 20) user.badge = 'Silver';
      else if (user.points >= 10) user.badge = 'Bronze';
      else user.badge = 'None';
      // Update badge in DB if changed
      const updateSql = 'UPDATE users SET badges = ? WHERE id = ?';
      db.query(updateSql, [user.badge, userId], () => {});
    }
    callback(null, user);
  });
};

export const updateUsername = (userId, username, callback) => {
  const sql = 'UPDATE users SET username = ? WHERE id = ?';
  db.query(sql, [username, userId], callback);
};

export const deductPoints = (userId, points, callback) => {
  const sql = 'UPDATE users SET points = GREATEST(0, points - ?) WHERE id = ?';
  db.query(sql, [points, userId], callback);
};