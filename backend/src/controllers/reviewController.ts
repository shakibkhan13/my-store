
import { Response, NextFunction } from "express";

import {
  createReview,
  getProductReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../services/reviewService.js";

import { AuthRequest } from "../middleware/authMiddleware.js";
import { serializeBigInt } from "../utils/serializeBigInt.js";

// ============================================================
// CREATE REVIEW
// ============================================================

export const createReviewController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userId = BigInt(req.user.userId);

    const { productId, rating, comment } = req.body;

    // --------------------------------------------------------
    // Product ID validation
    // --------------------------------------------------------

    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    // --------------------------------------------------------
    // Rating validation
    // --------------------------------------------------------

    if (
      rating === undefined ||
      rating === null ||
      rating === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating is required.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    // --------------------------------------------------------
    // Convert product ID
    // --------------------------------------------------------

    let productIdBigInt: bigint;

    try {
      productIdBigInt = BigInt(String(productId));
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // --------------------------------------------------------
    // Create review
    // --------------------------------------------------------

    const review = await createReview(
      userId,
      productIdBigInt,
      numericRating,
      comment
    );

    return res.status(201).json({
      success: true,
      message: "Review created successfully.",
      data: serializeBigInt(review),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET PRODUCT REVIEWS
// ============================================================

export const getProductReviewsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawProductId = req.params.productId;

    if (
      typeof rawProductId !== "string" ||
      rawProductId.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    let productId: bigint;

    try {
      productId = BigInt(rawProductId);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // --------------------------------------------------------
    // Pagination
    // --------------------------------------------------------

    const pageValue = Number(req.query.page);
    const limitValue = Number(req.query.limit);

    const page =
      Number.isFinite(pageValue) && pageValue > 0
        ? Math.floor(pageValue)
        : 1;

    const limit =
      Number.isFinite(limitValue) && limitValue > 0
        ? Math.min(Math.floor(limitValue), 100)
        : 10;

    // --------------------------------------------------------
    // Get reviews
    // --------------------------------------------------------

    const result = await getProductReviews(
      productId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Product reviews retrieved successfully.",
      data: serializeBigInt(result),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET MY REVIEWS
// ============================================================

export const getMyReviewsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userId = BigInt(req.user.userId);

    // --------------------------------------------------------
    // Pagination
    // --------------------------------------------------------

    const pageValue = Number(req.query.page);
    const limitValue = Number(req.query.limit);

    const page =
      Number.isFinite(pageValue) && pageValue > 0
        ? Math.floor(pageValue)
        : 1;

    const limit =
      Number.isFinite(limitValue) && limitValue > 0
        ? Math.min(Math.floor(limitValue), 100)
        : 10;

    // --------------------------------------------------------
    // Get reviews
    // --------------------------------------------------------

    const result = await getMyReviews(
      userId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "My reviews retrieved successfully.",
      data: serializeBigInt(result),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SINGLE REVIEW
// ============================================================

export const getReviewByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const rawReviewId = req.params.id;

    if (
      typeof rawReviewId !== "string" ||
      rawReviewId.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required.",
      });
    }

    let reviewId: bigint;

    try {
      reviewId = BigInt(rawReviewId);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const userId = BigInt(req.user.userId);

    const review = await getReviewById(
      reviewId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Review retrieved successfully.",
      data: serializeBigInt(review),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE REVIEW
// ============================================================

export const updateReviewController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const rawReviewId = req.params.id;

    if (
      typeof rawReviewId !== "string" ||
      rawReviewId.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required.",
      });
    }

    let reviewId: bigint;

    try {
      reviewId = BigInt(rawReviewId);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const userId = BigInt(req.user.userId);

    const { rating, comment } = req.body;

    // --------------------------------------------------------
    // Rating validation
    // --------------------------------------------------------

    let numericRating: number | undefined;

    if (
      rating !== undefined &&
      rating !== null &&
      rating !== ""
    ) {
      numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5.",
        });
      }
    }

    // --------------------------------------------------------
    // Update review
    // --------------------------------------------------------

    const review = await updateReview(
      reviewId,
      userId,
      numericRating,
      comment
    );

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      data: serializeBigInt(review),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE REVIEW
// ============================================================

export const deleteReviewController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const rawReviewId = req.params.id;

    if (
      typeof rawReviewId !== "string" ||
      rawReviewId.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required.",
      });
    }

    let reviewId: bigint;

    try {
      reviewId = BigInt(rawReviewId);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const userId = BigInt(req.user.userId);

    await deleteReview(
      reviewId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

