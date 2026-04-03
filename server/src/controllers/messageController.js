import pool from "../config/db.js";

// ──────────────────────────────────────────────────────────────
// GET /api/messages/conversations  (my conversations)
// ──────────────────────────────────────────────────────────────
export const getConversations = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         c.id,
         c.listing_id,
         l.title        AS listing_title,
         -- the other participant
         u.id           AS other_user_id,
         u.name         AS other_user_name,
         u.avatar_url   AS other_user_avatar,
         -- last message
         (SELECT content    FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
         (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
         (SELECT COUNT(*)   FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) AS unread_count
       FROM conversations c
       JOIN conversation_participants cp  ON cp.conversation_id = c.id AND cp.user_id = ?
       JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id != ?
       JOIN users u ON u.id = cp2.user_id
       LEFT JOIN listings l ON l.id = c.listing_id
       ORDER BY last_message_at DESC`,
      [req.userId, req.userId, req.userId]
    );
    res.json({ conversations: rows });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/messages/conversations  (start or get existing)
// ──────────────────────────────────────────────────────────────
export const startConversation = async (req, res, next) => {
  try {
    const { listingId, recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ error: "recipientId is required." });
    if (Number(recipientId) === req.userId) return res.status(400).json({ error: "Cannot message yourself." });

    // Check if conversation already exists between these two users for this listing
    const [existing] = await pool.query(
      `SELECT c.id FROM conversations c
       JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = ?
       JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = ?
       WHERE (c.listing_id = ? OR c.listing_id IS NULL)
       LIMIT 1`,
      [req.userId, recipientId, listingId || null]
    );

    if (existing.length > 0) {
      return res.json({ conversationId: existing[0].id });
    }

    // Create new conversation
    const [conv] = await pool.query(
      "INSERT INTO conversations (listing_id) VALUES (?)",
      [listingId || null]
    );
    const convId = conv.insertId;

    await pool.query(
      "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)",
      [convId, req.userId, convId, recipientId]
    );

    res.status(201).json({ conversationId: convId });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/messages/conversations/:id  (messages in conversation)
// ──────────────────────────────────────────────────────────────
export const getMessages = async (req, res, next) => {
  try {
    // Verify user is a participant
    const [check] = await pool.query(
      "SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );
    if (!check.length) return res.status(403).json({ error: "Not part of this conversation." });

    const [messages] = await pool.query(
      `SELECT m.id, m.content, m.is_read, m.created_at,
              u.id AS sender_id, u.name AS sender_name, u.avatar_url AS sender_avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [req.params.id]
    );

    // Mark unread messages as read
    await pool.query(
      "UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?",
      [req.params.id, req.userId]
    );

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/messages/conversations/:id  (send a message)
// ──────────────────────────────────────────────────────────────
export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Message content is required." });

    const [check] = await pool.query(
      "SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );
    if (!check.length) return res.status(403).json({ error: "Not part of this conversation." });

    const [result] = await pool.query(
      "INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)",
      [req.params.id, req.userId, content.trim()]
    );

    const [rows] = await pool.query(
      `SELECT m.id, m.content, m.is_read, m.created_at,
              u.id AS sender_id, u.name AS sender_name, u.avatar_url AS sender_avatar
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ message: rows[0] });
  } catch (err) {
    next(err);
  }
};
