//starting with in-memory storage first
import { randomUUID } from "crypto";

let products = [];

export const createProduct = (product) => {
    const newProduct = { id : randomUUID(), ...product};
    products.push(newProduct);
    return newProduct;
};

export const getAllProducts = () => products;

export const getProductById = (id) => {
    return products.find( (prod) => prod.id === id);
};

export const updatedProductStock = (productId, quantity) => {
    const product = products.find(prod => prod.id === productId);

    if(!product) return null;

    if(product.stock < quantity){
        return {error: "Insufficient stock"};
    }

    product.stock -= quantity;
    return product;
}