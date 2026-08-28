import { Router } from "express";

import {
    getOrderShipping,
    getVendorShipping,
    getSingleVendorOrderShipping,
    updateShipping,
    updateShippingStatus,
    updateTracking,
    markAsShipped,
    markAsDelivered,
    cancelShipping,
} from "../controllers/shippingController.js";

import {
    authMiddleware,
} from "../middleware/authMiddleware.js";

const router = Router();

// ============================================================
// CUSTOMER ORDER SHIPPING
// ============================================================

// GET /api/v1/shipping/orders/:orderId

router.get(
    "/orders/:orderId",
    authMiddleware,
    getOrderShipping
);

// ============================================================
// VENDOR SHIPPING
// ============================================================

// GET /api/v1/shipping/vendors/:vendorId/orders

router.get(
    "/vendors/:vendorId/orders",
    authMiddleware,
    getVendorShipping
);

// ============================================================
// SINGLE VENDOR ORDER SHIPPING
// ============================================================

// GET /api/v1/shipping/vendor-orders/:vendorOrderId

router.get(
    "/vendor-orders/:vendorOrderId",
    authMiddleware,
    getSingleVendorOrderShipping
);

// ============================================================
// UPDATE COMPLETE SHIPPING
// ============================================================

// PATCH /api/v1/shipping/vendor-orders/:vendorOrderId

router.patch(
    "/vendor-orders/:vendorOrderId",
    authMiddleware,
    updateShipping
);

// ============================================================
// UPDATE STATUS
// ============================================================

// PATCH /api/v1/shipping/vendor-orders/:vendorOrderId/status

router.patch(
    "/vendor-orders/:vendorOrderId/status",
    authMiddleware,
    updateShippingStatus
);

// ============================================================
// UPDATE TRACKING
// ============================================================

// PATCH /api/v1/shipping/vendor-orders/:vendorOrderId/tracking

router.patch(
    "/vendor-orders/:vendorOrderId/tracking",
    authMiddleware,
    updateTracking
);

// ============================================================
// MARK AS SHIPPED
// ============================================================

// PATCH /api/v1/shipping/vendor-orders/:vendorOrderId/ship

router.patch(
    "/vendor-orders/:vendorOrderId/ship",
    authMiddleware,
    markAsShipped
);

// ============================================================
// MARK AS DELIVERED
// ============================================================

// PATCH /api/v1/shipping/vendor-orders/:vendorOrderId/deliver

router.patch(
    "/vendor-orders/:vendorOrderId/deliver",
    authMiddleware,
    markAsDelivered
);

// ============================================================
// CANCEL SHIPPING
// ============================================================

// PATCH /api/v1/shipping/vendor-orders/:vendorOrderId/cancel

router.patch(
    "/vendor-orders/:vendorOrderId/cancel",
    authMiddleware,
    cancelShipping
);

export default router;