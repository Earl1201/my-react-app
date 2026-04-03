import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { createReview } from "../controllers/reviewController.js";

const router = Router();

router.post("/", protect, createReview);   // POST /api/reviews

export default router;
