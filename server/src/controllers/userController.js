import pool from "../config/db.js";

// ── Helper: safe user object ─────────────────────────────────
const safeUser = (row) => ({
  id:         row.id,
  name:       row.name,
  email:      row.email,
  avatarUrl:  row.avatar_url,
  bio:        row.bio ?? null,
  city:       row.city,
  barangay:   row.barangay,
  role:       row.role,
  isVerified: !!row.is_verified,
  createdAt:  row.created_at,
});

// ──────────────────────────────────────────────────────────────
// GET /api/users/:id  (public)
// Returns user profile + their active listings + reviews received
// ──────────────────────────────────────────────────────────────
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch user
    const [userRows] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    // 2. Fetch their active listings
    const [listings] = await pool.query(
      `SELECT l.id, l.title, l.price, l.price_type, l.status,
              l.created_at, c.name AS category,
              (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order LIMIT 1) AS image
       FROM listings l
       LEFT JOIN categories c ON l.category_id = c.id
       WHERE l.user_id = ? AND l.status = 'active'
       ORDER BY l.created_at DESC`,
      [id]
    );

    // 3. Fetch reviews received by this user
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.id AS reviewer_id, u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.seller_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    // 4. Avg rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      user:     { ...safeUser(userRows[0]), avgRating, reviewCount: reviews.length, listingCount: listings.length },
      listings,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// PUT /api/users/me  (protected)
// Update own profile: name, city, barangay, bio
// ──────────────────────────────────────────────────────────────
export const updateMe = async (req, res, next) => {
  try {
    const { name, city, barangay, bio } = req.body;

    if (!name || !name.trim()) {
      return res.status(422).json({ error: "Name is required." });
    }

    await pool.query(
      `UPDATE users SET name = ?, city = ?, barangay = ?, bio = ? WHERE id = ?`,
      [
        name.trim(),
        city ? city.trim() : null,
        barangay ? barangay.trim() : null,
        bio ? bio.trim() : null,
        req.userId,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.userId]);
    const u = rows[0];

    res.json({
      user: {
        ...safeUser(u),
        avgRating: 0,   // client already has this from its own state
        reviewCount: 0,
        listingCount: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
