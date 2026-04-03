import pool from "../config/db.js";

// ──────────────────────────────────────────────────────────────
// POST /api/saved/:listingId  — save a listing
// DELETE /api/saved/:listingId — unsave a listing
// ──────────────────────────────────────────────────────────────
export const toggleSave = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    // Check if already saved
    const [existing] = await pool.query(
      "SELECT 1 FROM saved_listings WHERE user_id = ? AND listing_id = ?",
      [req.userId, listingId]
    );

    if (existing.length > 0) {
      // Already saved → unsave
      await pool.query(
        "DELETE FROM saved_listings WHERE user_id = ? AND listing_id = ?",
        [req.userId, listingId]
      );
      return res.json({ saved: false });
    } else {
      // Not saved → save
      await pool.query(
        "INSERT INTO saved_listings (user_id, listing_id) VALUES (?, ?)",
        [req.userId, listingId]
      );
      return res.json({ saved: true });
    }
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/saved/:listingId  — check if listing is saved
// ──────────────────────────────────────────────────────────────
export const checkSaved = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT 1 FROM saved_listings WHERE user_id = ? AND listing_id = ?",
      [req.userId, req.params.listingId]
    );
    res.json({ saved: rows.length > 0 });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/saved  — all saved listings for the logged-in user
// ──────────────────────────────────────────────────────────────
export const getSaved = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.id, l.title, l.price, l.price_type, l.status, l.created_at,
              c.name AS category,
              (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order LIMIT 1) AS image,
              u.name AS seller_name
       FROM saved_listings sl
       JOIN listings l    ON l.id = sl.listing_id
       JOIN categories c  ON c.id = l.category_id
       JOIN users u       ON u.id = l.user_id
       WHERE sl.user_id = ? AND l.status != 'deleted'
       ORDER BY sl.saved_at DESC`,
      [req.userId]
    );
    res.json({ listings: rows });
  } catch (err) {
    next(err);
  }
};
