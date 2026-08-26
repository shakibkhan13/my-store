import { Request, Response, NextFunction } from "express";

import * as withdrawalService from "../services/vendorWithdrawalService.js";
import { serializeBigInt } from "../utils/serializeBigInt.js";

const parseBigInt = (value: unknown): bigint => {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error("Invalid ID.");
  }

  return BigInt(String(value));
};

export const createWithdrawal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);

    const {
      amount,
      fee,
      paymentMethod,
      accountDetails,
    } = req.body;

    if (amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "amount is required.",
      });
    }

    const withdrawal =
      await withdrawalService.createWithdrawal(
        vendorId,
        {
          amount: Number(amount),
          fee:
            fee !== undefined
              ? Number(fee)
              : 0,
          paymentMethod,
          accountDetails,
        }
      );

    return res.status(201).json({
      success: true,
      message: "Withdrawal request created successfully.",
      data: serializeBigInt(withdrawal),
    });
  } catch (error) {
    next(error);
  }
};

export const getWithdrawals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = parseBigInt(req.params.vendorId);

    const status = req.query.status
      ? String(req.query.status)
      : undefined;

    const withdrawals =
      await withdrawalService.getWithdrawals(
        vendorId,
        status
      );

    return res.status(200).json({
      success: true,
      message: "Withdrawals fetched successfully.",
      data: serializeBigInt(withdrawals),
    });
  } catch (error) {
    next(error);
  }
};

export const getWithdrawalById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const withdrawalId = parseBigInt(
      req.params.withdrawalId
    );

    const withdrawal =
      await withdrawalService.getWithdrawalById(
        withdrawalId
      );

    return res.status(200).json({
      success: true,
      message: "Withdrawal fetched successfully.",
      data: serializeBigInt(withdrawal),
    });
  } catch (error) {
    next(error);
  }
};

export const approveWithdrawal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const withdrawalId = parseBigInt(
      req.params.withdrawalId
    );

    const withdrawal =
      await withdrawalService.approveWithdrawal(
        withdrawalId
      );

    return res.status(200).json({
      success: true,
      message: "Withdrawal approved successfully.",
      data: serializeBigInt(withdrawal),
    });
  } catch (error) {
    next(error);
  }
};

export const processWithdrawal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const withdrawalId = parseBigInt(
      req.params.withdrawalId
    );

    const { referenceId } = req.body;

    const withdrawal =
      await withdrawalService.processWithdrawal(
        withdrawalId,
        referenceId
      );

    return res.status(200).json({
      success: true,
      message: "Withdrawal processing started.",
      data: serializeBigInt(withdrawal),
    });
  } catch (error) {
    next(error);
  }
};

export const completeWithdrawal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const withdrawalId = parseBigInt(
      req.params.withdrawalId
    );

    const { referenceId } = req.body;

    const withdrawal =
      await withdrawalService.completeWithdrawal(
        withdrawalId,
        referenceId
      );

    return res.status(200).json({
      success: true,
      message: "Withdrawal completed successfully.",
      data: serializeBigInt(withdrawal),
    });
  } catch (error) {
    next(error);
  }
};

export const rejectWithdrawal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const withdrawalId = parseBigInt(
      req.params.withdrawalId
    );

    const { failureReason } = req.body;

    if (!failureReason) {
      return res.status(400).json({
        success: false,
        message: "failureReason is required.",
      });
    }

    const withdrawal =
      await withdrawalService.rejectWithdrawal(
        withdrawalId,
        failureReason
      );

    return res.status(200).json({
      success: true,
      message: "Withdrawal rejected successfully.",
      data: serializeBigInt(withdrawal),
    });
  } catch (error) {
    next(error);
  }
};