import prisma from "../config/prisma.js";

// PHASE 1 CHANGE: createOrder now accepts deliveryType, deliveryAddress,
// and paymentMethod so that both IN_STORE and DELIVERY orders can be created
// with the correct metadata stored in the database.
export const createOrder = async ({ userId, items, total, deliveryType, deliveryAddress, paymentMethod }) => {
    const order = await prisma.order.create({
        data: {
            userId,
            total,
            deliveryType,
            deliveryAddress,   // will be null for IN_STORE orders — that is fine
            paymentMethod,
            items: {
                create: items.map(item => ({
                    productId: item.product.id,
                    quantity:  item.quantity,
                    price:     item.product.price, // price locked at purchase time
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
        include: { items: true },
    });
};

export const getOrdersByUserId = async (userId) => {
    return await prisma.order.findMany({
        where: { userId },
        include: {
            items: {
                include: { product: true },
            },
        },
    });
};

// PHASE 1 CHANGE: New function that fetches ONLY delivery orders.
// Used by the admin to see all remote orders that need to be acted on.
export const getDeliveryOrders = async () => {
    return await prisma.order.findMany({
        where: { deliveryType: "DELIVERY" },
        include: {
            items: { include: { product: true } },
            user:  true,   // include user so admin can see customer name, phone, address
        },
        orderBy: { createdAt: "desc" },
    });
};

// PHASE 1 CHANGE: New function to advance a delivery order through its
// status lifecycle. The allowed transitions are strictly enforced so
// statuses cannot be set arbitrarily.
//
// Valid transitions:
//   PENDING -> CONFIRMED         (admin accepts the remote order)
//   CONFIRMED -> OUT_FOR_DELIVERY (admin dispatches the delivery)
//   OUT_FOR_DELIVERY -> DELIVERED (delivery person marks it complete)
export const advanceDeliveryStatus = async (orderId) => {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new Error("Order not found");
    if (order.deliveryType !== "DELIVERY") throw new Error("This order is not a delivery order");

    const transitions = {
        "PENDING":           "CONFIRMED",
        "CONFIRMED":         "OUT_FOR_DELIVERY",
        "OUT_FOR_DELIVERY":  "DELIVERED",
    };

    const nextStatus = transitions[order.status];
    if (!nextStatus) throw new Error(`Order is already ${order.status} and cannot be advanced further`);

    return await prisma.order.update({
        where: { id: orderId },
        data:  { status: nextStatus },
    });
};
