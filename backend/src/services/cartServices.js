import { getCart } from "../models/cartModel";

export const calculateTotal = () => {
    const cart = getCart();

    const total = cart.items.reduce( (acc, item) => {
        return acc+item.price * item.quantity;
    }, 0);

    return total;
}