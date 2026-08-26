import { Router } from "express";

import {
  createWithdrawal,
  getWithdrawals,
  getWithdrawalById,
  approveWithdrawal,
  processWithdrawal,
  completeWithdrawal,
  rejectWithdrawal,
} from "../controllers/vendorWithdrawalController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/:vendorId/withdrawals",
  getWithdrawals
);

router.post(
  "/:vendorId/withdrawals",
  createWithdrawal
);

router.get(
  "/:vendorId/withdrawals/:withdrawalId",
  getWithdrawalById
);

router.patch(
  "/:vendorId/withdrawals/:withdrawalId/approve",
  approveWithdrawal
);

router.patch(
  "/:vendorId/withdrawals/:withdrawalId/process",
  processWithdrawal
);

router.patch(
  "/:vendorId/withdrawals/:withdrawalId/complete",
  completeWithdrawal
);

router.patch(
  "/:vendorId/withdrawals/:withdrawalId/reject",
  rejectWithdrawal
);

export default router;