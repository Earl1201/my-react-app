import { Router } from "express";
import { body } from "express-validator";
import {
  getAllListings, getMyListings, getListingById,
  createListing, updateListing, deleteListing, updateListingStatus,
} from "../controllers/listingController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

const createRules = [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("listingType").isIn(["product", "service"]).withMessage("Type must be product or service."),
  body("categoryId").isInt({ min: 1 }).withMessage("Category is required."),
];

router.get("/",    getAllListings);
router.get("/my",  protect, getMyListings);
router.get("/:id", getListingById);

router.post(
  "/",
  protect,
  upload.array("images", 5),
  createRules,
  createListing
);

router.put("/:id",           protect, createRules, updateListing);
router.delete("/:id",        protect, deleteListing);
router.put("/:id/status",    protect, updateListingStatus);

export default router;
