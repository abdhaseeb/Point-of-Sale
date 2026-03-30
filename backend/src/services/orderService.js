//business logic
// import { createOrder } from "../models/orderModel.js";
// import { updatedProductStock } from "../models/productModel.js";
// import * as cartService from './cartServices.js';
import { getOrdersByUserId, getAllOrders } from "../models/orderModel.js";
import prisma from "../config/prisma.js";

export const getOrdersByUserIdService = async (userId) => {
    return await getOrdersByUserId(userId);
}

export const getAllOrdersService = async () => {
    return await getAllOrders();
}

export const checkout = async (userId, idempotencyKey) => {

    //checking using idempotency key if this checkout request has already been HIT once ?
    const existingOrder = await prisma.idempotencyKey.findUnique({
        where : { key : idempotencyKey},
    });    
    if(existingOrder){
        if(existingOrder.orderId){
            return await prisma.order.findUnique({
                where: { id : existingOrder.orderId},
                include: { items: true},
            });
        }else{
            throw new Error("Request already in progress");
        }
    }
    
    //first time request to create order(checkout) for this cart
    try{
        return await prisma.$transaction(async (tx) => {
            //creating idempotency record using userId and idempotencyKey from header
            await tx.idempotencyKey.create({
                data:{key : idempotencyKey,
                    userId,
                },
            });

            //fetch cart (which already includes total) and validate cart
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

            //updating the idempotency Model's orderId value which was empty till now
            await tx.idempotencyKey.update({
                where :{ key: idempotencyKey},
                data:{ orderId : order.id },
            });

            //clear cart
            await tx.cartItem.deleteMany({
                where:{
                    cartId : cart.id,
                }
            })
            
            return order;
        });
    }
    catch(err){
        //handling unique contraint error
        if(err.code === "P2002"){
            const existingOrder = await prisma.idempotencyKey.findUnique({
                where : {key : idempotencyKey},
            });

            if(existingOrder?.orderId){
                return await prisma.order.findUnique({
                    where : { id : existingOrder.orderId },
                    include: { items : true },
                })
            }

            throw new Error("Request already in progress");
        }
        throw err;
    }
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