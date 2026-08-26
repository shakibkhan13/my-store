import { Router } from "express";

import {
  createCategoryController,
  getCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController.js";

const router = Router();

// Create
router.post("/", createCategoryController);

// Get all
router.get("/", getCategoriesController);

// Get single
router.get("/:id", getCategoryByIdController);

// Update
router.put("/:id", updateCategoryController);

// Delete
router.delete("/:id", deleteCategoryController);

export default router;