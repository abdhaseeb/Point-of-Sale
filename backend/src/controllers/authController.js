import * as authService from '../service/authService.js';

export const register = async (req, res) => {
    try{
        const {name, email, pwd} = req.body;
        const user = await authService.registerUser(name, email, pwd);
        res.json(user);
    }catch(err){
        res.status(400).json({error: err.message});
    }
}

export const login = async (req, res) => {
    try{
        const {email, pwd} = req.body;
        const result = await authService.loginUser(email, pwd);
        res.json(result);
    }catch(err){
        res.status(400).json({error: err.message});
    }
}