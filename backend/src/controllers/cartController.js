import { getCart, addToCart, removeFromCart, clearCart } from "../models/cartModel.js";

import { getProductById } from "../models/productModel.js";
import { calculateTotal } from "../services/cartServices.js";

export const fetchCart = (req, res) => {
    const cart = getCart();
    const total = calculateTotal();

    res.json({...cart, total});
}

export const addItemToCart = (req, res) => {
    const {productId, quantity} = req.body;
    const product = getProductById(productId)

    if(!product){
        return res.status(400).json({message: "Product not found"});
    }

    const cart = addToCart(product, quantity || 1);
    
    res.json(cart);
};

export const removeItemFromCart = (req, res) => {
    const {productId} = req.body;
    const cart = removeFromCart(productId);

    res.json(cart);
}