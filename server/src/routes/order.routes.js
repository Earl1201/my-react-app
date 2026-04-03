import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { createOrder, getMyOrders, getSellingOrders, updateOrderStatus } from "../controllers/orderController.js";

const router = Router();

router.use(protect);

router.post("/",             createOrder);
router.get("/",              getMyOrders);
router.get("/selling",       getSellingOrders);
router.put("/:id/status",    updateOrderStatus);

export default router;
