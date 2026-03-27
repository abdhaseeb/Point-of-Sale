//business logic
import {getCart, clearCart} from "../models/cartModel.js"
import { createOrder } from "../models/orderModel.js";
import { updatedProductStock } from "../models/productModel.js";
import { calculateTotal } from "./cartServices.js";

export const checkout = () => {
    const cart = getCart();

    if(cart.items.length === 0){
        return {error: "Cart is empty"};
    }

    //1. validate and update stock
    for(let item of cart.items){
        const result = updatedProductStock(item.productId, item.quantity);

        if(!result || result.error){
            return {error: `Stock issue for product ${item.name}`};
        }
    }

    //2. Calculate total
    const totalPrice = calculateTotal();

    //3. Create Order
    const order = createOrder({
        items : cart.items,
        totalPrice,
    });

    //4. Clear Cart as order is complete
    clearCart();

    return order;
}