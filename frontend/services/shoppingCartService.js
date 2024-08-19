import prisma from '../app/db';
import { createGuestUser } from './userService';

const getShoppingCartForUser = async ({ user }) => {
    let newUser;
    if (!user) newUser = await createGuestUser();
    const shoppingCartOwnerId = user ? user.id : newUser.id
    console.log({user, newUser})
    let shoppingCart = await prisma.shoppingCart.findUnique({
        where: {
            userId: shoppingCartOwnerId,
        },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            category: true,
                            images: true,
                        }
                    }
                }
            },
        },
    });
    if (!shoppingCart) {
        shoppingCart = await prisma.shoppingCart.create({
            data: {
                user: {
                    connect: {id: shoppingCartOwnerId}
                }
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                                images: true,
                            }
                        }
                    }
                },
            },
        });
    }
    return shoppingCart;
};

const checkoutShoppingCartForUser = async ({ user }) => {
    // Reduce the count of items of the products
    const shoppingCart = await getShoppingCartForUser({ user });
    await prisma.shoppingCart.delete({
        where: {
            userId: user.id,
        }
    });

    return shoppingCart;
}

const addProductToCart = async ({
    product,
    user, // TODO: on API endpoint, verify if same user adding to self cart
}) => {
    if (!user) return;

    const shoppingCart = await getShoppingCartForUser({ user });
    return await prisma.productItem.upsert({
        where: {
            shoppingCartProduct: {
                productId: product.id,
                shoppingCartId: shoppingCart.id,
            }
        },
        create: {
            productId: product.id,
            shoppingCartId: shoppingCart.id,
            quantity: 1,
            price: product.price,
        },
        update: {
            productId: product.id,
            shoppingCartId: shoppingCart.id,
            quantity: {
                increment: 1,
            },
            price: product.price,
        },
    });
};

const deleteProductItemFromCart = async ({
    productItem
}) => {
    const shoppingCart = await prisma.productItem.delete({
        where: { id: productItem.id, },
    });

    return shoppingCart;
}

const deleteProductFromCart = async ({
    product,
    user,
}) => {
    const shoppingCart = await getShoppingCartForUser({ user });
    const existingItem = await prisma.productItem.findUnique({
        where: {
            shoppingCartProduct: {
                productId: product.id,
                shoppingCartId: shoppingCart.id,
            }
        }
    });
    if (!existingItem) return null;

    await prisma.productItem.delete({
        where: { id: existingItem.id, },
    });
}

const reduceProductItemFromCart = async ({
    product,
    user,
}) => {
    if (!user) return;

    const shoppingCart = await getShoppingCartForUser({ user });
    const existingItem = await prisma.productItem.findUnique({
        where: {
            shoppingCartProduct: {
                productId: product.id,
                shoppingCartId: shoppingCart.id,
            }
        }
    });
    if (!existingItem) return null;

    const productItem = await prisma.productItem.update({
        where: { id: existingItem.id },
        data: {
            quantity: {
                decrement: 1,
            }
        }
    });
    if (productItem.quantity <= 0) {
        await deleteProductItemFromCart({ productItem });
    }

    return productItem;
}


export {
    getShoppingCartForUser,
    checkoutShoppingCartForUser,
    addProductToCart,
    deleteProductFromCart,
    reduceProductItemFromCart,
};