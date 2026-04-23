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

// ── GET /api/admin/analytics ──────────────────────────────────
export const getAnalytics = async (_req, res, next) => {
  try {
    const [[{ revenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total_price), 0) AS revenue FROM orders WHERE status = 'completed'"
    );

    const [ordersByStatus] = await pool.query(
      "SELECT status, COUNT(*) AS count FROM orders GROUP BY status"
    );

    const [ordersOverTime] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    const [usersOverTime] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM users
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    const [categoryDistribution] = await pool.query(
      `SELECT c.name, COUNT(l.id) AS count
       FROM listings l
       JOIN categories c ON c.id = l.category_id
       WHERE l.status != 'deleted'
       GROUP BY c.id, c.name
       ORDER BY count DESC
       LIMIT 8`
    );

    const [topSellers] = await pool.query(
      `SELECT u.name, COUNT(o.id) AS orders, COALESCE(SUM(o.total_price), 0) AS revenue
       FROM orders o
       JOIN users u ON u.id = o.seller_id
       WHERE o.status = 'completed'
       GROUP BY o.seller_id, u.name
       ORDER BY revenue DESC
       LIMIT 5`
    );

    res.json({ revenue, ordersByStatus, ordersOverTime, usersOverTime, categoryDistribution, topSellers });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/orders ─────────────────────────────────────
export const getAllOrdersAdmin = async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.quantity, o.total_price, o.status, o.notes, o.created_at,
              l.title AS listing_title,
              b.name  AS buyer_name,
              s.name  AS seller_name
       FROM orders o
       JOIN listings l ON l.id = o.listing_id
       JOIN users b    ON b.id = o.buyer_id
       JOIN users s    ON s.id = o.seller_id
       ORDER BY o.created_at DESC`
    );
    res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/user-activity ──────────────────────────────
export const getUserActivity = async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.is_verified, u.created_at,
              (SELECT COUNT(*) FROM listings  WHERE user_id  = u.id AND status != 'deleted') AS listing_count,
              (SELECT COUNT(*) FROM orders    WHERE buyer_id  = u.id) AS orders_placed,
              (SELECT COUNT(*) FROM orders    WHERE seller_id = u.id) AS orders_received,
              (SELECT COUNT(*) FROM messages  WHERE sender_id = u.id) AS messages_sent
       FROM users u
       ORDER BY u.created_at DESC`
    );
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
};
