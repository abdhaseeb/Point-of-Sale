import express from 'express';
import { addProduct, fetchProduct, fetchProducts } from '../controllers/productController.js';

const router = express.Router();

router.post("/", addProduct);
router.get("/", fetchProducts);
router.get("/:id", fetchProduct);

export default router;