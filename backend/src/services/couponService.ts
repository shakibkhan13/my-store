import prisma from "../config/db.js";
import { DiscountType, Prisma } from "@prisma/client";

// ============================================================
// TYPES
// ============================================================

interface CreateCouponInput {
    code: string;
    name?: string;
    description?: string;
    type: DiscountType;
    value: Prisma.Decimal | number | string;
    minOrderAmount?: Prisma.Decimal | number | string | null;
    maxDiscount?: Prisma.Decimal | number | string | null;
    usageLimit?: number | null;
    perUserLimit?: number;
    startsAt: Date;
    endsAt?: Date | null;
    isActive?: boolean;
    isGlobal?: boolean;
    productIds?: bigint[];
}

interface UpdateCouponInput {
    code?: string;
    name?: string;
    description?: string;
    type?: DiscountType;
    value?: Prisma.Decimal | number | string;
    minOrderAmount?: Prisma.Decimal | number | string | null;
    maxDiscount?: Prisma.Decimal | number | string | null;
    usageLimit?: number | null;
    perUserLimit?: number;
    startsAt?: Date;
    endsAt?: Date | null;
    isActive?: boolean;
    isGlobal?: boolean;
    productIds?: bigint[];
}

// ============================================================
// NORMALIZE CODE
// ============================================================

const normalizeCouponCode = (code: string) => {
    return code.trim().toUpperCase();
};

// ============================================================
// VALIDATE COUPON DATA
// ============================================================

const validateCouponData = (
    type: DiscountType,
    value: number,
    startsAt: Date,
    endsAt?: Date | null,
) => {
    if (!value || value <= 0) {
        throw new Error("Coupon value must be greater than zero.");
    }

    if (
        type === DiscountType.PERCENTAGE &&
        value > 100
    ) {
        throw new Error("Percentage coupon cannot exceed 100%.");
    }

    if (
        endsAt &&
        endsAt.getTime() <= startsAt.getTime()
    ) {
        throw new Error("End date must be after start date.");
    }
};

// ============================================================
// HELPER: VALIDATE PRODUCT IDs
// ============================================================

const validateProductIds = async (productIds: bigint[]) => {
    if (productIds.length === 0) {
        return; // no products to validate
    }

    const existingProducts = await prisma.product.findMany({
        where: {
            id: { in: productIds },
        },
        select: { id: true },
    });

    const existingIds = existingProducts.map(p => p.id);
    const missingIds = productIds.filter(id => !existingIds.includes(id));

    if (missingIds.length > 0) {
        throw new Error(`The following product IDs do not exist: ${missingIds.join(', ')}`);
    }
};

// ============================================================
// CREATE COUPON
// ============================================================

export const createCoupon = async (
    data: CreateCouponInput,
) => {
    const code = normalizeCouponCode(data.code);

    validateCouponData(
        data.type,
        Number(data.value),
        data.startsAt,
        data.endsAt,
    );

    if (
        data.usageLimit !== null &&
        data.usageLimit !== undefined &&
        data.usageLimit < 1
    ) {
        throw new Error("Usage limit must be at least 1.");
    }

    if (
        data.perUserLimit !== undefined &&
        data.perUserLimit < 1
    ) {
        throw new Error("Per-user limit must be at least 1.");
    }

    const existing = await prisma.coupon.findUnique({
        where: {
            code,
        },
    });

    if (existing) {
        throw new Error("Coupon code already exists.");
    }

    // ------------------------------------------------------------
    // VALIDATE PRODUCT IDs (if provided)
    // ------------------------------------------------------------
    const productIds = data.productIds || [];
    if (!data.isGlobal && productIds.length === 0) {
        throw new Error(
            "Product-specific coupon must have at least one product.",
        );
    }

    if (productIds.length > 0) {
        await validateProductIds(productIds);
    }

    return prisma.$transaction(async (tx) => {
        const coupon = await tx.coupon.create({
            data: {
                code,
                name: data.name,
                description: data.description,
                type: data.type,
                value: data.value,
                minOrderAmount: data.minOrderAmount ?? null,
                maxDiscount: data.maxDiscount ?? null,
                usageLimit: data.usageLimit ?? null,
                perUserLimit: data.perUserLimit ?? 1,
                startsAt: data.startsAt,
                endsAt: data.endsAt ?? null,
                isActive: data.isActive ?? true,
                isGlobal: data.isGlobal ?? true,
            },
        });

        if (!data.isGlobal && productIds.length > 0) {
            await tx.couponProduct.createMany({
                data: productIds.map((productId) => ({
                    couponId: coupon.id,
                    productId,
                })),
                skipDuplicates: true,
            });
        }

        return tx.coupon.findUnique({
            where: {
                id: coupon.id,
            },
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });
    });
};

// ============================================================
// GET COUPON BY ID
// ============================================================

export const getCouponById = async (
    id: bigint,
) => {
    const coupon = await prisma.coupon.findUnique({
        where: {
            id,
        },
        include: {
            products: {
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
            },
            _count: {
                select: {
                    usages: true,
                },
            },
        },
    });

    if (!coupon) {
        throw new Error("Coupon not found.");
    }

    return coupon;
};

// ============================================================
// GET COUPONS
// ============================================================

export const getCoupons = async (params?: {
    isActive?: boolean;
    isGlobal?: boolean;
    page?: number;
    limit?: number;
}) => {
    const page = Math.max(params?.page ?? 1, 1);
    const limit = Math.min(
        Math.max(params?.limit ?? 20, 1),
        100,
    );

    const where: Prisma.CouponWhereInput = {
        ...(params?.isActive !== undefined && {
            isActive: params.isActive,
        }),

        ...(params?.isGlobal !== undefined && {
            isGlobal: params.isGlobal,
        }),
    };

    const [data, total] = await prisma.$transaction([
        prisma.coupon.findMany({
            where,
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        usages: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip: (page - 1) * limit,
            take: limit,
        }),

        prisma.coupon.count({
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
// UPDATE COUPON
// ============================================================

export const updateCoupon = async (
    id: bigint,
    data: UpdateCouponInput,
) => {
    const existing = await prisma.coupon.findUnique({
        where: {
            id,
        },
    });

    if (!existing) {
        throw new Error("Coupon not found.");
    }

    const code = data.code
        ? normalizeCouponCode(data.code)
        : existing.code;

    if (data.code && code !== existing.code) {
        const duplicate = await prisma.coupon.findUnique({
            where: {
                code,
            },
        });

        if (duplicate) {
            throw new Error("Coupon code already exists.");
        }
    }

    const type = data.type ?? existing.type;

    const value =
        data.value !== undefined
            ? Number(data.value)
            : Number(existing.value);

    const startsAt =
        data.startsAt ?? existing.startsAt;

    const endsAt =
        data.endsAt !== undefined
            ? data.endsAt
            : existing.endsAt;

    validateCouponData(
        type,
        value,
        startsAt,
        endsAt,
    );

    const isGlobal =
        data.isGlobal !== undefined
            ? data.isGlobal
            : existing.isGlobal;

    // ------------------------------------------------------------
    // VALIDATE PRODUCT IDs (if provided)
    // ------------------------------------------------------------
    const productIds = data.productIds;
    if (productIds !== undefined) {
        if (!isGlobal && productIds.length === 0) {
            throw new Error(
                "Product-specific coupon must have at least one product.",
            );
        }
        if (productIds.length > 0) {
            await validateProductIds(productIds);
        }
    }

    return prisma.$transaction(async (tx) => {
        const coupon = await tx.coupon.update({
            where: {
                id,
            },
            data: {
                ...(data.code !== undefined && {
                    code,
                }),

                ...(data.name !== undefined && {
                    name: data.name,
                }),

                ...(data.description !== undefined && {
                    description: data.description,
                }),

                ...(data.type !== undefined && {
                    type: data.type,
                }),

                ...(data.value !== undefined && {
                    value: data.value,
                }),

                ...(data.minOrderAmount !== undefined && {
                    minOrderAmount: data.minOrderAmount,
                }),

                ...(data.maxDiscount !== undefined && {
                    maxDiscount: data.maxDiscount,
                }),

                ...(data.usageLimit !== undefined && {
                    usageLimit: data.usageLimit,
                }),

                ...(data.perUserLimit !== undefined && {
                    perUserLimit: data.perUserLimit,
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

                ...(data.isGlobal !== undefined && {
                    isGlobal: data.isGlobal,
                }),
            },
        });

        // Handle product associations
        if (data.productIds !== undefined) {
            // Delete all existing associations
            await tx.couponProduct.deleteMany({
                where: {
                    couponId: id,
                },
            });

            // Re-create if coupon is not global and we have products
            if (!isGlobal && data.productIds.length > 0) {
                await tx.couponProduct.createMany({
                    data: data.productIds.map((productId) => ({
                        couponId: id,
                        productId,
                    })),
                    skipDuplicates: true,
                });
            }
        }

        return tx.coupon.findUnique({
            where: {
                id: coupon.id,
            },
            include: {
                products: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });
    });
};

// ============================================================
// DELETE COUPON
// ============================================================

export const deleteCoupon = async (
    id: bigint,
) => {
    const coupon = await prisma.coupon.findUnique({
        where: {
            id,
        },
    });

    if (!coupon) {
        throw new Error("Coupon not found.");
    }

    await prisma.coupon.delete({
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
// TOGGLE COUPON
// ============================================================

export const toggleCouponStatus = async (
    id: bigint,
) => {
    const coupon = await prisma.coupon.findUnique({
        where: {
            id,
        },
    });

    if (!coupon) {
        throw new Error("Coupon not found.");
    }

    return prisma.coupon.update({
        where: {
            id,
        },
        data: {
            isActive: !coupon.isActive,
        },
    });
};

// ============================================================
// GET USER COUPON USAGE COUNT
// ============================================================

export const getUserCouponUsageCount = async (
    couponId: bigint,
    userId: bigint,
) => {
    return prisma.couponUsage.count({
        where: {
            couponId,
            userId,
        },
    });
};

// ============================================================
// VALIDATE COUPON
// ============================================================

export const validateCoupon = async (params: {
    code: string;
    userId: bigint;
    subtotal: number;
    productIds: bigint[];
}) => {
    const code = normalizeCouponCode(params.code);

    const coupon = await prisma.coupon.findUnique({
        where: {
            code,
        },
        include: {
            products: true,
        },
    });

    if (!coupon) {
        throw new Error("Invalid coupon code.");
    }

    const now = new Date();

    if (!coupon.isActive) {
        throw new Error("This coupon is inactive.");
    }

    if (coupon.startsAt > now) {
        throw new Error("This coupon is not active yet.");
    }

    if (
        coupon.endsAt &&
        coupon.endsAt < now
    ) {
        throw new Error("This coupon has expired.");
    }

    if (
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
    ) {
        throw new Error("Coupon usage limit has been reached.");
    }

    const userUsageCount =
        await getUserCouponUsageCount(
            coupon.id,
            params.userId,
        );

    if (
        userUsageCount >= coupon.perUserLimit
    ) {
        throw new Error(
            "You have already reached the usage limit for this coupon.",
        );
    }

    const subtotal = Number(params.subtotal);

    if (
        coupon.minOrderAmount !== null &&
        subtotal < Number(coupon.minOrderAmount)
    ) {
        throw new Error(
            `Minimum order amount is ${coupon.minOrderAmount}.`,
        );
    }

    // --------------------------------------------------------
    // PRODUCT-SPECIFIC COUPON
    // --------------------------------------------------------

    if (!coupon.isGlobal) {
        const eligibleProductIds =
            coupon.products.map(
                (item) => item.productId.toString(),
            );

        const hasEligibleProduct =
            params.productIds.some((id) =>
                eligibleProductIds.includes(
                    id.toString(),
                ),
            );

        if (!hasEligibleProduct) {
            throw new Error(
                "This coupon is not applicable to the selected products.",
            );
        }
    }

    // --------------------------------------------------------
    // CALCULATE DISCOUNT
    // --------------------------------------------------------

    let discountAmount = 0;

    if (coupon.type === DiscountType.PERCENTAGE) {
        discountAmount =
            (subtotal * Number(coupon.value)) / 100;
    } else {
        discountAmount = Number(coupon.value);
    }

    if (
        coupon.maxDiscount !== null &&
        discountAmount >
            Number(coupon.maxDiscount)
    ) {
        discountAmount =
            Number(coupon.maxDiscount);
    }

    if (discountAmount > subtotal) {
        discountAmount = subtotal;
    }

    discountAmount = Number(
        discountAmount.toFixed(2),
    );

    return {
        couponId: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        subtotal,
        discountAmount,
        payableAmount: Number(
            (subtotal - discountAmount).toFixed(2),
        ),
    };
};

// ============================================================
// REDEEM COUPON
// ============================================================

export const redeemCoupon = async (params: {
    couponId: bigint;
    userId: bigint;
    orderId: bigint;
    discountAmount: number;
}) => {
    return prisma.$transaction(
        async (tx) => {
            const coupon =
                await tx.coupon.findUnique({
                    where: {
                        id: params.couponId,
                    },
                });

            if (!coupon) {
                throw new Error(
                    "Coupon not found.",
                );
            }

            // ------------------------------------------------
            // CHECK USAGE LIMIT AT TRANSACTION LEVEL
            // ------------------------------------------------

            if (
                coupon.usageLimit !== null
            ) {
                const updated =
                    await tx.coupon.updateMany({
                        where: {
                            id: params.couponId,
                            isActive: true,
                            usedCount: {
                                lt: coupon.usageLimit,
                            },
                        },
                        data: {
                            usedCount: {
                                increment: 1,
                            },
                        },
                    });

                if (updated.count !== 1) {
                    throw new Error(
                        "Coupon usage limit has been reached.",
                    );
                }
            } else {
                await tx.coupon.update({
                    where: {
                        id: params.couponId,
                    },
                    data: {
                        usedCount: {
                            increment: 1,
                        },
                    },
                });
            }

            // ------------------------------------------------
            // CHECK DUPLICATE ORDER USAGE
            // ------------------------------------------------

            const existingUsage =
                await tx.couponUsage.findUnique({
                    where: {
                        couponId_orderId: {
                            couponId:
                                params.couponId,
                            orderId:
                                params.orderId,
                        },
                    },
                });

            if (existingUsage) {
                throw new Error(
                    "Coupon has already been applied to this order.",
                );
            }

            // ------------------------------------------------
            // USER LIMIT
            // ------------------------------------------------

            const userUsageCount =
                await tx.couponUsage.count({
                    where: {
                        couponId:
                            params.couponId,
                        userId:
                            params.userId,
                    },
                });

            if (
                userUsageCount >=
                coupon.perUserLimit
            ) {
                throw new Error(
                    "User coupon usage limit has been reached.",
                );
            }

            // ------------------------------------------------
            // CREATE USAGE
            // ------------------------------------------------

            return tx.couponUsage.create({
                data: {
                    couponId:
                        params.couponId,
                    userId:
                        params.userId,
                    orderId:
                        params.orderId,
                    discountAmount:
                        params.discountAmount,
                },
            });
        },
    );
};

// ============================================================
// GET USER COUPON HISTORY
// ============================================================

export const getUserCouponUsages = async (
    userId: bigint,
) => {
    return prisma.couponUsage.findMany({
        where: {
            userId,
        },
        include: {
            coupon: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    type: true,
                    value: true,
                },
            },
            order: {
                select: {
                    id: true,
                    orderNumber: true,
                    grandTotal: true,
                    createdAt: true,
                },
            },
        },
        orderBy: {
            usedAt: "desc",
        },
    });
};