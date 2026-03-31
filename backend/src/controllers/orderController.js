import {checkout, getOrdersByUserIdService, payOrderService} from "../services/orderService.js";
import { getAllOrders } from "../models/orderModel.js";

export const checkoutOrder = async (req, res) => {
    try{
        //console.log("checkoutOrder : ORDER CONTROLLER HIT");
        const userId = req.user.id;

        const key = req.headers["idempotency-key"];
        if(!key){
            return res.status(400).json({error: "Idempotency-Key header required"});
        }

        const result = await checkout(userId, key);
        res.json(result);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};

export const fetchOrders = async (req, res) => {
    try{
        const orders = await getAllOrders();
        res.json(orders);
    }catch(err){
        res.status(500).json({error: err.message})
    }
};

export const getMyOrders = async (req, res) => {
    try{
        console.log("getMyOrders: ORDER CONTROLLER HIT");
        const userId = req.user.id;

        const orders = await getOrdersByUserIdService(userId);
        res.json(orders);
    }catch(err){
        res.status(500).json({error: err.message });
    }
};

export const payOrder = async (req, res) => {
    try{
        const { id } = req.params;
        const order = await payOrderService(id);
        res.json(order);
    }catch(err){
        res.status(400).json({ error : err.message })
    }
}

/**
*What happens here:
    Calls checkout() service
    That service likely:
        -gets cart
        -calculates total
        -creates order
        -clears cart

👉 Controller doesn’t care how—it just calls it
 */