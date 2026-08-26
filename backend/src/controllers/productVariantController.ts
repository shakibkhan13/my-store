import {
    Request,
    Response,
    NextFunction,
} from "express";

import * as variantService
    from "../services/productVariantService.js";

import { serializeBigInt } from "../utils/serializeBigInt.js";

const numberOrNull = (
    value: unknown
): number | null => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isNaN(number)
        ? null
        : number;
};

export const createVariant = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            productId,
            sku,
            barcode,
            price,
            compareAtPrice,
            costPrice,
            weight,
            stockQuantity,
            reservedQuantity,
            lowStockThreshold,
            isActive,
        } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "productId is required.",
            });
        }

        if (!sku) {
            return res.status(400).json({
                success: false,
                message: "SKU is required.",
            });
        }

        if (
            price === undefined ||
            price === null ||
            price === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Price is required.",
            });
        }

        const variant =
            await variantService.createVariant({
                productId:
                    BigInt(String(productId)),

                sku: String(sku),

                barcode:
                    barcode || null,

                price: Number(price),

                compareAtPrice:
                    numberOrNull(compareAtPrice),

                costPrice:
                    numberOrNull(costPrice),

                weight:
                    numberOrNull(weight),

                stockQuantity:
                    stockQuantity !== undefined
                        ? Number(stockQuantity)
                        : 0,

                reservedQuantity:
                    reservedQuantity !== undefined
                        ? Number(reservedQuantity)
                        : 0,

                lowStockThreshold:
                    lowStockThreshold !== undefined
                        ? Number(lowStockThreshold)
                        : 5,

                isActive:
                    isActive === undefined
                        ? true
                        : isActive === true ||
                          isActive === "true",
            });

        return res.status(201).json({
            success: true,
            message: "Product variant created successfully.",
            data: serializeBigInt(variant),
        });
    } catch (error) {
        next(error);
    }
};

export const getVariants = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = req.query.productId
            ? BigInt(String(req.query.productId))
            : undefined;

        const variants =
            await variantService.getVariants(
                productId
            );

        return res.status(200).json({
            success: true,
            data: serializeBigInt(variants),
        });
    } catch (error) {
        next(error);
    }
};

export const getVariantById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = BigInt(
            String(req.params.id)
        );

        const variant =
            await variantService.getVariantById(id);

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Product variant not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: serializeBigInt(variant),
        });
    } catch (error) {
        next(error);
    }
};

export const updateVariant = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = BigInt(
            String(req.params.id)
        );

        const {
            productId,
            sku,
            barcode,
            price,
            compareAtPrice,
            costPrice,
            weight,
            stockQuantity,
            reservedQuantity,
            lowStockThreshold,
            isActive,
        } = req.body;

        const data: any = {};

        if (productId !== undefined) {
            data.productId =
                BigInt(String(productId));
        }

        if (sku !== undefined) {
            data.sku = String(sku);
        }

        if (barcode !== undefined) {
            data.barcode =
                barcode || null;
        }

        if (price !== undefined) {
            data.price = Number(price);
        }

        if (compareAtPrice !== undefined) {
            data.compareAtPrice =
                numberOrNull(compareAtPrice);
        }

        if (costPrice !== undefined) {
            data.costPrice =
                numberOrNull(costPrice);
        }

        if (weight !== undefined) {
            data.weight =
                numberOrNull(weight);
        }

        if (stockQuantity !== undefined) {
            data.stockQuantity =
                Number(stockQuantity);
        }

        if (reservedQuantity !== undefined) {
            data.reservedQuantity =
                Number(reservedQuantity);
        }

        if (lowStockThreshold !== undefined) {
            data.lowStockThreshold =
                Number(lowStockThreshold);
        }

        if (isActive !== undefined) {
            data.isActive =
                isActive === true ||
                isActive === "true";
        }

        const variant =
            await variantService.updateVariant(
                id,
                data
            );

        return res.status(200).json({
            success: true,
            message: "Product variant updated successfully.",
            data: serializeBigInt(variant),
        });
    } catch (error) {
        next(error);
    }
};

export const deleteVariant = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = BigInt(
            String(req.params.id)
        );

        await variantService.deleteVariant(id);

        return res.status(200).json({
            success: true,
            message: "Product variant deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};