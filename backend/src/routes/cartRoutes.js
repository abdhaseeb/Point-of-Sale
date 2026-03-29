import express from "express";
import {fetchCart, addItemToCart, removeItemFromCart, clearCart} from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get('/', protect, fetchCart);
router.post('/add', protect, authorizeRoles("cashier", "admin"), addItemToCart);
router.post('/remove', protect, authorizeRoles("cashier", "admin"), removeItemFromCart);
router.post('/clear', protect, authorizeRoles("cashier", "admin"), clearCart);

export default router;