import { Router } from "express";

import {
    createOrderController,
    getMyOrdersController,
    getOrderController,
    cancelOrderController,
    confirmOrderController,
    updateOrderStatusController,
} from "../controllers/orderController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();


// ============================================================
// CUSTOMER ORDER ROUTES
// ============================================================

router.post(
    "/",
    authMiddleware,
    createOrderController,
);


router.get(
    "/my-orders",
    authMiddleware,
    getMyOrdersController,
);


router.get(
    "/:id",
    authMiddleware,
    getOrderController,
);


router.patch(
    "/:id/cancel",
    authMiddleware,
    cancelOrderController,
);


// ============================================================
// ADMIN ORDER ROUTES
// ============================================================

router.patch(
    "/:id/confirm",
    authMiddleware,
    confirmOrderController,
);


router.patch(
    "/:id/status",
    authMiddleware,
    updateOrderStatusController,
);


export default router;