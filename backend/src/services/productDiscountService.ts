import prisma from "../config/db.js";
import { DiscountType, Prisma } from "@prisma/client";

// ============================================================
// TYPES
// ============================================================

interface CreateProductDiscountInput {
    productId: bigint;
    name?: string;
    type: DiscountType;
    value: Prisma.Decimal | number | string;
    maxDiscount?: Prisma.Decimal | number | string | null;
    startsAt: Date;
    endsAt?: Date | null;
    isActive?: boolean;
}

interface UpdateProductDiscountInput {
    name?: string;
    type?: DiscountType;
    value?: Prisma.Decimal | number | string;
    maxDiscount?: Prisma.Decimal | number | string | null;
    startsAt?: Date;
    endsAt?: Date | null;
    isActive?: boolean;
}

// ============================================================
// CREATE PRODUCT DISCOUNT
// ============================================================

export const createProductDiscount = async (
    data: CreateProductDiscountInput,
) => {
    // Validate product
    const product = await prisma.product.findUnique({
        where: {
            id: data.productId,
        },
        select: {
            id: true,
            vendorId: true,
        },
    });

    if (!product) {
        throw new Error("Product not found.");
    }

    // Percentage validation
    if (
        data.type === DiscountType.PERCENTAGE &&
        Number(data.value) > 100
    ) {
        throw new Error("Percentage discount cannot exceed 100%.");
    }

    if (Number(data.value) < 0) {
        throw new Error("Discount value cannot be negative.");
    }

    if (
        data.endsAt &&
        data.endsAt.getTime() <= data.startsAt.getTime()
    ) {
        throw new Error("End date must be after start date.");
    }

    return prisma.productDiscount.create({
        data: {
            productId: data.productId,
            name: data.name,
            type: data.type,
            value: data.value,
            maxDiscount: data.maxDiscount ?? null,
            startsAt: data.startsAt,
            endsAt: data.endsAt ?? null,
            isActive: data.isActive ?? true,
        },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    vendorId: true,
                },
            },
        },
    });
};

// ============================================================
// GET DISCOUNT BY ID
// ============================================================

export const getProductDiscountById = async (
    id: bigint,
) => {
    const discount = await prisma.productDiscount.findUnique({
        where: {
            id,
        },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    vendorId: true,
                },
            },
        },
    });

    if (!discount) {
        throw new Error("Product discount not found.");
    }

    return discount;
};

// ============================================================
// GET ALL PRODUCT DISCOUNTS
// ============================================================

export const getProductDiscounts = async (params?: {
    productId?: bigint;
    isActive?: boolean;
    page?: number;
    limit?: number;
}) => {
    const page = Math.max(params?.page ?? 1, 1);
    const limit = Math.min(Math.max(params?.limit ?? 20, 1), 100);

    const where: Prisma.ProductDiscountWhereInput = {
        ...(params?.productId
            ? {
                  productId: params.productId,
              }
            : {}),

        ...(params?.isActive !== undefined
            ? {
                  isActive: params.isActive,
              }
            : {}),
    };

    const [data, total] = await prisma.$transaction([
        prisma.productDiscount.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        vendorId: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip: (page - 1) * limit,
            take: limit,
        }),

        prisma.productDiscount.count({
            where,
        }),
    ]);

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ============================================================
// GET ACTIVE DISCOUNTS FOR PRODUCT
// ============================================================

export const getActiveProductDiscounts = async (
    productId: bigint,
) => {
    const now = new Date();

    return prisma.productDiscount.findMany({
        where: {
            productId,
            isActive: true,
            startsAt: {
                lte: now,
            },
            OR: [
                {
                    endsAt: null,
                },
                {
                    endsAt: {
                        gte: now,
                    },
                },
            ],
        },
        orderBy: {
            value: "desc",
        },
    });
};

// ============================================================
// UPDATE PRODUCT DISCOUNT
// ============================================================

export const updateProductDiscount = async (
    id: bigint,
    data: UpdateProductDiscountInput,
) => {
    const existing = await prisma.productDiscount.findUnique({
        where: {
            id,
        },
    });

    if (!existing) {
        throw new Error("Product discount not found.");
    }

    const type = data.type ?? existing.type;
    const value =
        data.value !== undefined
            ? Number(data.value)
            : Number(existing.value);

    if (value < 0) {
        throw new Error("Discount value cannot be negative.");
    }

    if (
        type === DiscountType.PERCENTAGE &&
        value > 100
    ) {
        throw new Error("Percentage discount cannot exceed 100%.");
    }

    const startsAt = data.startsAt ?? existing.startsAt;
    const endsAt =
        data.endsAt !== undefined
            ? data.endsAt
            : existing.endsAt;

    if (
        endsAt &&
        endsAt.getTime() <= startsAt.getTime()
    ) {
        throw new Error("End date must be after start date.");
    }

    return prisma.productDiscount.update({
        where: {
            id,
        },
        data: {
            ...(data.name !== undefined && {
                name: data.name,
            }),

            ...(data.type !== undefined && {
                type: data.type,
            }),

            ...(data.value !== undefined && {
                value: data.value,
            }),

            ...(data.maxDiscount !== undefined && {
                maxDiscount: data.maxDiscount,
            }),

            ...(data.startsAt !== undefined && {
                startsAt: data.startsAt,
            }),

            ...(data.endsAt !== undefined && {
                endsAt: data.endsAt,
            }),

            ...(data.isActive !== undefined && {
                isActive: data.isActive,
            }),
        },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    vendorId: true,
                },
            },
        },
    });
};

// ============================================================
// DELETE PRODUCT DISCOUNT
// ============================================================

export const deleteProductDiscount = async (
    id: bigint,
) => {
    const existing = await prisma.productDiscount.findUnique({
        where: {
            id,
        },
    });

    if (!existing) {
        throw new Error("Product discount not found.");
    }

    await prisma.productDiscount.delete({
        where: {
            id,
        },
    });

    return {
        id,
        deleted: true,
    };
};

// ============================================================
// TOGGLE DISCOUNT STATUS
// ============================================================

export const toggleProductDiscountStatus = async (
    id: bigint,
) => {
    const discount = await prisma.productDiscount.findUnique({
        where: {
            id,
        },
    });

    if (!discount) {
        throw new Error("Product discount not found.");
    }

    return prisma.productDiscount.update({
        where: {
            id,
        },
        data: {
            isActive: !discount.isActive,
        },
    });
};