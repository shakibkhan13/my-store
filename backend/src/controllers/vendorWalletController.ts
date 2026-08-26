import { Request, Response, NextFunction } from "express";

import * as vendorWalletService from "../services/vendorWalletService.js";
import { serializeBigInt } from "../utils/serializeBigInt.js";

const parseBigInt = (value: unknown): bigint => {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error("Invalid ID.");
  }

  return BigInt(String(value));
};

export const getVendorWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);

    const wallet = await vendorWalletService.getVendorWallet(
      vendorId
    );

    return res.status(200).json({
      success: true,
      message: "Vendor wallet fetched successfully.",
      data: serializeBigInt(wallet),
    });
  } catch (error) {
    next(error);
  }
};

export const creditWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);

    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "amount is required.",
      });
    }

    const wallet = await vendorWalletService.creditWallet(
      vendorId,
      Number(amount)
    );

    return res.status(200).json({
      success: true,
      message: "Wallet credited successfully.",
      data: serializeBigInt(wallet),
    });
  } catch (error) {
    next(error);
  }
};

export const debitWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);

    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "amount is required.",
      });
    }

    const wallet = await vendorWalletService.debitWallet(
      vendorId,
      Number(amount)
    );

    return res.status(200).json({
      success: true,
      message: "Wallet debited successfully.",
      data: serializeBigInt(wallet),
    });
  } catch (error) {
    next(error);
  }
};