import {
    Request,
    Response,
    NextFunction,
} from "express";

import * as variantImageService
    from "../services/variantImageService.js";

import { serializeBigInt } from "../utils/serializeBigInt.js";

export const uploadVariantImage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            variantId,
            sortOrder,
            isPrimary,
        } = req.body;

        if (!variantId) {
            return res.status(400).json({
                success: false,
                message: "variantId is required.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required.",
            });
        }

        const image =
            await variantImageService.createVariantImage({
                variantId:
                    BigInt(String(variantId)),

                imageUrl:
                    `/upload/${req.file.filename}`,

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
            message: "Variant image uploaded successfully.",
            data: serializeBigInt(image),
        });
    } catch (error) {
        next(error);
    }
};

export const getVariantImages = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const variantId = BigInt(
            String(req.params.variantId)
        );

        const images =
            await variantImageService.getVariantImages(
                variantId
            );

        return res.status(200).json({
            success: true,
            data: serializeBigInt(images),
        });
    } catch (error) {
        next(error);
    }
};

export const deleteVariantImage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = BigInt(
            String(req.params.id)
        );

        await variantImageService.deleteVariantImage(
            id
        );

        return res.status(200).json({
            success: true,
            message: "Variant image deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};