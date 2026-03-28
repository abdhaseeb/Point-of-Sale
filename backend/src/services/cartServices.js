import { getUserCart } from "../models/cartModel.js";

export const calculateTotal = async (userId) => {
    const cart = await getUserCart(userId);

    const total = cart.items.reduce( (sum, item) => {
        return (sum + item.product.price * item.quantity);
    }, 0);

    return total;
}