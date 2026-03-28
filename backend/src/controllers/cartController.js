//import { getUserCart, addToCart, removeFromCart, clearCart } from "../models/cartModel.js";
//import { getProductById } from "../models/productModel.js";

import * as cartModel from "../models/cartModel.js";
import { calculateTotal } from "../services/cartServices.js";

const userId = '12345';

export const fetchCart = async (req, res) => {
    try{
        
        //const userId = req.user.id;
        const cart = await cartModel.getUserCart(userId);
        const total = await calculateTotal(userId);

        res.json({cart, total});
    }catch(err){
        res.status(500).json({ error: err.message});
    }
};

// Add to cart
export const addItemToCart = async (req, res) => {
    try{    
        //const userId = req.user.id;
        const {productId, quantity} = req.body;

        const cart = await cartModel.addToCart(userId, productId, quantity);
        res.json(cart);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

//Remove from cart
export const removeItemFromCart = async (req, res) => {
    try{
        //const userId = req.user.id;
        const {productId} = req.body;
        const cart = await cartModel.removeFromCart(userId, productId);
        res.json(cart);
    }catch(err){
        res.status(500).json({error: err.message});
    }
}

//clearCart
export const clearCart = async (req, res) => {
    try{
        //const userId = req.user.id;
        const cart = await cartModel.clearCart(userId)
        res.json(cart);
    }catch(err){
        res.status(500).json({error: err.message});
    }
}
