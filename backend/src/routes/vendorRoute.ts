import { Router } from "express";

import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  updateVendorStatus,
  verifyVendor,
  deleteVendor,
} from "../controllers/vendorController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getVendors);

router.post("/", createVendor);

router.get("/:vendorId", getVendorById);

router.put("/:vendorId", updateVendor);

router.patch("/:vendorId/status", updateVendorStatus);

router.patch("/:vendorId/verify", verifyVendor);

router.delete("/:vendorId", deleteVendor);

export default router;