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
                include: { items: true, },
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
                data: { userId, total, status: "PENDING" },
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

export const payOrderService = async (orderId, paymentKey) => {
    // 1.Fetch order with items
    const order = await prisma.order.findUnique({
        where : {id : orderId},
        include : { items : true},
    })
    if(!order){
        throw new Error ("Order not found");
    }

    //2. Checking if paymentKey already exists (payment idempotency)
    const existingPayment = await prisma.payment.findUnique({
        where : { idempotencyKey : paymentKey },
        include: { order : true },
    });

    if(existingPayment){
        return  existingPayment.order; // above we include {order : true}
        // await prisma.order.findUnique({
        //     where: { id: existingPayment.orderId },
        //     include: { items: true },
        // });
    }

    //3. If already paid -> prevent new payment
    if(order.status === "PAID"){
        return order;
    }

    if(order.status === "FAILED"){
        throw new Error("Order failed");
    }

    //4. Process payment (simulating success for now)
    const paymentSuccess = true;

    //5. Transaction for consistency
    return await prisma.$transaction(async (tx) => {

        //5.1 Create payment (PENDING)
        const payment = await tx.payment.create({
            data : {
                orderId, 
                amount : order.total,
                status: "PENDING",
                idempotencyKey: paymentKey,
            },
        });

        //5.2 Atomic order update (PREVENT RACE CONDITION)
        const updateResult = await tx.order.updateMany({
            //only update when the status = PENDING, to avoid RACE Condition
            // only 1 request can pay, another req tries to access the order, it'll see as paid and payment request stops
            where : {
                id: orderId, 
                status : "PENDING"
            },  
            data : {
                status : paymentSuccess ? "PAID" : "FAILED", 
            },
        });

        //5.3 If another request aready processed payment ?
        if(updateResult.count === 0){
            //someone already made the payment
            const latestOrder = await tx.order.findUnique({
                where : { id: orderId },
                include: { items: true }
            });

            return latestOrder;
        }
        
        //5.4 HANDLE FAILURE
        if(!paymentSuccess){
            const freshOrder = await tx.order.findUnique({
                where: {id: orderId},
                include: { items: true },
            });

            //restore stock
            for(const item of order.items){
                await tx.product.update({
                    where : { id: item.productId },
                    data : { stock : {increment : item.quantity}, },
                });
            };
            
            // Mark order as FAILED
            const failedOrder = await tx.order.update({
                where : { id : orderId },
                data: { status : "FAILED" },
                include : { items :  true }, 
            });
            //if we need we can also return updatedPayment; const updatedPayment = await tx.payment.update(...)
            await tx.payment.update({
                where: { id: payment.id },
                data : { status : "FAILED" },
            });


            return failedOrder;
        }

        //5.5 HANDLE SUCCESS FLOW : Update payment success
        //if we need we can also return updatedPayment; const updatedPayment = await tx.payment.update(...)
        await tx.payment.update({
            where: { id: payment.id },
            data: { status: "SUCCESS"} 
        });

        //5.5 Fetch updated Order
        const updatedOrder = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        return updatedOrder;
    });
}



/**
 Interview Gold Line
 If asked:
 “How do you prevent double payment?”
 You say:
 “By using an atomic conditional update on order status (PENDING → PAID) and checking affected rows.”
 
 */

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