import {
    Request,
    Response,
    NextFunction,
} from "express";

import * as productService from "../services/productService.js";
import { serializeBigInt } from "../utils/serializeBigInt.js";

const toBigIntOrNull = (
    value: unknown
): bigint | null => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    try {
        return BigInt(String(value));
    } catch {
        return null;
    }
};

export const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            vendorId,
            categoryId,
            brandId,
            name,
            slug,
            shortDescription,
            description,
            productType,
            status,
            isFeatured,
            seoTitle,
            seoDescription,
        } = req.body;

        if (!vendorId) {
            return res.status(400).json({
                success: false,
                message: "vendorId is required.",
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Product name is required.",
            });
        }

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Product slug is required.",
            });
        }

        const vendorIdBigInt = toBigIntOrNull(vendorId);

        if (!vendorIdBigInt) {
            return res.status(400).json({
                success: false,
                message: "Invalid vendorId.",
            });
        }

        const product = await productService.createProduct({
            vendorId: vendorIdBigInt,

            categoryId: toBigIntOrNull(categoryId),

            brandId: toBigIntOrNull(brandId),

            name: String(name),

            slug: String(slug),

            shortDescription:
                shortDescription || null,

            description:
                description || null,

            productType:
                productType || "simple",

            status:
                status || "draft",

            isFeatured:
                isFeatured === true ||
                isFeatured === "true",

            seoTitle:
                seoTitle || null,

            seoDescription:
                seoDescription || null,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            data: serializeBigInt(product),
        });
    } catch (error) {
        next(error);
    }
};

export const getProducts = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const products =
            await productService.getProducts();

        return res.status(200).json({
            success: true,
            data: serializeBigInt(products),
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = BigInt(
            String(req.params.id)
        );

        const product =
            await productService.getProductById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: serializeBigInt(product),
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = BigInt(
            String(req.params.id)
        );

        const {
            vendorId,
            categoryId,
            brandId,
            name,
            slug,
            shortDescription,
            description,
            productType,
            status,
            isFeatured,
            seoTitle,
            seoDescription,
        } = req.body;

        const product =
            await productService.updateProduct(id, {
                ...(vendorId !== undefined && {
                    vendorId:
                        BigInt(String(vendorId)),
                }),

                ...(categoryId !== undefined && {
                    categoryId:
                        toBigIntOrNull(categoryId),
                }),

                ...(brandId !== undefined && {
                    brandId:
                        toBigIntOrNull(brandId),
                }),

                ...(name !== undefined && {
                    name: String(name),
                }),

                ...(slug !== undefined && {
                    slug: String(slug),
                }),

                ...(shortDescription !== undefined && {
                    shortDescription,
                }),

                ...(description !== undefined && {
                    description,
                }),

                ...(productType !== undefined && {
                    productType,
                }),

                ...(status !== undefined && {
                    status,
                }),

                ...(isFeatured !== undefined && {
                    isFeatured:
                        isFeatured === true ||
                        isFeatured === "true",
                }),

                ...(seoTitle !== undefined && {
                    seoTitle,
                }),

                ...(seoDescription !== undefined && {
                    seoDescription,
                }),
            });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            data: serializeBigInt(product),
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = BigInt(
            String(req.params.id)
        );

        await productService.deleteProduct(id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};