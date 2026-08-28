import { Request, Response, NextFunction } from "express";

import {
    OrderStatus,
    PaymentMethod,
} from "@prisma/client";

import {
    createOrder,
    getOrderById,
    getMyOrders,
    cancelOrder,
    confirmOrder,
    updateOrderStatus,
} from "../services/orderService.js";

import {
    serializeBigInt,
} from "../utils/serializeBigInt.js";


// ============================================================
// AUTHENTICATED REQUEST TYPE
// ============================================================

type AuthenticatedRequest = Request & {
    user: {
        id?: string | number | bigint;
        userId?: string | number | bigint;
        email?: string;
    };
};

// ============================================================
// HELPER: Safely get userId (supports both 'id' and 'userId')
// ============================================================

const getUserId = (req: Request): bigint => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
        throw new Error("UNAUTHORIZED");
    }
    // Try 'userId' (set by authMiddleware), fallback to 'id'
    const userId = authReq.user.userId ?? authReq.user.id;
    if (userId === undefined || userId === null) {
        throw new Error("UNAUTHORIZED");
    }
    return BigInt(String(userId));
};


// ============================================================
// CREATE ORDER
// ============================================================

export const createOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    try {

        let userId: bigint;
        try {
            userId = getUserId(req);
        } catch {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid or missing token",
            });
        }

        const {
            shippingAddress,
            billingAddress,
            paymentMethod,
            shippingFee,
            discount,
            tax,
            customerNote,
        } = req.body;


        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required.",
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Payment method is required.",
            });
        }

        if (!Object.values(PaymentMethod).includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method.",
            });
        }

        const order = await createOrder({
            userId,
            shippingAddress,
            billingAddress,
            paymentMethod,
            shippingFee: shippingFee !== undefined ? Number(shippingFee) : 0,
            discount: discount !== undefined ? Number(discount) : 0,
            tax: tax !== undefined ? Number(tax) : 0,
            customerNote,
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            data: serializeBigInt(order),
        });

    } catch (error) {
        next(error);
    }
};


// ============================================================
// MY ORDERS
// ============================================================

export const getMyOrdersController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    try {
        let userId: bigint;
        try {
            userId = getUserId(req);
        } catch {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid or missing token",
            });
        }

        const orders = await getMyOrders(userId);

        return res.status(200).json({
            success: true,
            message: "Orders retrieved successfully.",
            data: serializeBigInt(orders),
        });

    } catch (error) {
        next(error);
    }
};


// ============================================================
// GET ORDER DETAILS
// ============================================================

export const getOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    try {
        let userId: bigint;
        try {
            userId = getUserId(req);
        } catch {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid or missing token",
            });
        }

        const orderId = BigInt(String(req.params.id));

        const order = await getOrderById(orderId, userId);

        return res.status(200).json({
            success: true,
            message: "Order retrieved successfully.",
            data: serializeBigInt(order),
        });

    } catch (error) {
        next(error);
    }
};


// ============================================================
// CANCEL ORDER
// ============================================================

export const cancelOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    try {
        let userId: bigint;
        try {
            userId = getUserId(req);
        } catch {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid or missing token",
            });
        }

        const orderId = BigInt(String(req.params.id));
        const { reason } = req.body;

        const order = await cancelOrder(orderId, userId, reason);

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully.",
            data: serializeBigInt(order),
        });

    } catch (error) {
        next(error);
    }
};


// ============================================================
// CONFIRM ORDER
// ============================================================

export const confirmOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    try {
        const orderId = BigInt(String(req.params.id));
        const order = await confirmOrder(orderId);

        return res.status(200).json({
            success: true,
            message: "Order confirmed successfully. Confirmation email has been sent to the customer.",
            data: serializeBigInt(order),
        });

    } catch (error) {
        next(error);
    }
};


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

export const updateOrderStatusController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    try {
        const orderId = BigInt(String(req.params.id));
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Order status is required.",
            });
        }

        if (!Object.values(OrderStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status.",
            });
        }

        const order = await updateOrderStatus(orderId, status as OrderStatus);

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            data: serializeBigInt(order),
        });

    } catch (error) {
        next(error);
    }
};