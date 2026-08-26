import { Router } from "express";

import {
  getVendorWallet,
  creditWallet,
  debitWallet,
} from "../controllers/vendorWalletController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/:vendorId/wallet", getVendorWallet);

router.post("/:vendorId/wallet/credit", creditWallet);

router.post("/:vendorId/wallet/debit", debitWallet);

export default router;