import { Request, Response } from "express";
import { DiscountType } from "@prisma/client";

import {
    createCoupon,
    getCouponById,
    getCoupons,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    getUserCouponUsages,
} from "../services/couponService.js";

import { serializeBigInt } from "../utils/serializeBigInt.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// ============================================================
// HELPERS (to handle Express params/query safely)
// ============================================================

/**
 * Extract a single string from Express param/query value.
 */
const getSingleParam = (value: unknown): string | undefined => {
    if (typeof value === "string") {
        return value;
    }
    if (Array.isArray(value)) {
        // Return the first string element
        for (const item of value) {
            if (typeof item === "string") {
                return item;
            }
        }
    }
    return undefined;
};

/**
 * Convert a route parameter to BigInt safely.
 */
const getBigIntParam = (value: unknown): bigint => {
    const singleValue = getSingleParam(value);
    if (!singleValue) {
        throw new Error("ID is required.");
    }
    try {
        return BigInt(singleValue);
    } catch {
        throw new Error("Invalid ID.");
    }
};

// ============================================================
// CREATE COUPON
// ============================================================

export const createCouponController = async (
    req: Request,
    res: Response,
) => {
    try {
        const {
            code,
            name,
            description,
            type,
            value,
            minOrderAmount,
            maxDiscount,
            usageLimit,
            perUserLimit,
            startsAt,
            endsAt,
            isActive,
            isGlobal,
            productIds,
        } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required.",
            });
        }

        if (
            !Object.values(
                DiscountType,
            ).includes(type)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "type must be PERCENTAGE or FIXED.",
            });
        }

        if (value === undefined) {
            return res.status(400).json({
                success: false,
                message:
                    "Coupon value is required.",
            });
        }

        if (!startsAt) {
            return res.status(400).json({
                success: false,
                message:
                    "startsAt is required.",
            });
        }

        const coupon =
            await createCoupon({
                code,
                name,
                description,
                type,
                value,
                minOrderAmount:
                    minOrderAmount ?? null,
                maxDiscount:
                    maxDiscount ?? null,
                usageLimit:
                    usageLimit ?? null,
                perUserLimit:
                    perUserLimit ?? 1,
                startsAt: new Date(
                    startsAt,
                ),
                endsAt: endsAt
                    ? new Date(endsAt)
                    : null,
                isActive:
                    isActive ?? true,
                isGlobal:
                    isGlobal ?? true,
                productIds:
                    Array.isArray(productIds)
                        ? productIds.map(
                              (id: string) =>
                                  BigInt(id),
                          )
                        : [],
            });

        return res.status(201).json({
            success: true,
            message:
                "Coupon created successfully.",
            data: serializeBigInt(
                coupon,
            ),
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Failed to create coupon.",
        });
    }
};

// ============================================================
// GET COUPONS
// ============================================================

export const getCouponList = async (
    req: Request,
    res: Response,
) => {
    try {
        const {
            isActive,
            isGlobal,
            page,
            limit,
        } = req.query;

        const result =
            await getCoupons({
                isActive:
                    isActive !== undefined
                        ? String(
                              isActive,
                          ) === "true"
                        : undefined,

                isGlobal:
                    isGlobal !== undefined
                        ? String(
                              isGlobal,
                          ) === "true"
                        : undefined,

                page: page
                    ? Number(page)
                    : undefined,

                limit: limit
                    ? Number(limit)
                    : undefined,
            });

        return res.json({
            success: true,
            message:
                "Coupons retrieved successfully.",
            ...serializeBigInt(result),
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Failed to retrieve coupons.",
        });
    }
};

// ============================================================
// GET COUPON
// ============================================================

export const getCoupon = async (
    req: Request,
    res: Response,
) => {
    try {
        const coupon =
            await getCouponById(
                getBigIntParam(req.params.id),
            );

        return res.json({
            success: true,
            message:
                "Coupon retrieved successfully.",
            data: serializeBigInt(
                coupon,
            ),
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message:
                error.message ||
                "Coupon not found.",
        });
    }
};

// ============================================================
// UPDATE
// ============================================================

export const updateCouponController =
    async (
        req: Request,
        res: Response,
    ) => {
        try {
            const {
                code,
                name,
                description,
                type,
                value,
                minOrderAmount,
                maxDiscount,
                usageLimit,
                perUserLimit,
                startsAt,
                endsAt,
                isActive,
                isGlobal,
                productIds,
            } = req.body;

            if (
                type !== undefined &&
                !Object.values(
                    DiscountType,
                ).includes(type)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid coupon type.",
                });
            }

            const coupon =
                await updateCoupon(
                    getBigIntParam(req.params.id),
                    {
                        code,
                        name,
                        description,
                        type,
                        value,
                        minOrderAmount,
                        maxDiscount,
                        usageLimit,
                        perUserLimit,
                        startsAt: startsAt
                            ? new Date(
                                  startsAt,
                              )
                            : undefined,
                        endsAt:
                            endsAt === null
                                ? null
                                : endsAt
                                ? new Date(
                                      endsAt,
                                  )
                                : undefined,
                        isActive,
                        isGlobal,
                        productIds:
                            productIds !==
                            undefined
                                ? productIds.map(
                                      (
                                          id: string,
                                      ) =>
                                          BigInt(
                                              id,
                                          ),
                                  )
                                : undefined,
                    },
                );

            return res.json({
                success: true,
                message:
                    "Coupon updated successfully.",
                data: serializeBigInt(
                    coupon,
                ),
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message:
                    error.message ||
                    "Failed to update coupon.",
            });
        }
    };

// ============================================================
// DELETE
// ============================================================

export const deleteCouponController =
    async (
        req: Request,
        res: Response,
    ) => {
        try {
            const result =
                await deleteCoupon(
                    getBigIntParam(req.params.id),
                );

            return res.json({
                success: true,
                message:
                    "Coupon deleted successfully.",
                data: serializeBigInt(
                    result,
                ),
            });
        } catch (error: any) {
            return res.status(404).json({
                success: false,
                message:
                    error.message ||
                    "Failed to delete coupon.",
            });
        }
    };

// ============================================================
// TOGGLE
// ============================================================

export const toggleCoupon =
    async (
        req: Request,
        res: Response,
    ) => {
        try {
            const coupon =
                await toggleCouponStatus(
                    getBigIntParam(req.params.id),
                );

            return res.json({
                success: true,
                message:
                    "Coupon status updated successfully.",
                data: serializeBigInt(
                    coupon,
                ),
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message:
                    error.message ||
                    "Failed to update coupon status.",
            });
        }
    };

// ============================================================
// VALIDATE COUPON
// ============================================================

export const validateCouponController = async (
    req: AuthRequest,
    res: Response,
) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const {
            code,
            subtotal,
            productIds,
        } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required.",
            });
        }

        if (subtotal === undefined) {
            return res.status(400).json({
                success: false,
                message: "Subtotal is required.",
            });
        }

        if (!Array.isArray(productIds)) {
            return res.status(400).json({
                success: false,
                message: "productIds must be an array.",
            });
        }

        const result = await validateCoupon({
            code,
            userId: BigInt(userId),
            subtotal: Number(subtotal),
            productIds: productIds.map(
                (id: string) => BigInt(id),
            ),
        });

        return res.json({
            success: true,
            message: "Coupon is valid.",
            data: serializeBigInt(result),
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Invalid coupon.",
        });
    }
};


    
// ============================================================
// MY COUPON USAGE
// ============================================================

export const getMyCouponUsages =
    async (
        req: Request,
        res: Response,
    ) => {
        try {
            // Cast req to any to access the 'user' property
            const userId =
                (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Authentication required.",
                });
            }

            const usages =
                await getUserCouponUsages(
                    BigInt(userId),
                );

            return res.json({
                success: true,
                message:
                    "Coupon usage history retrieved successfully.",
                data: serializeBigInt(
                    usages,
                ),
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message:
                    error.message ||
                    "Failed to retrieve coupon usage.",
            });
        }
    };