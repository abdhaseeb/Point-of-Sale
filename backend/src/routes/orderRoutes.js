import express from "express";
import {
    checkoutOrder,
    fetchOrders,
    getMyOrders,
    payOrder,
    fetchDeliveryOrders,
    advanceOrder,
} from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Existing routes — unchanged in behaviour
router.post("/checkout",   protect, authorizeRoles("admin", "cashier", "customer"), checkoutOrder);
router.get("/",            protect, authorizeRoles("cashier", "admin"),             fetchOrders);
router.get("/my-orders",   protect, authorizeRoles("cashier", "admin", "customer"), getMyOrders);
router.post("/:id/pay",    protect,                                                  payOrder);

// PHASE 1 CHANGE: Two new routes for the delivery flow.
//
// GET  /api/orders/delivery
//   Returns all orders that are delivery orders.
//   Admin-only: the store needs to manage the queue of remote orders.
//
// POST /api/orders/:id/advance
//   Moves a delivery order to its next status.
//   Admin-only: only the store can confirm, dispatch, and complete a delivery.
router.get("/:id/advance", protect, authorizeRoles("admin"),                        fetchDeliveryOrders);
router.post("/:id/advance", protect, authorizeRoles("admin"),                       advanceOrder);

export default router;
