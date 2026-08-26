import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";

export const getVendorWallet = async (vendorId: bigint) => {
  const vendor = await prisma.vendor.findFirst({
    where: {
      id: vendorId,
      deletedAt: null,
    },
  });

  if (!vendor) {
    throw new Error("Vendor not found.");
  }

  let wallet = await prisma.vendorWallet.findUnique({
    where: {
      vendorId,
    },
  });

  if (!wallet) {
    wallet = await prisma.vendorWallet.create({
      data: {
        vendorId,
        balance: new Prisma.Decimal(0),
        reservedBalance: new Prisma.Decimal(0),
        currency: "BDT",
      },
    });
  }

  return wallet;
};

export const creditWallet = async (
  vendorId: bigint,
  amount: number
) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  return prisma.$transaction(async (tx) => {
    const vendor = await tx.vendor.findFirst({
      where: {
        id: vendorId,
        deletedAt: null,
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found.");
    }

    let wallet = await tx.vendorWallet.findUnique({
      where: {
        vendorId,
      },
    });

    if (!wallet) {
      wallet = await tx.vendorWallet.create({
        data: {
          vendorId,
          balance: new Prisma.Decimal(0),
          reservedBalance: new Prisma.Decimal(0),
          currency: "BDT",
        },
      });
    }

    const newBalance = wallet.balance.add(
      new Prisma.Decimal(amount)
    );

    return tx.vendorWallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: newBalance,
        lastUpdatedAt: new Date(),
      },
    });
  });
};

export const debitWallet = async (
  vendorId: bigint,
  amount: number
) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.vendorWallet.findUnique({
      where: {
        vendorId,
      },
    });

    if (!wallet) {
      throw new Error("Vendor wallet not found.");
    }

    const debitAmount = new Prisma.Decimal(amount);

    if (wallet.balance.lt(debitAmount)) {
      throw new Error("Insufficient wallet balance.");
    }

    const newBalance = wallet.balance.sub(debitAmount);

    return tx.vendorWallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: newBalance,
        lastUpdatedAt: new Date(),
      },
    });
  });
};