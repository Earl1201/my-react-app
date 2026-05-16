import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
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
// POST /api/auth/google
// ──────────────────────────────────────────────────────────────
export const googleAuth = async (req, res, next) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ error: "Google access token is required." });
    }

    // Verify token and get user info from Google
    const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!googleRes.ok) {
      return res.status(401).json({ error: "Invalid or expired Google token." });
    }

    const { email, name, picture } = await googleRes.json();
    if (!email) {
      return res.status(400).json({ error: "Could not retrieve email from Google account." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );

    let user;
    if (existing.length > 0) {
      user = existing[0];
      // Update avatar if the user doesn't have one yet
      if (!user.avatar_url && picture) {
        await pool.query("UPDATE users SET avatar_url = ? WHERE id = ?", [picture, user.id]);
        user.avatar_url = picture;
      }
    } else {
      // Create new account for first-time Google sign-in
      const [result] = await pool.query(
        `INSERT INTO users (name, email, password, avatar_url, is_verified)
         VALUES (?, ?, ?, ?, 1)`,
        [name || normalizedEmail.split("@")[0], normalizedEmail, "", picture || null]
      );
      const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
      user = rows[0];
    }

    const token = signToken(user.id);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ──────────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const normalizedEmail = email.toLowerCase().trim();
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);

    // Always return 200 — never reveal whether an email is registered
    if (rows.length === 0) {
      return res.json({ message: "If this email is registered, a reset link has been sent." });
    }

    const userId = rows[0].id;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query("DELETE FROM password_reset_tokens WHERE user_id = ?", [userId]);
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"NeighborHub" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Reset your NeighborHub password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
          <h2 style="color:#1E3A5F;margin-bottom:8px;">Reset Your Password</h2>
          <p style="color:#374151;">Click the button below to reset your NeighborHub password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetLink}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0;">
            Reset Password
          </a>
          <p style="color:#6B7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
          <p style="color:#6B7280;font-size:12px;word-break:break-all;">Or copy this link: ${resetLink}</p>
        </div>
      `,
    });

    res.json({ message: "If this email is registered, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ──────────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const [rows] = await pool.query(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Token is invalid or has expired." });
    }

    const resetToken = rows[0];
    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, resetToken.user_id]);
    await pool.query("UPDATE password_reset_tokens SET used = 1 WHERE id = ?", [resetToken.id]);

    res.json({ message: "Password reset successfully." });
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
