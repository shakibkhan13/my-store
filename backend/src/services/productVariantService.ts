import  prisma  from "../config/db.js";

export const createVariant = async (
    data: {
        productId: bigint;
        sku: string;
        barcode?: string | null;

        price: number;
        compareAtPrice?: number | null;
        costPrice?: number | null;

        weight?: number | null;

        stockQuantity?: number;
        reservedQuantity?: number;

        lowStockThreshold?: number;

        isActive?: boolean;
    }
) => {
    return prisma.productVariant.create({
        data: {
            productId: data.productId,

            sku: data.sku,

            barcode: data.barcode || null,

            price: data.price,

            compareAtPrice:
                data.compareAtPrice ?? null,

            costPrice:
                data.costPrice ?? null,

            weight:
                data.weight ?? null,

            stockQuantity:
                data.stockQuantity ?? 0,

            reservedQuantity:
                data.reservedQuantity ?? 0,

            lowStockThreshold:
                data.lowStockThreshold ?? 5,

            isActive:
                data.isActive ?? true,
        },

        include: {
            product: true,

            attributes: {
                include: {
                    attribute: true,
                    attributeValue: true,
                },
            },

            images: true,
        },
    });
};

export const getVariants = async (
    productId?: bigint
) => {
    return prisma.productVariant.findMany({
        where: {
            deletedAt: null,

            ...(productId && {
                productId,
            }),
        },

        include: {
            product: true,

            attributes: {
                include: {
                    attribute: true,
                    attributeValue: true,
                },
            },

            images: {
                orderBy: {
                    sortOrder: "asc",
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getVariantById = async (
    id: bigint
) => {
    return prisma.productVariant.findFirst({
        where: {
            id,
            deletedAt: null,
        },

        include: {
            product: true,

            attributes: {
                include: {
                    attribute: true,
                    attributeValue: true,
                },
            },

            images: {
                orderBy: {
                    sortOrder: "asc",
                },
            },
        },
    });
};

export const updateVariant = async (
    id: bigint,
    data: any
) => {
    return prisma.productVariant.update({
        where: {
            id,
        },

        data,

        include: {
            product: true,

            attributes: {
                include: {
                    attribute: true,
                    attributeValue: true,
                },
            },

            images: true,
        },
    });
};

export const deleteVariant = async (
    id: bigint
) => {
    return prisma.productVariant.update({
        where: {
            id,
        },

        data: {
            deletedAt: new Date(),
        },
    });
};