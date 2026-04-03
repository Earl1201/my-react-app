import { Router } from "express";
import { getUserById, updateMe } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/:id", getUserById);          // public  — view any profile
router.put("/me",  protect, updateMe);    // private — update own profile

export default router;
