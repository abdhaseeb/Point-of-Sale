//import { getUserCart, addToCart, removeFromCart, clearCart } from "../models/cartModel.js";
//import { getProductById } from "../models/productModel.js";
//import * as cartModel from "../models/cartModel.js";

import * as cartService from "../services/cartServices.js";

//const userId = '12345';

export const fetchCart = async (req, res) => {
    try{      
        const userId = req.user.id;
        const cart = await cartService.getCartService(userId);
        res.json(cart);
    }catch(err){
        res.status(500).json({ error: err.message});
    }
};

// Add to cart
export const addItemToCart = async (req, res) => {
    try{    
        const userId = req.user.id;
        const {productId, quantity} = req.body;
        const cart = await cartService.addToCartService(userId, productId, quantity);
        res.json(cart);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

//Remove from cart
export const removeItemFromCart = async (req, res) => {
    try{
        const userId = req.user.id;
        const {productId} = req.body;
        const cart = await cartService.removeFromCartService(userId, productId);
        res.json(cart);
    }catch(err){
        res.status(500).json({error: err.message});
    }
}

//clearCart
export const clearCart = async (req, res) => {
    try{
        const userId = req.user.id;
        const cart = await cartService.clearCartService(userId)
        res.json(cart);
    }catch(err){
        res.status(500).json({error: err.message});
    }
}
