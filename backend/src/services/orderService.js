//business logic
import {getUserCart, clearCart} from "../models/cartModel.js"
import { createOrder } from "../models/orderModel.js";
import { updatedProductStock } from "../models/productModel.js";
import { calculateTotal } from "./cartServices.js";


export const checkout = async (userId) => {
    const cart = await getUserCart(userId);

    if(!cart.items.length){
        return {error: "Cart is empty"};
    }

    //1. validate and update stock
    for(let item of cart.items){
        const result = await updatedProductStock(item.product.id, item.quantity);

        if(!result || result.error){
            return {error: `Stock issue for product ${item.product.name}`};
        }
    }

    //2. Calculate total
    const totalPrice = await calculateTotal(userId);

    //3. Create Order
    const order = await createOrder({
        userId, 
        items : cart.items,
        total: totalPrice,
    });

    //4. Clear Cart as order is complete
    await clearCart(userId);

    return order;
};