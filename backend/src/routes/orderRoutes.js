import express from "express";
import { checkoutOrder, fetchOrders, getMyOrders, payOrder } from "../controllers/orderController.js";
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, authorizeRoles("admin", "cashier"),  checkoutOrder);
router.get("/", protect, authorizeRoles("cashier", "admin"), fetchOrders);
router.get("/my-orders", protect, authorizeRoles("cashier", "admin"), getMyOrders);
router.post("/:id/pay",  payOrder);

export default router;