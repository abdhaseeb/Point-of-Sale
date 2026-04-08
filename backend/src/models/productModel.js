//starting with in-memory storage first
import prisma from "../config/prisma.js";

export const createProduct = async (data) => {
    return await prisma.product.create({
        data,
    });
};

export const getAllProducts = async () => {
    return await prisma.product.findMany();
};

export const getProductById = async (id) => {
    return await prisma.product.findUnique({
        where: {id},
    })
};

export const deleteProduct = async (id) => {
    return await prisma.product.delete({
        where: { id },
    });
};

export const updatedProductStock = async (productId, quantity) => {
    const product = await prisma.product.findUnique({
        where: {id: productId},
    });

    if(!product) return null;

    if(product.stock < quantity){
        return {error: "Insufficient stock"};
    }

    return await prisma.product.update({
        where: {id: productId},
        data: {stock: product.stock - quantity},
    });
};