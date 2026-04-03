import pool from "../config/db.js";

export const adminOnly = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT role FROM users WHERE id = ?", [req.userId]);
    if (!rows.length || rows[0].role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
  } catch (err) {
    next(err);
  }
};
