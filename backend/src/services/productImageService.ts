import  prisma from "../config/db.js";

export const createProductImage = async (
    data: {
        productId: bigint;
        imageUrl: string;
        altText?: string | null;
        sortOrder?: number;
        isPrimary?: boolean;
    }
) => {
    if (data.isPrimary) {
        await prisma.productImage.updateMany({
            where: {
                productId: data.productId,
            },

            data: {
                isPrimary: false,
            },
        });
    }

    return prisma.productImage.create({
        data: {
            productId: data.productId,

            imageUrl: data.imageUrl,

            altText:
                data.altText || null,

            sortOrder:
                data.sortOrder ?? 0,

            isPrimary:
                data.isPrimary ?? false,
        },
    });
};

export const getProductImages = async (
    productId: bigint
) => {
    return prisma.productImage.findMany({
        where: {
            productId,
        },

        orderBy: {
            sortOrder: "asc",
        },
    });
};

export const getProductImageById = async (
    id: bigint
) => {
    return prisma.productImage.findUnique({
        where: {
            id,
        },
    });
};

export const updateProductImage = async (
    id: bigint,
    data: {
        productId?: bigint;
        imageUrl?: string;
        altText?: string | null;
        sortOrder?: number;
        isPrimary?: boolean;
    }
) => {
    const existing =
        await prisma.productImage.findUnique({
            where: {
                id,
            },
        });

    if (!existing) {
        return null;
    }

    if (
        data.isPrimary === true
    ) {
        await prisma.productImage.updateMany({
            where: {
                productId:
                    data.productId ??
                    existing.productId,

                id: {
                    not: id,
                },
            },

            data: {
                isPrimary: false,
            },
        });
    }

    return prisma.productImage.update({
        where: {
            id,
        },

        data,
    });
};

export const deleteProductImage = async (
    id: bigint
) => {
    return prisma.productImage.delete({
        where: {
            id,
        },
    });
};