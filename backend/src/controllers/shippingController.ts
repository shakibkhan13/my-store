import { Response, NextFunction } from "express";
import { OrderStatus } from "@prisma/client";

import { AuthRequest } from "../middleware/authMiddleware.js";

import { serializeBigInt } from "../utils/serializeBigInt.js";

import {
    getOrderShippingDetails,
    getVendorShippingDetails,
    getVendorOrderShipping,
    updateVendorShipping,
    updateVendorShippingStatus,
    updateTrackingInformation,
} from "../services/shippingService.js";

// ============================================================
// GET AUTHENTICATED USER ID
// ============================================================

const getUserId = (
    req: AuthRequest
): bigint => {
    const user = req.user;

    if (!user?.userId) {
        throw new Error(
            "Unauthorized."
        );
    }

    try {
        return BigInt(
            user.userId
        );
    } catch {
        throw new Error(
            "Invalid authenticated user ID."
        );
    }
};

// ============================================================
// GET PARAMETER BIGINT
// ============================================================

const getParamId = (
    value:
        | string
        | string[]
        | undefined,

    fieldName: string
): bigint => {
    if (
        !value ||
        Array.isArray(value)
    ) {
        throw new Error(
            `${fieldName} is required.`
        );
    }

    try {
        return BigInt(value);
    } catch {
        throw new Error(
            `Invalid ${fieldName}.`
        );
    }
};

// ============================================================
// GET CUSTOMER ORDER SHIPPING
// GET /shipping/orders/:orderId
// ============================================================

export const getOrderShipping = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId =
            getUserId(req);

        const orderId =
            getParamId(
                req.params.orderId,
                "order ID"
            );

        const shipping =
            await getOrderShippingDetails(
                orderId,
                userId
            );

        return res.status(200).json({
            success: true,

            message:
                "Order shipping details retrieved successfully.",

            data:
                serializeBigInt(
                    shipping
                ),
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// GET VENDOR SHIPPING
// GET /shipping/vendors/:vendorId/orders
// ============================================================

export const getVendorShipping = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId =
            getUserId(req);

        const vendorId =
            getParamId(
                req.params.vendorId,
                "vendor ID"
            );

        // ------------------------------------------------------
        // DEBUG
        // ------------------------------------------------------

        console.log(
            "========================================"
        );

        console.log(
            "VENDOR SHIPPING REQUEST"
        );

        console.log(
            "Vendor ID:",
            vendorId.toString()
        );

        console.log(
            "Authenticated User ID:",
            userId.toString()
        );

        console.log(
            "========================================"
        );

        const shipping =
            await getVendorShippingDetails(
                vendorId,
                userId
            );

        return res.status(200).json({
            success: true,

            message:
                "Vendor shipping orders retrieved successfully.",

            data:
                serializeBigInt(
                    shipping
                ),
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// GET SINGLE VENDOR ORDER SHIPPING
// GET /shipping/vendor-orders/:vendorOrderId
// ============================================================

export const getSingleVendorOrderShipping =
    async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId =
                getUserId(req);

            const vendorOrderId =
                getParamId(
                    req.params
                        .vendorOrderId,
                    "vendor order ID"
                );

            const shipping =
                await getVendorOrderShipping(
                    vendorOrderId,
                    userId
                );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Vendor order shipping details retrieved successfully.",

                    data:
                        serializeBigInt(
                            shipping
                        ),
                });
        } catch (error) {
            next(error);
        }
    };

// ============================================================
// UPDATE COMPLETE SHIPPING INFORMATION
// PATCH /shipping/vendor-orders/:vendorOrderId
// ============================================================

export const updateShipping = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId =
            getUserId(req);

        const vendorOrderId =
            getParamId(
                req.params
                    .vendorOrderId,
                "vendor order ID"
            );

        const {
            status,
            trackingNumber,
            courierName,
        } = req.body;

        // ------------------------------------------------------
        // STATUS
        // ------------------------------------------------------

        let parsedStatus:
            | OrderStatus
            | undefined;

        if (
            status !== undefined
        ) {
            if (
                typeof status !==
                    "string" ||
                !Object.values(
                    OrderStatus
                ).includes(
                    status as OrderStatus
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid shipping status.",
                });
            }

            parsedStatus =
                status as OrderStatus;
        }

        // ------------------------------------------------------
        // TRACKING NUMBER
        // ------------------------------------------------------

        if (
            trackingNumber !==
                undefined &&
            trackingNumber !== null &&
            typeof trackingNumber !==
                "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Tracking number must be a string.",
            });
        }

        // ------------------------------------------------------
        // COURIER
        // ------------------------------------------------------

        if (
            courierName !==
                undefined &&
            courierName !== null &&
            typeof courierName !==
                "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Courier name must be a string.",
            });
        }

        // ------------------------------------------------------
        // UPDATE
        // ------------------------------------------------------

        const shipping =
            await updateVendorShipping(
                vendorOrderId,
                userId,
                {
                    status:
                        parsedStatus,

                    trackingNumber,

                    courierName,
                }
            );

        return res.status(200).json({
            success: true,

            message:
                "Shipping information updated successfully.",

            data:
                serializeBigInt(
                    shipping
                ),
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// UPDATE SHIPPING STATUS
// PATCH /shipping/vendor-orders/:vendorOrderId/status
// ============================================================

export const updateShippingStatus =
    async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId =
                getUserId(req);

            const vendorOrderId =
                getParamId(
                    req.params
                        .vendorOrderId,
                    "vendor order ID"
                );

            const {
                status,
            } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Shipping status is required.",
                });
            }

            if (
                typeof status !==
                    "string" ||
                !Object.values(
                    OrderStatus
                ).includes(
                    status as OrderStatus
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid shipping status.",
                });
            }

            const shipping =
                await updateVendorShippingStatus(
                    vendorOrderId,
                    userId,
                    status as OrderStatus
                );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Shipping status updated successfully.",

                    data:
                        serializeBigInt(
                            shipping
                        ),
                });
        } catch (error) {
            next(error);
        }
    };

// ============================================================
// UPDATE TRACKING
// PATCH /shipping/vendor-orders/:vendorOrderId/tracking
// ============================================================

export const updateTracking = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId =
            getUserId(req);

        const vendorOrderId =
            getParamId(
                req.params
                    .vendorOrderId,
                "vendor order ID"
            );

        const {
            trackingNumber,
            courierName,
        } = req.body;

        if (
            !trackingNumber ||
            typeof trackingNumber !==
                "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Tracking number is required.",
            });
        }

        if (
            courierName !==
                undefined &&
            courierName !== null &&
            typeof courierName !==
                "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Courier name must be a string.",
            });
        }

        const shipping =
            await updateTrackingInformation(
                vendorOrderId,
                userId,
                trackingNumber,
                courierName
            );

        return res.status(200).json({
            success: true,

            message:
                "Tracking information updated successfully.",

            data:
                serializeBigInt(
                    shipping
                ),
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// MARK AS SHIPPED
// PATCH /shipping/vendor-orders/:vendorOrderId/ship
// ============================================================

export const markAsShipped = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId =
            getUserId(req);

        const vendorOrderId =
            getParamId(
                req.params
                    .vendorOrderId,
                "vendor order ID"
            );

        const shipping =
            await updateVendorShippingStatus(
                vendorOrderId,
                userId,
                OrderStatus.SHIPPED
            );

        return res.status(200).json({
            success: true,

            message:
                "Vendor order marked as shipped successfully.",

            data:
                serializeBigInt(
                    shipping
                ),
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// MARK AS DELIVERED
// PATCH /shipping/vendor-orders/:vendorOrderId/deliver
// ============================================================

export const markAsDelivered =
    async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId =
                getUserId(req);

            const vendorOrderId =
                getParamId(
                    req.params
                        .vendorOrderId,
                    "vendor order ID"
                );

            const shipping =
                await updateVendorShippingStatus(
                    vendorOrderId,
                    userId,
                    OrderStatus.DELIVERED
                );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Vendor order marked as delivered successfully.",

                    data:
                        serializeBigInt(
                            shipping
                        ),
                });
        } catch (error) {
            next(error);
        }
    };

// ============================================================
// CANCEL SHIPPING
// PATCH /shipping/vendor-orders/:vendorOrderId/cancel
// ============================================================

export const cancelShipping = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId =
            getUserId(req);

        const vendorOrderId =
            getParamId(
                req.params
                    .vendorOrderId,
                "vendor order ID"
            );

        const shipping =
            await updateVendorShippingStatus(
                vendorOrderId,
                userId,
                OrderStatus.CANCELLED
            );

        return res.status(200).json({
            success: true,

            message:
                "Vendor order shipping cancelled successfully.",

            data:
                serializeBigInt(
                    shipping
                ),
        });
    } catch (error) {
        next(error);
    }
};