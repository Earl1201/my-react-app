import pool from "../config/db.js";

// ──────────────────────────────────────────────────────────────
// POST /api/reviews
// Buyer leaves a review for a seller after a completed order
// ──────────────────────────────────────────────────────────────
export const createReview = async (req, res, next) => {
  try {
    const { sellerId, listingId, rating, comment } = req.body;

    if (!sellerId || !rating) {
      return res.status(422).json({ error: "sellerId and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(422).json({ error: "Rating must be between 1 and 5." });
    }
    if (sellerId === req.userId) {
      return res.status(400).json({ error: "You cannot review yourself." });
    }

    // Verify the reviewer has a completed order with this seller
    const [orders] = await pool.query(
      `SELECT id FROM orders
       WHERE buyer_id = ? AND seller_id = ? AND status = 'completed'
       LIMIT 1`,
      [req.userId, sellerId]
    );
    if (!orders.length) {
      return res.status(403).json({ error: "You can only review sellers after a completed order." });
    }

    // Check for duplicate review
    const [existing] = await pool.query(
      "SELECT id FROM reviews WHERE reviewer_id = ? AND seller_id = ? AND listing_id <=> ?",
      [req.userId, sellerId, listingId || null]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "You have already reviewed this seller for this listing." });
    }

    await pool.query(
      `INSERT INTO reviews (reviewer_id, seller_id, listing_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [req.userId, sellerId, listingId || null, rating, comment || null]
    );

    // Notify the seller
    const [reviewer] = await pool.query("SELECT name FROM users WHERE id = ?", [req.userId]);
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES (?, 'new_review', ?, ?, ?)`,
      [
        sellerId,
        "New review received",
        `${reviewer[0]?.name} left you a ${rating}-star review.`,
        `/profile/${sellerId}`,
      ]
    );

    res.status(201).json({ message: "Review submitted." });
  } catch (err) {
    next(err);
  }
};
