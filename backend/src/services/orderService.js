//business logic
import {getUserCart, clearCart} from "../models/cartModel.js"
import { createOrder } from "../models/orderModel.js";
import { updatedProductStock } from "../models/productModel.js";
import { calculateTotal } from "./cartServices.js";


export const checkout = async (userId) => {
    const cart = await getUserCart(userId);

    // DEBUG START
    console.log("FULL CART:", cart);
    console.log("CART ITEMS:", cart.items);
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

    //2. Calculate 
    console.log("STEP 2: Calculating total...");
    const totalPrice = await calculateTotal(userId);
    console.log("TOTAL:", totalPrice);


    //3. Create Order
    console.log("STEP 3: Creating order...");
    //
    const order = await createOrder({
        userId, 
        items : cart.items,
        total: totalPrice,
    });
    console.log("ORDER CREATED:", order);


    //4. Clear Cart as order is complete
    console.log("STEP 4: Clearing cart...");
    await clearCart(userId);
    console.log("CART CLEARED");

    return order;
};