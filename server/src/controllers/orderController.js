import pool from "../config/db.js";

const ORDER_STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled", "refunded"];

// ──────────────────────────────────────────────────────────────
// POST /api/orders  (buyer creates order)
// ──────────────────────────────────────────────────────────────
export const createOrder = async (req, res, next) => {
  try {
    const { listingId, quantity = 1, notes } = req.body;
    if (!listingId) return res.status(400).json({ error: "listingId is required." });

    const [listings] = await pool.query(
      "SELECT id, user_id, price, status FROM listings WHERE id = ?",
      [listingId]
    );
    if (!listings.length) return res.status(404).json({ error: "Listing not found." });

    const listing = listings[0];
    if (listing.status !== "active") return res.status(400).json({ error: "This listing is no longer available." });
    if (listing.user_id === req.userId) return res.status(400).json({ error: "You cannot order your own listing." });

    const totalPrice = parseFloat(listing.price) * Number(quantity);

    const [result] = await pool.query(
      `INSERT INTO orders (buyer_id, seller_id, listing_id, quantity, total_price, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, listing.user_id, listingId, quantity, totalPrice, notes || null]
    );

    // Notify the seller
    const [buyer] = await pool.query("SELECT name FROM users WHERE id = ?", [req.userId]);
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, 'new_order', ?, ?, ?)`,
      [listing.user_id, "New order received", `${buyer[0]?.name} placed an order.`, `/orders`]
    );

    res.status(201).json({ message: "Order placed.", orderId: result.insertId });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/orders  (my orders as buyer)
// ──────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.*,
              l.title AS listing_title,
              (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_primary = 1 LIMIT 1) AS listing_image,
              u.name AS seller_name, u.avatar_url AS seller_avatar
       FROM orders o
       JOIN listings l ON l.id = o.listing_id
       JOIN users u    ON u.id = o.seller_id
       WHERE o.buyer_id = ?
       ORDER BY o.created_at DESC`,
      [req.userId]
    );
    res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/orders/selling  (my orders as seller)
// ──────────────────────────────────────────────────────────────
export const getSellingOrders = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.*,
              l.title AS listing_title,
              (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_primary = 1 LIMIT 1) AS listing_image,
              u.name AS buyer_name, u.avatar_url AS buyer_avatar
       FROM orders o
       JOIN listings l ON l.id = o.listing_id
       JOIN users u    ON u.id = o.buyer_id
       WHERE o.seller_id = ?
       ORDER BY o.created_at DESC`,
      [req.userId]
    );
    res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// PUT /api/orders/:id/status  (seller updates status)
// ──────────────────────────────────────────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status." });

    const [rows] = await pool.query("SELECT seller_id, buyer_id FROM orders WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Order not found." });

    const order = rows[0];
    // Seller can confirm/progress/complete; buyer can cancel
    const isSeller = order.seller_id === req.userId;
    const isBuyer  = order.buyer_id  === req.userId;

    if (!isSeller && !isBuyer) return res.status(403).json({ error: "Not your order." });
    if (status === "cancelled" && !isBuyer) return res.status(403).json({ error: "Only buyer can cancel." });
    if (["confirmed","in_progress","completed"].includes(status) && !isSeller) {
      return res.status(403).json({ error: "Only seller can update to this status." });
    }

    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);

    // Notify the other party
    const notifyUserId = isSeller ? order.buyer_id : order.seller_id;
    const statusLabels = { confirmed: "confirmed", in_progress: "in progress", completed: "completed", cancelled: "cancelled", refunded: "refunded" };
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, 'order_update', ?, ?, ?)`,
      [notifyUserId, "Order update", `Your order has been ${statusLabels[status] || status}.`, `/orders`]
    );

    res.json({ message: "Order status updated." });
  } catch (err) {
    next(err);
  }
};
