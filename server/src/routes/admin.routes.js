import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { getStats, getAllUsers, getAllListingsAdmin, updateUser, adminDeleteListing } from "../controllers/adminController.js";

const router = Router();

router.use(protect, adminOnly); // all admin routes require auth + admin role

router.get("/stats",            getStats);
router.get("/users",            getAllUsers);
router.get("/listings",         getAllListingsAdmin);
router.put("/users/:id",        updateUser);
router.delete("/listings/:id",  adminDeleteListing);

export default router;
