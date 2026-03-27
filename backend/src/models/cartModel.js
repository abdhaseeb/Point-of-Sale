let cart = {
    items: [],
}

export const getCart = () => cart;

export const addToCart = (product, quantity) => {
    const  existingItem = cart.items.find(prod => prod.productId === product.id);

    if(existingItem){
        existingItem.quantity += quantity;
    }
    else{   
        cart.items.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
        });
    }

    return cart;
};

export const removeFromCart = (productId) => {
    cart.items = cart.items.filter(prod => prod.productId !== productId);

    return cart;
}

export const clearCart = () => {
    cart.items = [];
}