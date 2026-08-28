import { Router } from "express";
import express from "express";

import {
  initiatePayment,
  sslSuccess,
  sslFail,
  sslCancel,
  sslIPN,
} from "../controllers/paymentController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// ============================================================
// CUSTOMER
// ============================================================

// POST /api/v1/payment/sslcommerz/initiate
router.post(
  "/sslcommerz/initiate",
  authMiddleware,
  initiatePayment
);

// ============================================================
// SSLCOMMERZ CALLBACKS
// ============================================================

// SSLCOMMERZ sends application/x-www-form-urlencoded
// Therefore use express.urlencoded() here.

router.post(
  "/sslcommerz/success",
  express.urlencoded({ extended: true }),
  sslSuccess
);

router.post(
  "/sslcommerz/fail",
  express.urlencoded({ extended: true }),
  sslFail
);

router.post(
  "/sslcommerz/cancel",
  express.urlencoded({ extended: true }),
  sslCancel
);

router.post(
  "/sslcommerz/ipn",
  express.urlencoded({ extended: true }),
  sslIPN
);

export default router;