import * as cartModel from "../models/cartModel.js";

// export const calculateTotal = async (userId) => {
//     const cart = await getUserCart(userId);

//     const total = cart.items.reduce( (sum, item) => {
//         return (sum + item.product.price * item.quantity);
//     }, 0);

//     return total;
// }

export const getCartService = async (userId) => {
    const cart = await cartModel.getUserCart(userId);

    const total = cart.items.reduce((sum, item) => {
        return sum + (item.quantity * item.price); // item is cartItem
    }, 0);

    return {
        ...cart,
        total,
    };
};

// Add item to cart and return full cart
export const addToCartService = async (userId, productId, quantity = 1) => {
    if (quantity <= 0) throw new Error("Quantity must be greater than 0");

    await cartModel.addToCart(userId, productId, quantity);

    return getCartService(userId); // return updated cart
};

// Remove item from cart and return full cart
export const removeFromCartService = async (userId, productId) => {
    await cartModel.removeFromCart(userId, productId);

    return getCartService(userId); // return updated cart
};

// Clear cart and return full cart
export const clearCartService = async (userId) => {
    await cartModel.clearCart(userId);

    return getCartService(userId); // return updated cart
};