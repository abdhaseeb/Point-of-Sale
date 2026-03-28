import express from "express";
import {fetchCart, addItemToCart, removeItemFromCart, clearCart} from "../controllers/cartController.js";

const router = express.Router();

router.get('/', fetchCart);
router.post('/add', addItemToCart);
router.post('/remove', removeItemFromCart);
router.post('/clear', clearCart);

export default router;