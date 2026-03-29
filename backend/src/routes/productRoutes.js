import express from 'express';
import { createProduct, getAllProducts, getProductById } from '../controllers/productController.js';
import {protect} from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post("/",protect, authorizeRoles("admin"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;