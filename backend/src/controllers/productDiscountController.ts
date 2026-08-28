import { Request, Response } from "express";
import { DiscountType } from "@prisma/client";

import {
    createProductDiscount,
    getProductDiscountById,
    getProductDiscounts,
    updateProductDiscount,
    deleteProductDiscount,
    toggleProductDiscountStatus,
    getActiveProductDiscounts,
} from "../services/productDiscountService.js";

import { serializeBigInt } from "../utils/serializeBigInt.js";

// ============================================================
// HELPERS
// ============================================================

/**
 * Express params/query value can be string | string[] | ParsedQs | ...
 * We only accept a single string value.
 */
const getSingleParam = (value: unknown): string | undefined => {
    if (typeof value === "string") {
        return value;
    }
    if (Array.isArray(value)) {
        // Find the first element that is a string
        for (const item of value) {
            if (typeof item === "string") {
                return item;
            }
        }
    }
    return undefined;
};

/**
 * Convert route parameter to BigInt safely.
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

/**
 * Check DiscountType safely.
 */
const isValidDiscountType = (
    value: unknown,
): value is DiscountType => {
    return (
        typeof value === "string" &&
        Object.values(DiscountType).includes(
            value as DiscountType,
        )
    );
};

// ============================================================
// CREATE
// ============================================================

export const createDiscount = async (
    req: Request,
    res: Response,
) => {
    try {
        const {
            productId,
            name,
            type,
            value,
            maxDiscount,
            startsAt,
            endsAt,
            isActive,
        } = req.body;

        // --------------------------------------------------------
        // PRODUCT ID
        // --------------------------------------------------------

        if (
            productId === undefined ||
            productId === null ||
            productId === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "productId is required.",
            });
        }

        let productIdBigInt: bigint;

        try {
            productIdBigInt = BigInt(
                String(productId),
            );
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid productId.",
            });
        }

        // --------------------------------------------------------
        // DISCOUNT TYPE
        // --------------------------------------------------------

        if (!isValidDiscountType(type)) {
            return res.status(400).json({
                success: false,
                message:
                    "type must be PERCENTAGE or FIXED.",
            });
        }

        // --------------------------------------------------------
        // VALUE
        // --------------------------------------------------------

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Discount value is required.",
            });
        }

        // --------------------------------------------------------
        // START DATE
        // --------------------------------------------------------

        if (!startsAt) {
            return res.status(400).json({
                success: false,
                message: "startsAt is required.",
            });
        }

        const startDate = new Date(startsAt);

        if (Number.isNaN(startDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid startsAt date.",
            });
        }

        // --------------------------------------------------------
        // END DATE
        // --------------------------------------------------------

        let endDate: Date | null = null;

        if (endsAt) {
            endDate = new Date(endsAt);

            if (Number.isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid endsAt date.",
                });
            }
        }

        // --------------------------------------------------------
        // CREATE
        // --------------------------------------------------------

        const discount =
            await createProductDiscount({
                productId: productIdBigInt,
                name,
                type,
                value,
                maxDiscount:
                    maxDiscount ?? null,
                startsAt: startDate,
                endsAt: endDate,
                isActive:
                    isActive ?? true,
            });

        return res.status(201).json({
            success: true,
            message:
                "Product discount created successfully.",
            data: serializeBigInt(discount),
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error?.message ||
                "Failed to create product discount.",
        });
    }
};

// ============================================================
// GET ALL
// ============================================================

export const getDiscounts = async (
    req: Request,
    res: Response,
) => {
    try {
        const {
            productId,
            isActive,
            page,
            limit,
        } = req.query;

        // --------------------------------------------------------
        // PRODUCT ID
        // --------------------------------------------------------

        let productIdBigInt: bigint | undefined;

        const productIdValue =
            getSingleParam(productId);

        if (productIdValue) {
            try {
                productIdBigInt =
                    BigInt(productIdValue);
            } catch {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid productId.",
                });
            }
        }

        // --------------------------------------------------------
        // PAGE
        // --------------------------------------------------------

        const pageValue =
            getSingleParam(page);

        const limitValue =
            getSingleParam(limit);

        const isActiveValue =
            getSingleParam(isActive);

        const parsedPage = pageValue
            ? Number(pageValue)
            : undefined;

        const parsedLimit = limitValue
            ? Number(limitValue)
            : undefined;

        // --------------------------------------------------------
        // GET DATA
        // --------------------------------------------------------

        const result =
            await getProductDiscounts({
                productId: productIdBigInt,

                isActive:
                    isActiveValue !== undefined
                        ? isActiveValue === "true"
                        : undefined,

                page: parsedPage,

                limit: parsedLimit,
            });

        return res.json({
            success: true,
            message:
                "Product discounts retrieved successfully.",
            ...serializeBigInt(result),
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error?.message ||
                "Failed to retrieve discounts.",
        });
    }
};

// ============================================================
// GET ONE
// ============================================================

export const getDiscount = async (
    req: Request,
    res: Response,
) => {
    try {
        const id = getBigIntParam(
            req.params.id,
        );

        const discount =
            await getProductDiscountById(id);

        return res.json({
            success: true,
            message:
                "Product discount retrieved successfully.",
            data: serializeBigInt(discount),
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message:
                error?.message ||
                "Product discount not found.",
        });
    }
};

// ============================================================
// ACTIVE DISCOUNTS FOR PRODUCT
// ============================================================

export const getActiveDiscounts = async (
    req: Request,
    res: Response,
) => {
    try {
        const productId =
            getBigIntParam(
                req.params.productId,
            );

        const discounts =
            await getActiveProductDiscounts(
                productId,
            );

        return res.json({
            success: true,
            message:
                "Active product discounts retrieved successfully.",
            data: serializeBigInt(discounts),
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error?.message ||
                "Failed to retrieve active discounts.",
        });
    }
};

// ============================================================
// UPDATE
// ============================================================

export const updateDiscount = async (
    req: Request,
    res: Response,
) => {
    try {
        const {
            name,
            type,
            value,
            maxDiscount,
            startsAt,
            endsAt,
            isActive,
        } = req.body;

        const id = getBigIntParam(
            req.params.id,
        );

        // --------------------------------------------------------
        // DISCOUNT TYPE
        // --------------------------------------------------------

        if (
            type !== undefined &&
            !isValidDiscountType(type)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid discount type. Type must be PERCENTAGE or FIXED.",
            });
        }

        // --------------------------------------------------------
        // START DATE
        // --------------------------------------------------------

        let startDate:
            | Date
            | undefined;

        if (startsAt) {
            startDate = new Date(startsAt);

            if (
                Number.isNaN(
                    startDate.getTime(),
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid startsAt date.",
                });
            }
        }

        // --------------------------------------------------------
        // END DATE
        // --------------------------------------------------------

        let endDate:
            | Date
            | null
            | undefined;

        if (endsAt === null) {
            endDate = null;
        } else if (endsAt) {
            endDate = new Date(endsAt);

            if (
                Number.isNaN(
                    endDate.getTime(),
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid endsAt date.",
                });
            }
        }

        // --------------------------------------------------------
        // UPDATE
        // --------------------------------------------------------

        const discount =
            await updateProductDiscount(
                id,
                {
                    name,
                    type,
                    value,
                    maxDiscount,
                    startsAt: startDate,
                    endsAt: endDate,
                    isActive,
                },
            );

        return res.json({
            success: true,
            message:
                "Product discount updated successfully.",
            data: serializeBigInt(discount),
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error?.message ||
                "Failed to update product discount.",
        });
    }
};

// ============================================================
// DELETE
// ============================================================

export const deleteDiscount = async (
    req: Request,
    res: Response,
) => {
    try {
        const id = getBigIntParam(
            req.params.id,
        );

        const result =
            await deleteProductDiscount(id);

        return res.json({
            success: true,
            message:
                "Product discount deleted successfully.",
            data: serializeBigInt(result),
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message:
                error?.message ||
                "Failed to delete product discount.",
        });
    }
};

// ============================================================
// TOGGLE
// ============================================================

export const toggleDiscount = async (
    req: Request,
    res: Response,
) => {
    try {
        const id = getBigIntParam(
            req.params.id,
        );

        const discount =
            await toggleProductDiscountStatus(
                id,
            );

        return res.json({
            success: true,
            message:
                "Product discount status updated successfully.",
            data: serializeBigInt(discount),
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error?.message ||
                "Failed to update discount status.",
        });
    }
};