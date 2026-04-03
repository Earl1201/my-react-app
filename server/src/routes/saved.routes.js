import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { toggleSave, checkSaved, getSaved } from "../controllers/savedController.js";

const router = Router();

router.use(protect);

router.get("/",              getSaved);          // GET  /api/saved
router.get("/:listingId",    checkSaved);        // GET  /api/saved/:listingId
router.post("/:listingId",   toggleSave);        // POST /api/saved/:listingId  (toggles)

export default router;
