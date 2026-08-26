import { Request, Response, NextFunction } from "express";
import * as vendorService from "../services/vendorService.js";
import { serializeBigInt } from "../utils/serializeBigInt.js";

const parseBigInt = (value: unknown): bigint => {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error("Invalid ID.");
  }

  return BigInt(String(value));
};

export const createVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      ownerId,
      name,
      slug,
      description,
      logoUrl,
      bannerUrl,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      taxId,
      commissionRate,
    } = req.body;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "ownerId is required.",
      });
    }

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "name and slug are required.",
      });
    }

    const vendor = await vendorService.createVendor({
      ownerId: parseBigInt(ownerId),
      name,
      slug,
      description,
      logoUrl,
      bannerUrl,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      taxId,
      commissionRate:
        commissionRate !== undefined
          ? Number(commissionRate)
          : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Vendor created successfully.",
      data: serializeBigInt(vendor),
    });
  } catch (error) {
    next(error);
  }
};

export const getVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const search = req.query.search
      ? String(req.query.search)
      : undefined;
    const status = req.query.status
      ? String(req.query.status)
      : undefined;

    const result = await vendorService.getVendors({
      page,
      limit,
      search,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Vendors fetched successfully.",
      ...serializeBigInt(result),
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);

    const vendor = await vendorService.getVendorById(vendorId);

    return res.status(200).json({
      success: true,
      message: "Vendor fetched successfully.",
      data: serializeBigInt(vendor),
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);

    const {
      name,
      slug,
      description,
      logoUrl,
      bannerUrl,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      taxId,
      commissionRate,
    } = req.body;

    const vendor = await vendorService.updateVendor(vendorId, {
      name,
      slug,
      description,
      logoUrl,
      bannerUrl,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      taxId,
      commissionRate:
        commissionRate !== undefined
          ? Number(commissionRate)
          : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully.",
      data: serializeBigInt(vendor),
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendorStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required.",
      });
    }

    const vendor = await vendorService.updateVendorStatus(
      vendorId,
      status
    );

    return res.status(200).json({
      success: true,
      message: "Vendor status updated successfully.",
      data: serializeBigInt(vendor),
    });
  } catch (error) {
    next(error);
  }
};

export const verifyVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);

    const { isVerified } = req.body;

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVerified must be boolean.",
      });
    }

    const vendor = await vendorService.verifyVendor(
      vendorId,
      isVerified
    );

    return res.status(200).json({
      success: true,
      message: isVerified
        ? "Vendor verified successfully."
        : "Vendor verification removed successfully.",
      data: serializeBigInt(vendor),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);

    await vendorService.deleteVendor(vendorId);

    return res.status(200).json({
      success: true,
      message: "Vendor deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};