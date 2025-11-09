import db from '../config/db.js';

export const saveOtp = (email, otp, expiresAt, callback) => {
  const sql = 'INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)';
  db.query(sql, [email, otp, expiresAt], callback);
};

export const verifyOtp = (email, otp, callback) => {
  const sql = 'SELECT * FROM otps WHERE email = ? AND otp_code = ? AND expires_at > NOW()';
  db.query(sql, [email, otp], callback);
};

export const markOtpVerified = (email, callback) => {
  const sql = 'UPDATE otps SET verified = TRUE WHERE email = ?';
  db.query(sql, [email], callback);
};