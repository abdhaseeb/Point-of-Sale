import prisma from "../config/prisma.js";

//get or create a user's cart

export const getUserCart = async (userId) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { 
            include: { product: true }
        }},
    });

    if(!cart){
        cart = await prisma.cart.create({
            data: { userId },
            include: { items:{
                    include: { product: true }
            }},
        });
    }
    return cart;
}


// Add item to cart
export const addToCart = async (userId, productId, quantity = 1) => {
    const cart = await getUserCart(userId);

    const  existingItem = await prisma.cartItem.findFirst({
        where: {cartId: cart.id, productId},
    });

    if(existingItem){
        await prisma.cartItem.update({
            where: {id: existingItem.id},
            data: { quantity: existingItem.quantity + quantity },
        });
    }
    else{   
        await prisma.cartItem.create({
            data: { cartId: cart.id, productId, quantity},
            include: { product: true},
        });
    }
};

// Remove item from cart
export const removeFromCart = async (userId, productId) => {
    const cart = await getUserCart(userId);

    await prisma.cartItem.deleteMany({
        where: {cartId : cart.id, productId},
    })

    return;
}

//Clear cart
export const clearCart = async(userId) => {
    const cart = await getUserCart(userId);

    await prisma.cartItem.deleteMany({
        where: { cartId: cart.id},
    });

    return;
}