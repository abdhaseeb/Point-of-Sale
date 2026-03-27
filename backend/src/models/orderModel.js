import {randomUUID} from "crypto";

let orders = [];

//orderData : items and totalPrice of cart
export const createOrder = (orderData) => {
    const newOrder = {
        id : randomUUID(),
        ...orderData,
        createdAt : new Date(),
    };

    orders.push(newOrder);
    return newOrder;
};

export const getAllOrders = () => orders;