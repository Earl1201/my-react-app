import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getConversations, startConversation, getMessages, sendMessage } from "../controllers/messageController.js";

const router = Router();

router.use(protect); // all message routes require auth

router.get("/conversations",      getConversations);
router.post("/conversations",     startConversation);
router.get("/conversations/:id",  getMessages);
router.post("/conversations/:id", sendMessage);

export default router;
