import express from "express";
import {fetchCart, addItemToCart, removeItemFromCart} from "../controllers/cartController.js";

const router = express.Router();

router.get('/', fetchCart);
router.post('/add', addItemToCart);
router.post('/remove', removeItemFromCart);

export default router;