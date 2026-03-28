import prisma from "../config/prisma.js";

//orderData : items and totalPrice of cart
export const createOrder = async ({userId, items, total}) => {
    const order = await prisma.order.create({
        data:{
            userId,
            total, 
            items: {
                create: items.map( item => ({
                    //productId: item.productId,
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price, //Order must store price at purchase time (not future price)
                })),
            },
        },
        include: {
            items: true,
        },
    });

    return order;
};

export const getAllOrders = async () => {
    return await prisma.order.findMany({
        include: {
            items: true,
        }
    });
    /**
    👉 So response contains:
        Order
        Its items 
    */
}