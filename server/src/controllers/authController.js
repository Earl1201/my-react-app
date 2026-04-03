import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import pool from "../config/db.js";

// ── Helper: sign a JWT ────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── Helper: safe user object (no password) ───────────────────
const safeUser = (row) => ({
  id:         row.id,
  name:       row.name,
  email:      row.email,
  avatarUrl:  row.avatar_url,
  city:       row.city,
  barangay:   row.barangay,
  role:       row.role,
  isVerified: !!row.is_verified,
  createdAt:  row.created_at,
});

// ──────────────────────────────────────────────────────────────
// POST /api/auth/register
// ──────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    // 1. Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password, city, barangay } = req.body;

    // 2. Check if email already exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Insert user
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, city, barangay)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        city ? city.trim() : null,
        barangay ? barangay.trim() : null,
      ]
    );

    // 5. Fetch the created user
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [result.insertId]
    );

    // 6. Sign JWT and respond
    const token = signToken(result.insertId);
    res.status(201).json({ token, user: safeUser(rows[0]) });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    // 1. Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 2. Find user by email
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const user = rows[0];

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    // 4. Sign JWT and respond
    const token = signToken(user.id);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/auth/me   (protected — requires JWT)
// ──────────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ user: safeUser(rows[0]) });
  } catch (err) {
    next(err);
  }
};
