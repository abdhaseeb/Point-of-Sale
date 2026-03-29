import express from "express";
import {fetchCart, addItemToCart, removeItemFromCart, clearCart} from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/', protect, fetchCart);
router.post('/add', protect, addItemToCart);
router.post('/remove', protect, removeItemFromCart);
router.post('/clear', protect, clearCart);

export default router;