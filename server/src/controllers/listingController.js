import { validationResult } from "express-validator";
import pool from "../config/db.js";

// ── Helper: build full image URL ──────────────────────────────
const imgUrl = (req, filename) =>
  filename ? `${req.protocol}://${req.get("host")}/uploads/${filename}` : null;

// ── Helper: format a listing row from DB ──────────────────────
const formatListing = (row, images = []) => ({
  id:          row.id,
  userId:      row.user_id,
  categoryId:  row.category_id,
  category:    row.category_name,
  type:        row.listing_type,
  title:       row.title,
  description: row.description,
  price:       parseFloat(row.price),
  priceType:   row.price_type,
  condition:   row.condition_val,
  city:        row.city,
  barangay:    row.barangay,
  status:      row.status,
  viewCount:   row.view_count,
  createdAt:   row.created_at,
  seller: {
    id:          row.seller_id,
    name:        row.seller_name,
    avatarUrl:   row.seller_avatar,
    city:        row.seller_city,
    barangay:    row.seller_barangay,
    rating:      parseFloat(row.seller_rating || 0),
    reviewCount: parseInt(row.seller_review_count || 0),
  },
  images,
});

// ── Shared base query ─────────────────────────────────────────
const BASE_QUERY = `
  SELECT
    l.*,
    l.\`condition\`  AS condition_val,
    c.name           AS category_name,
    u.id             AS seller_id,
    u.name           AS seller_name,
    u.avatar_url     AS seller_avatar,
    u.city           AS seller_city,
    u.barangay       AS seller_barangay,
    COALESCE(AVG(r.rating), 0)      AS seller_rating,
    COUNT(DISTINCT r.id)            AS seller_review_count,
    (SELECT image_url FROM listing_images
     WHERE listing_id = l.id AND is_primary = 1 LIMIT 1) AS primary_image
  FROM listings l
  JOIN categories c ON l.category_id = c.id
  JOIN users u      ON l.user_id = u.id
  LEFT JOIN reviews r ON r.seller_id = u.id
`;

// ──────────────────────────────────────────────────────────────
// GET /api/listings
// ──────────────────────────────────────────────────────────────
export const getAllListings = async (req, res, next) => {
  try {
    const { q, category, type, minPrice, maxPrice, sort = "newest", page = 1, limit = 20 } = req.query;
    const params = [];
    const conditions = ["l.status = 'active'"];

    if (q) {
      conditions.push("(l.title LIKE ? OR l.description LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
      conditions.push("c.slug = ?");
      params.push(category);
    }
    if (type) {
      conditions.push("l.listing_type = ?");
      params.push(type);
    }
    if (minPrice) {
      conditions.push("l.price >= ?");
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      conditions.push("l.price <= ?");
      params.push(Number(maxPrice));
    }

    const WHERE = `WHERE ${conditions.join(" AND ")}`;
    const ORDER =
      sort === "price-asc"  ? "ORDER BY l.price ASC"  :
      sort === "price-desc" ? "ORDER BY l.price DESC" :
      sort === "rating"     ? "ORDER BY seller_rating DESC" :
                              "ORDER BY l.created_at DESC";

    const offset = (Number(page) - 1) * Number(limit);

    const [rows] = await pool.query(
      `${BASE_QUERY} ${WHERE} GROUP BY l.id ${ORDER} LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const listings = rows.map((row) => formatListing(row, row.primary_image
      ? [{ url: `${req.protocol}://${req.get("host")}/uploads/${row.primary_image}`, isPrimary: true }]
      : []
    ));

    // Total count for pagination
    const [countRows] = await pool.query(
      `SELECT COUNT(DISTINCT l.id) AS total FROM listings l JOIN categories c ON l.category_id = c.id ${WHERE}`,
      params
    );

    res.json({ listings, total: countRows[0].total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/listings/my  (protected)
// ──────────────────────────────────────────────────────────────
export const getMyListings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `${BASE_QUERY} WHERE l.user_id = ? GROUP BY l.id ORDER BY l.created_at DESC`,
      [req.userId]
    );

    const listings = rows.map((row) => formatListing(row, row.primary_image
      ? [{ url: `${req.protocol}://${req.get("host")}/uploads/${row.primary_image}`, isPrimary: true }]
      : []
    ));
    res.json({ listings });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/listings/:id
// ──────────────────────────────────────────────────────────────
export const getListingById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `${BASE_QUERY} WHERE l.id = ? GROUP BY l.id`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Listing not found." });

    // Increment view count
    await pool.query("UPDATE listings SET view_count = view_count + 1 WHERE id = ?", [req.params.id]);

    // Get all images
    const [imgRows] = await pool.query(
      "SELECT image_url, is_primary FROM listing_images WHERE listing_id = ? ORDER BY is_primary DESC, sort_order ASC",
      [req.params.id]
    );

    const images = imgRows.map((img) => ({
      url:       `${req.protocol}://${req.get("host")}/uploads/${img.image_url}`,
      isPrimary: !!img.is_primary,
    }));

    res.json({ listing: formatListing(rows[0], images) });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/listings  (protected)
// ──────────────────────────────────────────────────────────────
export const createListing = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { title, description, price, priceType, listingType, condition, categoryId, city, barangay } = req.body;

    const [result] = await pool.query(
      `INSERT INTO listings (user_id, category_id, title, description, price, price_type, listing_type, \`condition\`, city, barangay)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, categoryId, title, description, price, priceType || "fixed", listingType, condition || null, city || null, barangay || null]
    );

    const listingId = result.insertId;

    // Save uploaded images
    if (req.files && req.files.length > 0) {
      const imgValues = req.files.map((file, idx) => [listingId, file.filename, idx === 0 ? 1 : 0, idx]);
      await pool.query(
        "INSERT INTO listing_images (listing_id, image_url, is_primary, sort_order) VALUES ?",
        [imgValues]
      );
    }

    res.status(201).json({ message: "Listing created.", listingId });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// PUT /api/listings/:id  (protected, owner only)
// Updates text fields — does not touch images
// ──────────────────────────────────────────────────────────────
export const updateListing = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const [rows] = await pool.query("SELECT user_id FROM listings WHERE id = ? AND status != 'deleted'", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Listing not found." });
    if (rows[0].user_id !== req.userId) return res.status(403).json({ error: "Not your listing." });

    const { title, description, price, priceType, condition, categoryId, city, barangay } = req.body;

    await pool.query(
      `UPDATE listings SET title = ?, description = ?, price = ?, price_type = ?,
       \`condition\` = ?, category_id = ?, city = ?, barangay = ?
       WHERE id = ?`,
      [title, description, price, priceType || "fixed", condition || null, categoryId, city || null, barangay || null, req.params.id]
    );

    res.json({ message: "Listing updated." });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// DELETE /api/listings/:id  (protected, owner only)
// ──────────────────────────────────────────────────────────────
export const deleteListing = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT user_id FROM listings WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Listing not found." });
    if (rows[0].user_id !== req.userId) return res.status(403).json({ error: "Not your listing." });

    await pool.query("UPDATE listings SET status = 'deleted' WHERE id = ?", [req.params.id]);
    res.json({ message: "Listing deleted." });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// PUT /api/listings/:id/status  (protected, owner)
// ──────────────────────────────────────────────────────────────
export const updateListingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["active", "inactive", "sold"];
    if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status." });

    const [rows] = await pool.query("SELECT user_id FROM listings WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Listing not found." });
    if (rows[0].user_id !== req.userId) return res.status(403).json({ error: "Not your listing." });

    await pool.query("UPDATE listings SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Status updated." });
  } catch (err) {
    next(err);
  }
};
