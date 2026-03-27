import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import productRoutes from "./src/routes/productRoutes.js"
import cartRoutes from "./src/routes/cartRoutes.js"

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (request, response) => {
    response.send('PoS Backend Running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
});

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);