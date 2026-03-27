import { createProduct, getAllProducts, getProductById } from "../models/productModel.js";

export const addProduct = (req, res) => {
    const {name, price, stock} = req.body;

    if(!name || !price){
        return res.status(400).json({ message: "Name and price required"});
    }

    const product = createProduct({name, price, stock: stock || 0});

    res.status(201).json(product);
};

export const fetchProducts = (req, res) => {
    res.json(getAllProducts());
};

export const fetchProduct = (req, res) => {
    const product = getProductById(req.params.id);

    if(!product){
        return res.status(400).json({message : "Product not found!"});
    }

    res.json(product);
};


/**
Why this file is important

Without controllers:

Routes become messy
Logic gets duplicated
Hard to maintain

With controllers:
✅ Clean separation
✅ Reusable logic
✅ Easier debugging

 */