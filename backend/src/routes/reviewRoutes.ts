import { Router } from "express";

import {
  createReviewController,
  getProductReviewsController,
  getMyReviewsController,
  getReviewByIdController,
  updateReviewController,
  deleteReviewController,
} from "../controllers/reviewController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// ============================================================
// PUBLIC
// ============================================================

// Get reviews of a product
router.get(
  "/product/:productId",
  getProductReviewsController
);

// ============================================================
// AUTHENTICATED
// ============================================================

// Create review
router.post(
  "/",
  authMiddleware,
  createReviewController
);

// Get my reviews
router.get(
  "/my",
  authMiddleware,
  getMyReviewsController
);

// Get my single review
router.get(
  "/:id",
  authMiddleware,
  getReviewByIdController
);

// Update my review
router.put(
  "/:id",
  authMiddleware,
  updateReviewController
);

// Delete my review
router.delete(
  "/:id",
  authMiddleware,
  deleteReviewController
);

export default router;