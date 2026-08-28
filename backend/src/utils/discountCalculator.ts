import prisma from "../config/db.js";
import { DiscountType } from "@prisma/client";

// ============================================================
// TYPES
// ============================================================

export interface DiscountCalculationItem {
    variantId: bigint;
    quantity: number;
}

export interface DiscountResult {
    productDiscount: number;
    couponDiscount: number;
    totalDiscount: number;
    subtotal: number;
    payableSubtotal: number;
}

// ============================================================
// ROUND MONEY
// ============================================================

const roundMoney = (amount: number) => {
    return Number(amount.toFixed(2));
};

// ============================================================
// CALCULATE PRODUCT DISCOUNT
// ============================================================

export const calculateProductDiscount = async (
    items: DiscountCalculationItem[],
) => {
    if (items.length === 0) {
        return 0;
    }

    const variantIds = items.map(
        (item) => item.variantId,
    );

    const variants =
        await prisma.productVariant.findMany({
            where: {
                id: {
                    in: variantIds,
                },
                isActive: true,
            },
            include: {
                product: {
                    include: {
                        discounts: {
                            where: {
                                isActive: true,
                                startsAt: {
                                    lte: new Date(),
                                },
                                OR: [
                                    {
                                        endsAt: null,
                                    },
                                    {
                                        endsAt: {
                                            gte: new Date(),
                                        },
                                    },
                                ],
                            },
                            orderBy: {
                                value: "desc",
                            },
                        },
                    },
                },
            },
        });

    let totalDiscount = 0;

    for (const item of items) {
        const variant = variants.find(
            (v) =>
                v.id === item.variantId,
        );

        if (!variant) {
            continue;
        }

        const quantity = Math.max(
            item.quantity,
            1,
        );

        const unitPrice =
            Number(variant.price);

        const lineSubtotal =
            unitPrice * quantity;

        const discounts =
            variant.product.discounts;

        if (discounts.length === 0) {
            continue;
        }

        // Highest effective discount
        let bestDiscount = 0;

        for (const discount of discounts) {
            let amount = 0;

            if (
                discount.type ===
                DiscountType.PERCENTAGE
            ) {
                amount =
                    (lineSubtotal *
                        Number(
                            discount.value,
                        )) /
                    100;
            } else {
                amount =
                    Number(
                        discount.value,
                    ) * quantity;
            }

            if (
                discount.maxDiscount !==
                    null &&
                amount >
                    Number(
                        discount.maxDiscount,
                    )
            ) {
                amount = Number(
                    discount.maxDiscount,
                );
            }

            if (amount > bestDiscount) {
                bestDiscount = amount;
            }
        }

        totalDiscount += bestDiscount;
    }

    return roundMoney(totalDiscount);
};

// ============================================================
// CALCULATE COMPLETE DISCOUNT
// ============================================================

export const calculateDiscount = async (params: {
    items: DiscountCalculationItem[];
    couponCode?: string;
    userId?: bigint;
}) => {
    if (params.items.length === 0) {
        return {
            productDiscount: 0,
            couponDiscount: 0,
            totalDiscount: 0,
            subtotal: 0,
            payableSubtotal: 0,
        };
    }

    const variantIds = params.items.map(
        (item) => item.variantId,
    );

    const variants =
        await prisma.productVariant.findMany({
            where: {
                id: {
                    in: variantIds,
                },
            },
            select: {
                id: true,
                price: true,
                productId: true,
            },
        });

    let subtotal = 0;

    for (const item of params.items) {
        const variant = variants.find(
            (v) =>
                v.id === item.variantId,
        );

        if (!variant) {
            throw new Error(
                `Variant ${item.variantId} not found.`,
            );
        }

        subtotal +=
            Number(variant.price) *
            Math.max(item.quantity, 1);
    }

    subtotal = roundMoney(subtotal);

    const productDiscount =
        await calculateProductDiscount(
            params.items,
        );

    let couponDiscount = 0;

    if (
        params.couponCode &&
        params.userId
    ) {
        const productIds =
            variants.map(
                (v) => v.productId,
            );

        const {
            validateCoupon,
        } = await import(
            "../services/couponService.js"
        );

        const coupon =
            await validateCoupon({
                code: params.couponCode,
                userId:
                    params.userId,
                subtotal,
                productIds,
            });

        couponDiscount =
            coupon.discountAmount;
    }

    const totalDiscount = Math.min(
        roundMoney(
            productDiscount +
                couponDiscount,
        ),
        subtotal,
    );

    return {
        productDiscount,
        couponDiscount,
        totalDiscount,
        subtotal,
        payableSubtotal: roundMoney(
            subtotal - totalDiscount,
        ),
    };
};