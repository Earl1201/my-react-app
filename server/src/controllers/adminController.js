import pool from "../config/db.js";

// ── GET /api/admin/stats ──────────────────────────────────────
export const getStats = async (_req, res, next) => {
  try {
    const [[users]]    = await pool.query("SELECT COUNT(*) AS total FROM users");
    const [[listings]] = await pool.query("SELECT COUNT(*) AS total FROM listings WHERE status != 'deleted'");
    const [[orders]]   = await pool.query("SELECT COUNT(*) AS total FROM orders");
    const [[messages]] = await pool.query("SELECT COUNT(*) AS total FROM messages");

    res.json({
      totalUsers:    users.total,
      totalListings: listings.total,
      totalOrders:   orders.total,
      totalMessages: messages.total,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/users ──────────────────────────────────────
export const getAllUsers = async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, city, role, is_verified, created_at,
              (SELECT COUNT(*) FROM listings WHERE user_id = users.id AND status != 'deleted') AS listing_count
       FROM users ORDER BY created_at DESC`
    );
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/listings ───────────────────────────────────
export const getAllListingsAdmin = async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.id, l.title, l.listing_type, l.price, l.status, l.created_at,
              u.name AS seller_name, c.name AS category
       FROM listings l
       JOIN users u      ON u.id = l.user_id
       JOIN categories c ON c.id = l.category_id
       WHERE l.status != 'deleted'
       ORDER BY l.created_at DESC`
    );
    res.json({ listings: rows });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/admin/users/:id  (update role or verified) ───────
export const updateUser = async (req, res, next) => {
  try {
    const { role, isVerified } = req.body;
    const updates = [];
    const params  = [];

    if (role) { updates.push("role = ?"); params.push(role); }
    if (isVerified !== undefined) { updates.push("is_verified = ?"); params.push(isVerified ? 1 : 0); }
    if (!updates.length) return res.status(400).json({ error: "Nothing to update." });

    params.push(req.params.id);
    await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
    res.json({ message: "User updated." });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/admin/listings/:id ───────────────────────────
export const adminDeleteListing = async (req, res, next) => {
  try {
    await pool.query("UPDATE listings SET status = 'deleted' WHERE id = ?", [req.params.id]);
    res.json({ message: "Listing removed." });
  } catch (err) {
    next(err);
  }
};
