import { Request, Response, NextFunction } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../services/categoryService.js";
import { serializeBigInt } from "../utils/serializeBigInt.js";

// ============================================================
// CREATE CATEGORY
// ============================================================

export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      slug,
      parentId,
      description,
      imageUrl,
      isActive,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const category = await createCategory({
      name: String(name).trim(),
      slug: slug ? String(slug).trim() : undefined,
      parentId:
        parentId !== undefined &&
        parentId !== null &&
        parentId !== ""
          ? BigInt(String(parentId))
          : null,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      isActive:
        isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: serializeBigInt(category),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET CATEGORIES
// ============================================================

export const getCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search
      ? String(req.query.search)
      : undefined;

    let isActive: boolean | undefined;

    if (req.query.isActive !== undefined) {
      isActive = String(req.query.isActive) === "true";
    }

    let parentId: bigint | null | undefined;

    if (req.query.parentId === "null") {
      parentId = null;
    } else if (
      req.query.parentId !== undefined &&
      req.query.parentId !== ""
    ) {
      parentId = BigInt(String(req.query.parentId));
    }

    const result = await getCategories({
      page,
      limit,
      search,
      isActive,
      parentId,
    });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      ...serializeBigInt(result),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET CATEGORY BY ID
// ============================================================

export const getCategoryByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully.",
      data: serializeBigInt(category),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE CATEGORY
// ============================================================

export const updateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    const {
      name,
      slug,
      parentId,
      description,
      imageUrl,
      isActive,
    } = req.body;

    const updateData: {
      name?: string;
      slug?: string;
      parentId?: bigint | null;
      description?: string | null;
      imageUrl?: string | null;
      isActive?: boolean;
    } = {};

    if (name !== undefined) {
      updateData.name = String(name).trim();
    }

    if (slug !== undefined) {
      updateData.slug = String(slug).trim();
    }

    if (parentId !== undefined) {
      updateData.parentId =
        parentId === null || parentId === "" ? null : BigInt(String(parentId));
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const category = await updateCategory(
      id,
      updateData as Parameters<typeof updateCategory>[1]
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: serializeBigInt(category),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE CATEGORY
// ============================================================

export const deleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    await deleteCategory(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};