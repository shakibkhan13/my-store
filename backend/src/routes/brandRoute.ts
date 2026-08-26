import { Router } from "express";

import {
  createBrandController,
  getBrandsController,
  getBrandByIdController,
  updateBrandController,
  deleteBrandController,
} from "../controllers/brandController.js";

const router = Router();

// Create
router.post("/", createBrandController);

// Get all
router.get("/", getBrandsController);

// Get single
router.get("/:id", getBrandByIdController);

// Update
router.put("/:id", updateBrandController);

// Delete
router.delete("/:id", deleteBrandController);

export default router;