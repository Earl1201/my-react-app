import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes    from "./src/routes/auth.routes.js";
import listingRoutes from "./src/routes/listing.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import orderRoutes   from "./src/routes/order.routes.js";
import adminRoutes   from "./src/routes/admin.routes.js";
import userRoutes         from "./src/routes/user.routes.js";
import savedRoutes        from "./src/routes/saved.routes.js";
import reviewRoutes       from "./src/routes/review.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Security ──────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ── Rate limiting ─────────────────────────────────────────────
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests. Please try again later." },
});

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve uploaded images as static files ─────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",     authLimiter, authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/saved",         savedRoutes);
app.use("/api/reviews",       reviewRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Error handler (must be last) ──────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
