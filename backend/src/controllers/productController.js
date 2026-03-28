import * as productModel from "../models/productModel.js";

//create product
export const createProduct = async (req, res) => {
    try{
        const product = await productModel.createProduct(req.body);
        res.json(product);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

export const getAllProducts = async (req, res) => {
    try{
        console.log("GET /api/products hit");
        const products = await productModel.getAllProducts();
        res.json(products);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

export const getProductById = async (req, res) => {
    try{
        const productId = req.params.id;
        const product = await productModel.getProductById(productId)
        res.json(product);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};


/**
Logic gets duplicated
Hard to maintain

With controllers:
✅ Clean separation
✅ Reusable logic
✅ Easier debugging

 */