import { Request, Response, NextFunction } from "express";

import * as vendorStaffService from "../services/vendorStaffService.js";
import { serializeBigInt } from "../utils/serializeBigInt.js";

const parseBigInt = (value: unknown): bigint => {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error("Invalid ID.");
  }

  return BigInt(String(value));
};

export const getVendorStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);

    const staff = await vendorStaffService.getVendorStaff(
      vendorId
    );

    return res.status(200).json({
      success: true,
      message: "Vendor staff fetched successfully.",
      data: serializeBigInt(staff),
    });
  } catch (error) {
    next(error);
  }
};

export const addVendorStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);

    const { userId, roleId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required.",
      });
    }

    const staff = await vendorStaffService.addVendorStaff(
      vendorId,
      parseBigInt(userId),
      roleId ? parseBigInt(roleId) : undefined
    );

    return res.status(201).json({
      success: true,
      message: "Vendor staff added successfully.",
      data: serializeBigInt(staff),
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendorStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const staffId = parseBigInt(req.params.staffId);

    const { roleId, isActive } = req.body;

    const staff = await vendorStaffService.updateVendorStaff(
      staffId,
      {
        ...(roleId !== undefined && {
          roleId:
            roleId === null
              ? null
              : parseBigInt(roleId),
        }),

        ...(isActive !== undefined && {
          isActive: Boolean(isActive),
        }),
      }
    );

    return res.status(200).json({
      success: true,
      message: "Vendor staff updated successfully.",
      data: serializeBigInt(staff),
    });
  } catch (error) {
    next(error);
  }
};

export const removeVendorStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const staffId = parseBigInt(req.params.staffId);

    await vendorStaffService.removeVendorStaff(staffId);

    return res.status(200).json({
      success: true,
      message: "Vendor staff removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};