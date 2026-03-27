import {checkout} from "../services/orderService.js";
import { getAllOrders } from "../models/orderModel.js";

export const checkoutOrder = (req, res) => {
    const result = checkout();

    if(result.error){
        return res.status(400).json({message: result.error});
    }

    res.status(201).json(result);
}

export const fetchOrders = (req, res) => {
    res.json(getAllOrders());
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