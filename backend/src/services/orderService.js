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
    
    return await prisma.$transaction(async (tx) => {
        //fetch and validate cart
        const cart = await tx.cart.findFirst({
            where : { userId },
            include: { items: true }, //price is inside cartItems
        });
        if(!cart || cart.items.length === 0){
            throw new Error("Cart is empty");
        }
        
        //for each product in the cart
        for(const item of cart.items){
            const result = await tx.product.updateMany({
                where : { 
                    id : item.productId, // where id = item.productId
                    stock: { gte : item.quantity }, // where stock >= quantity
                },
                data : { stock : { decrement: item.quantity, }, },
            });
            
            if(result.count === 0){
                throw new Error(`Insufficient stock for product ${item.productId}`);
            }
        }
        
        //calculating totalAmount
        const total = cart.items.reduce((sum, item) => {
            return sum + (item.quantity * item.price);
        }, 0);

        //creating order
        const order = await tx.order.create({
            data: { userId, total },
        });
        
        //creating order items
        await tx.orderItem.createMany({
            data : cart.items.map( (item) => ({
                orderId: order.id,
                productId : item.productId, 
                quantity: item.quantity, 
                price: item.price,
            })),
        });
        
        //clear cart
        await tx.cartItem.deleteMany({
            where:{
                cartId : cart.id,
            }
        })
        
        return order;
    });
};

/*
export const checkout = async (userId) => {
    const cart = await cartService.getCartService(userId);

    if(!cart.items.length){
        return {error: "Cart is empty"};
    }

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
    const totalPrice = cart.total;
    


    //3. Create Order
    const order = await createOrder({
        userId, 
        items : cart.items,
        total: totalPrice,
    });


    //4. Clear Cart as order is complete
    await cartService.clearCartService(userId);
    // console.log("CART CLEARED");

    return order;
};
*/