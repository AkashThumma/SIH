import db from '../config/db.js';

export const getAllReports = (req, res) => {
  const sql = 'SELECT r.*, u.fullname, u.email FROM reports r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC';
  db.query(sql, [], (err, rows) => {
    if (err) {
      console.error('DB error getAllReports:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    const host = req.protocol + '://' + req.get('host');
    const reports = rows.map(r => ({ ...r, image_url: r.image_path ? host + r.image_path : null }));
    res.json({ success: true, reports });
  });
};

export const updateReportStatus = (req, res) => {
  const reportId = req.params.id;
  const { status } = req.body;
  const allowed = ['pending', 'completed', 'reported'];
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  const sql = 'UPDATE reports SET status = ? WHERE id = ?';
  db.query(sql, [status, reportId], (err) => {
    if (err) {
      console.error('DB error updateReportStatus:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, message: 'Status updated' });
  });
};

export const reportFalseAndBlockUser = (req, res) => {
  const reportId = req.params.id;
  const sqlFind = 'SELECT user_id FROM reports WHERE id = ?';
  db.query(sqlFind, [reportId], (err, rows) => {
    if (err) {
      console.error('DB error reportFalse:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Report not found' });
    const userId = rows[0].user_id;
    const sqlReport = 'UPDATE reports SET status = \'reported\' WHERE id = ?';
    db.query(sqlReport, [reportId], (e) => {
      if (e) console.error('Failed to mark report reported:', e);
      const sqlBlock = 'UPDATE users SET blocked_until = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE id = ?';
      db.query(sqlBlock, [userId], (err2) => {
        if (err2) {
          console.error('Failed to block user:', err2);
          return res.status(500).json({ success: false, message: 'Report flagged but failed to block user' });
        }
        res.json({ success: true, message: 'Report flagged and user blocked for 7 days' });
      });
    });
  });
};

export const getStats = (req, res) => {
  const sql = `
    SELECT
      SUM(status='completed') AS completed,
      SUM(status='pending') AS pending,
      SUM(status='reported') AS reported,
      COUNT(*) AS total
    FROM reports
  `;
  db.query(sql, [], (err, rows) => {
    if (err) {
      console.error('DB error getStats:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, stats: rows[0] || { completed: 0, pending: 0, reported: 0, total: 0 } });
  });
};

export const getLeaderboard = (req, res) => {
  const sql = 'SELECT id, fullname, email, points, badges AS badge FROM users ORDER BY points DESC LIMIT 100';
  db.query(sql, [], (err, rows) => {
    if (err) {
      console.error('DB error leaderboard:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, leaderboard: rows });
  });
};