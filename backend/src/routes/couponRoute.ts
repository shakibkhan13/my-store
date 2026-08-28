import { Router } from "express";

import {
    createCouponController,
    getCouponList,
    getCoupon,
    updateCouponController,
    deleteCouponController,
    toggleCoupon,
    validateCouponController,
    getMyCouponUsages,
} from "../controllers/couponController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// ============================================================
// PUBLIC / READ
// ============================================================

router.get(
    "/",
    getCouponList,
);

router.get(
    "/:id",
    getCoupon,
);

// ============================================================
// ADMIN / MANAGEMENT
// ============================================================

router.post(
    "/",
    authMiddleware,
    createCouponController,
);

router.put(
    "/:id",
    authMiddleware,
    updateCouponController,
);

router.patch(
    "/:id/toggle",
    authMiddleware,
    toggleCoupon,
);

router.delete(
    "/:id",
    authMiddleware,
    deleteCouponController,
);

// ============================================================
// CUSTOMER
// ============================================================

router.post(
    "/validate",
    authMiddleware,
    validateCouponController,
);

router.get(
    "/my/usages",
    authMiddleware,
    getMyCouponUsages,
);

export default router;