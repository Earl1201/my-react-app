import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { getStats, getAllUsers, getAllListingsAdmin, updateUser, adminDeleteListing, getAnalytics, getAllOrdersAdmin, getUserActivity } from "../controllers/adminController.js";

const router = Router();

router.use(protect, adminOnly); // all admin routes require auth + admin role

router.get("/stats",            getStats);
router.get("/analytics",        getAnalytics);
router.get("/users",            getAllUsers);
router.get("/user-activity",    getUserActivity);
router.get("/listings",         getAllListingsAdmin);
router.get("/orders",           getAllOrdersAdmin);
router.put("/users/:id",        updateUser);
router.delete("/listings/:id",  adminDeleteListing);

export default router;
