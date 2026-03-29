import * as authService from '../services/authService.js';

export const register = async (req, res) => {
    try{
        //debug
        console.log("REQ BODY:", req.body);
        const {name, email, password} = req.body;
        const user = await authService.registerUser(name, email, password);
        console.log("Controller values:", name, email, password);
        res.json(user);
    }catch(err){
        res.status(400).json({error: err.message});
    }
}

export const login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const result = await authService.loginUser(email, password);
        res.json(result);
    }catch(err){
        res.status(400).json({error: err.message});
    }
}