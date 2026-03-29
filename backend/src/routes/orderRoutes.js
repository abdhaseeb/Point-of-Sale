import express from "express";
import { checkoutOrder, fetchOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/checkout", protect, checkoutOrder);
router.get("/", protect, fetchOrders);

export default router;