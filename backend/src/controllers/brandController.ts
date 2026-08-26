import { Request, Response, NextFunction } from "express";

import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../services/brandService.js";

import { serializeBigInt } from "../utils/serializeBigInt.js";

// ============================================================
// CREATE BRAND
// ============================================================

export const createBrandController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      slug,
      logoUrl,
      description,
      isActive,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Brand name is required.",
      });
    }

    const brand = await createBrand({
      name: String(name).trim(),
      slug: slug ? String(slug).trim() : undefined,
      logoUrl: logoUrl ?? null,
      description: description ?? null,
      isActive:
        isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Brand created successfully.",
      data: serializeBigInt(brand),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET BRANDS
// ============================================================

export const getBrandsController = async (
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

    const result = await getBrands({
      page,
      limit,
      search,
      isActive,
    });

    return res.status(200).json({
      success: true,
      message: "Brands fetched successfully.",
      ...serializeBigInt(result),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET BRAND BY ID
// ============================================================

export const getBrandByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    const brand = await getBrandById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Brand fetched successfully.",
      data: serializeBigInt(brand),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE BRAND
// ============================================================

export const updateBrandController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    const {
      name,
      slug,
      logoUrl,
      description,
      isActive,
    } = req.body;

    const brand = await updateBrand(id, {
      ...(name !== undefined && name !== null && {
        name: String(name).trim(),
      }),

      ...(slug !== undefined && slug !== null && {
        slug: String(slug).trim(),
      }),

      ...(logoUrl !== undefined && {
        logoUrl,
      }),

      ...(description !== undefined && {
        description,
      }),

      ...(isActive !== undefined && {
        isActive: Boolean(isActive),
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully.",
      data: serializeBigInt(brand),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE BRAND
// ============================================================

export const deleteBrandController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    await deleteBrand(id);

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};