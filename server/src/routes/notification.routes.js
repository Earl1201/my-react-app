import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getNotifications, markAllRead } from "../controllers/notificationController.js";

const router = Router();

router.use(protect);

router.get("/",     getNotifications);   // GET /api/notifications
router.put("/read", markAllRead);        // PUT /api/notifications/read

export default router;
