import {
    Request,
    Response,
    NextFunction,
} from "express";

import * as imageService
    from "../services/productImageService.js";

import { serializeBigInt } from "../utils/serializeBigInt.js";

export const uploadProductImage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            productId,
            altText,
            sortOrder,
            isPrimary,
        } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "productId is required.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required.",
            });
        }

        const imageUrl =
            `/upload/${req.file.filename}`;

        const image =
            await imageService.createProductImage({
                productId:
                    BigInt(String(productId)),

                imageUrl,

                altText:
                    altText || null,

                sortOrder:
                    sortOrder
                        ? Number(sortOrder)
                        : 0,

                isPrimary:
                    isPrimary === true ||
                    isPrimary === "true",
            });

        return res.status(201).json({
            success: true,
            message: "Product image uploaded successfully.",
            data: serializeBigInt(image),
        });
    } catch (error) {
        next(error);
    }
};

export const getProductImages = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = BigInt(
            String(req.params.productId)
        );

        const images =
            await imageService.getProductImages(
                productId
            );

        return res.status(200).json({
            success: true,
            data: serializeBigInt(images),
        });
    } catch (error) {
        next(error);
    }
};

export const getProductImageById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = BigInt(
            String(req.params.id)
        );

        const image =
            await imageService.getProductImageById(
                id
            );

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Product image not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: serializeBigInt(image),
        });
    } catch (error) {
        next(error);
    }
};

export const updateProductImage = async (
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
            altText,
            sortOrder,
            isPrimary,
        } = req.body;

        const data: any = {};

        if (productId !== undefined) {
            data.productId =
                BigInt(String(productId));
        }

        if (altText !== undefined) {
            data.altText =
                altText || null;
        }

        if (sortOrder !== undefined) {
            data.sortOrder =
                Number(sortOrder);
        }

        if (isPrimary !== undefined) {
            data.isPrimary =
                isPrimary === true ||
                isPrimary === "true";
        }

        if (req.file) {
            data.imageUrl =
                `/upload/${req.file.filename}`;
        }

        const image =
            await imageService.updateProductImage(
                id,
                data
            );

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Product image not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product image updated successfully.",
            data: serializeBigInt(image),
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProductImage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = BigInt(
            String(req.params.id)
        );

        await imageService.deleteProductImage(
            id
        );

        return res.status(200).json({
            success: true,
            message: "Product image deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};