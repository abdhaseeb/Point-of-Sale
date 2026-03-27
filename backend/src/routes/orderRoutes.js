import express from "express";
import { checkoutOrder, fetchOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/checkout", checkoutOrder);
router.get("/", fetchOrders);

export default router;