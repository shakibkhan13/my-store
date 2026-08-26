import { Router } from "express";

import {
  getVendorStaff,
  addVendorStaff,
  updateVendorStaff,
  removeVendorStaff,
} from "../controllers/vendorStaffController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/:vendorId/staff", getVendorStaff);

router.post("/:vendorId/staff", addVendorStaff);

router.put(
  "/:vendorId/staff/:staffId",
  updateVendorStaff
);

router.delete(
  "/:vendorId/staff/:staffId",
  removeVendorStaff
);

export default router;