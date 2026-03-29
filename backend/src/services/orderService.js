//business logic
import { createOrder } from "../models/orderModel.js";
import { updatedProductStock } from "../models/productModel.js";
import { getOrdersByUserId, getAllOrders } from "../models/orderModel.js";
import * as cartService from './cartServices.js';

export const getOrdersByUserIdService = async (userId) => {
    return await getOrdersByUserId(userId);
}

export const getAllOrdersService = async () => {
    return await getAllOrders();
}

export const checkout = async (userId) => {
    //Get cart (already includes total)
    const cart = await cartService.getCartService(userId);

    // DEBUG START
    // console.log("FULL CART:", cart);
    // console.log("CART ITEMS:", cart.items);
    // DEBUG END

    if(!cart.items.length){
        return {error: "Cart is empty"};
    }

    //1. validate and update stock
    for(let item of cart.items){
        if (!item.product) {
            return { error: "Product data missing in the cart" };
        }
        
        const result = await updatedProductStock(item.product.id, item.quantity);

        if(!result){
            return {error: `Product not found: ${item.product.name}`};
        }
        if(result.error){
            return {error: `Stock issue for product ${item.product.name}`};
        }
    }

    //2. use the total from cartService 
    //console.log("STEP 2: Calculating total...");
    const totalPrice = cart.total;
    //console.log("TOTAL:", totalPrice);


    //3. Create Order
    //console.log("STEP 3: Creating order...");
    const order = await createOrder({
        userId, 
        items : cart.items,
        total: totalPrice,
    });
    // console.log("ORDER CREATED:", order);


    //4. Clear Cart as order is complete
    // console.log("STEP 4: Clearing cart...");
    await cartService.clearCartService(userId);
    // console.log("CART CLEARED");

    return order;
};