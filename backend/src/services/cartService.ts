import prisma from "../config/db.js";

interface AddToCartInput {
    userId: bigint;
    variantId: bigint;
    quantity: number;
}

interface UpdateCartItemInput {
    userId: bigint;
    itemId: bigint;
    quantity: number;
}

export const getOrCreateCart = async (
    userId: bigint
) => {
    let cart = await prisma.cart.findFirst({
        where: {
            userId,
            status: "active",
        },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: {
                                include: {
                                    brand: true,
                                    category: true,
                                },
                            },
                            attributes: {
                                include: {
                                    attribute: true,
                                    attributeValue: true,
                                },
                            },
                            images: true,
                        },
                    },
                },
            },
        },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId,
                status: "active",
            },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    include: {
                                        brand: true,
                                        category: true,
                                    },
                                },
                                attributes: {
                                    include: {
                                        attribute: true,
                                        attributeValue: true,
                                    },
                                },
                                images: true,
                            },
                        },
                    },
                },
            },
        });
    }

    return cart;
};


export const addToCart = async (
    data: AddToCartInput
) => {
    const {
        userId,
        variantId,
        quantity,
    } = data;

    if (quantity <= 0) {
        throw new Error(
            "Quantity must be greater than 0."
        );
    }

    const variant =
        await prisma.productVariant.findUnique({
            where: {
                id: variantId,
            },
        });

    if (!variant) {
        throw new Error(
            "Product variant not found."
        );
    }

    if (!variant.isActive) {
        throw new Error(
            "This product variant is not active."
        );
    }

    if (variant.stockQuantity <= 0) {
        throw new Error(
            "This product is out of stock."
        );
    }

    const cart = await prisma.cart.upsert({
        where: {
            userId_status: {
                userId,
                status: "active",
            },
        },
        create: {
            userId,
            status: "active",
        },
        update: {},
    });

    const existingItem =
        await prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId,
                },
            },
        });

    const newQuantity =
        (existingItem?.quantity || 0) + quantity;

    if (newQuantity > variant.stockQuantity) {
        throw new Error(
            `Only ${variant.stockQuantity} items available in stock.`
        );
    }

    let cartItem;

    if (existingItem) {
        cartItem =
            await prisma.cartItem.update({
                where: {
                    id: existingItem.id,
                },
                data: {
                    quantity: newQuantity,
                },
                include: {
                    variant: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
    } else {
        cartItem =
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId,
                    quantity,
                },
                include: {
                    variant: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
    }

    return cartItem;
};


export const getCart = async (
    userId: bigint
) => {
    const cart = await prisma.cart.findFirst({
        where: {
            userId,
            status: "active",
        },
        include: {
            items: {
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    variant: {
                        include: {
                            product: {
                                include: {
                                    brand: true,
                                    category: true,
                                },
                            },
                            attributes: {
                                include: {
                                    attribute: true,
                                    attributeValue: true,
                                },
                            },
                            images: true,
                        },
                    },
                },
            },
        },
    });

    if (!cart) {
        return {
            id: null,
            userId,
            status: "active",
            items: [],
        };
    }

    return cart;
};


export const updateCartItem = async (
    data: UpdateCartItemInput
) => {
    const {
        userId,
        itemId,
        quantity,
    } = data;

    if (quantity <= 0) {
        throw new Error(
            "Quantity must be greater than 0."
        );
    }

    const cartItem =
        await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cart: {
                    userId,
                    status: "active",
                },
            },
            include: {
                variant: true,
            },
        });

    if (!cartItem) {
        throw new Error(
            "Cart item not found."
        );
    }

    if (!cartItem.variant.isActive) {
        throw new Error(
            "This product variant is not active."
        );
    }

    if (
        quantity >
        cartItem.variant.stockQuantity
    ) {
        throw new Error(
            `Only ${cartItem.variant.stockQuantity} items available in stock.`
        );
    }

    return prisma.cartItem.update({
        where: {
            id: cartItem.id,
        },
        data: {
            quantity,
        },
        include: {
            variant: {
                include: {
                    product: true,
                },
            },
        },
    });
};


export const removeCartItem = async (
    userId: bigint,
    itemId: bigint
) => {
    const cartItem =
        await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cart: {
                    userId,
                    status: "active",
                },
            },
        });

    if (!cartItem) {
        throw new Error(
            "Cart item not found."
        );
    }

    await prisma.cartItem.delete({
        where: {
            id: itemId,
        },
    });

    return true;
};


export const clearCart = async (
    userId: bigint
) => {
    const cart =
        await prisma.cart.findFirst({
            where: {
                userId,
                status: "active",
            },
        });

    if (!cart) {
        return true;
    }

    await prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id,
        },
    });

    return true;
};