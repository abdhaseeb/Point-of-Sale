import { checkout, getOrdersByUserIdService, payOrderService } from "../services/orderService.js";
import { getAllOrders, getDeliveryOrders, advanceDeliveryStatus } from "../models/orderModel.js";

export const checkoutOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const key = req.headers["idempotency-key"];
        if (!key) {
            return res.status(400).json({ error: "Idempotency-Key header required" });
        }

        // PHASE 1 CHANGE: Read delivery fields from the request body.
        // If the cashier does not send these, safe defaults are applied:
        //   deliveryType    -> "IN_STORE"  (existing behaviour preserved)
        //   deliveryAddress -> undefined   (null stored in DB, fine for in-store)
        //   paymentMethod   -> "CASH"      (most common in-store method)
        const {
            deliveryType    = "IN_STORE",
            deliveryAddress,
            paymentMethod   = "CASH",
        } = req.body || {};

        // Validate: a DELIVERY order must have an address
        if (deliveryType === "DELIVERY" && !deliveryAddress) {
            return res.status(400).json({ error: "deliveryAddress is required for DELIVERY orders" });
        }

        const result = await checkout(userId, key, { deliveryType, deliveryAddress, paymentMethod });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const fetchOrders = async (req, res) => {
    try {
        const orders = await getAllOrders();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const userId  = req.user.id;
        const orders  = await getOrdersByUserIdService(userId);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const payOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order  = await payOrderService(id);
        res.json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PHASE 1 CHANGE: New controller — returns all orders where deliveryType = "DELIVERY".
// Only admins can see this view (enforced in the route).
export const fetchDeliveryOrders = async (req, res) => {
    try {
        const orders = await getDeliveryOrders();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PHASE 1 CHANGE: New controller — advances a delivery order to its next status.
// Admin calls this as the order moves through: PENDING -> CONFIRMED -> OUT_FOR_DELIVERY -> DELIVERED.
export const advanceOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order  = await advanceDeliveryStatus(id);
        res.json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
