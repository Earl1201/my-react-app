import { Router } from "express";
import { body } from "express-validator";
import { register, login, googleAuth, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// ── Validation rules ──────────────────────────────────────────
const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Full name is required.")
    .isLength({ max: 100 }).withMessage("Name must be under 100 characters."),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  body("city")
    .trim()
    .notEmpty().withMessage("City is required."),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required."),
];

// ── Routes ────────────────────────────────────────────────────
router.post("/register", registerRules, register);
router.post("/login",    loginRules,    login);
router.post("/google",                 googleAuth);
router.get("/me",        protect,       getMe);

export default router;
