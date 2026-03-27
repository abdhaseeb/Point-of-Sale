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

/**
If you didn’t have this file:

Every part of your app would directly access products
Logic would be duplicated
Hard to maintain

Instead, this file:
✅ Centralizes logic
✅ Keeps things clean
✅ Makes future upgrades easier

 */