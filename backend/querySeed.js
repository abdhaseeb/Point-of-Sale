import prisma from "./src/config/prisma.js";

async function main() {
    // Create user
    const user = await prisma.user.create({
        data: {
            name: "Test User",
            email: "test@example.com",
            password: "123456",
        },
    });

    console.log("User created:", user);

    // Create products
    const products = await prisma.product.createMany({
        data: [
            { name: "Milk", price: 50, stock: 20 },
            { name: "Bread", price: 30, stock: 15 },
            { name: "Eggs", price: 6, stock: 100 },
        ],
    });

    console.log("Products created:", products);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());