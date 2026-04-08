import express from 'express';
import { createProduct, getAllProducts, getProductById, deleteProduct } from '../controllers/productController.js';
import {protect} from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post("/",protect, authorizeRoles("admin"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct);

export default router;