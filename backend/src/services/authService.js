import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRECT || "secretkey";

//Register
export const registerUser = async (name, email, password) => {
    const existingUser = await prisma.user.findUnique({
        where : {email}
    })
    console.log("DEBUG: existing user -> ", existingUser);
    if(existingUser){
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name, 
            email, 
            password: hashedPassword,
        },
    });
    return user;
}

//Login
export const loginUser = async (email, password) => {
    const user = await prisma.user.findUnique({
        where : {email}
    });
    if(!user){
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        {id: user.id, email: user.email, role: user.role},
        JWT_SECRET,
        { expiresIn : '1d' }
    );

    return {token};
};