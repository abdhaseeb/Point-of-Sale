import {checkout} from "../services/orderService.js";
import { getAllOrders } from "../models/orderModel.js";

export const checkoutOrder = async (req, res) => {
    try{
        const userId = req.user.id;
        const result = await checkout(userId);
        
        if(result.error){
            return res.status(400).json({message: result.error});
        }

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