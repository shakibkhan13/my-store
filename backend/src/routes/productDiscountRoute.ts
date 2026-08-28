import { Router } from "express";

import {
    createDiscount,
    getDiscounts,
    getDiscount,
    getActiveDiscounts,
    updateDiscount,
    deleteDiscount,
    toggleDiscount,
} from "../controllers/productDiscountController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// ============================================================
// PRODUCT DISCOUNT ROUTES
// ============================================================

// Public
router.get("/", getDiscounts);

router.get(
    "/product/:productId/active",
    getActiveDiscounts,
);

router.get("/:id", getDiscount);

// Protected
router.post(
    "/",
    authMiddleware,
    createDiscount,
);

router.put(
    "/:id",
    authMiddleware,
    updateDiscount,
);

router.patch(
    "/:id/toggle",
    authMiddleware,
    toggleDiscount,
);

router.delete(
    "/:id",
    authMiddleware,
    deleteDiscount,
);

export default router;