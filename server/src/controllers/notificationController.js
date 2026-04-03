import pool from "../config/db.js";

// ──────────────────────────────────────────────────────────────
// GET /api/notifications  (last 30, newest first)
// ──────────────────────────────────────────────────────────────
export const getNotifications = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, type, title, body, link, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [req.userId]
    );
    const unreadCount = rows.filter((n) => !n.is_read).length;
    res.json({ notifications: rows, unreadCount });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// PUT /api/notifications/read  — mark all as read
// ──────────────────────────────────────────────────────────────
export const markAllRead = async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
      [req.userId]
    );
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
};
