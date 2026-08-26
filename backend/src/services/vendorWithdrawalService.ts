import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";

export const createWithdrawal = async (
  vendorId: bigint,
  data: {
    amount: number;
    fee?: number;
    paymentMethod?: string;
    accountDetails?: Prisma.InputJsonValue;
  }
) => {
  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  const fee = data.fee ?? 0;

  if (fee < 0) {
    throw new Error("Fee cannot be negative.");
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

    const amount = new Prisma.Decimal(data.amount);
    const feeAmount = new Prisma.Decimal(fee);

    const totalRequired = amount;

    if (wallet.balance.lt(totalRequired)) {
      throw new Error("Insufficient wallet balance.");
    }

    const newBalance = wallet.balance.sub(totalRequired);

    await tx.vendorWallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: newBalance,
        reservedBalance: wallet.reservedBalance.add(
          totalRequired
        ),
        lastUpdatedAt: new Date(),
      },
    });

    const netAmount = amount.sub(feeAmount);

    const withdrawal = await tx.vendorWithdrawal.create({
      data: {
        vendorId,
        amount,
        fee: feeAmount,
        netAmount,

        paymentMethod: data.paymentMethod,
        accountDetails: data.accountDetails,

        status: "pending",
        requestedAt: new Date(),
      },
    });

    return withdrawal;
  });
};

export const getWithdrawals = async (
  vendorId: bigint,
  status?: string
) => {
  return prisma.vendorWithdrawal.findMany({
    where: {
      vendorId,
      ...(status ? { status } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getWithdrawalById = async (
  withdrawalId: bigint
) => {
  const withdrawal = await prisma.vendorWithdrawal.findUnique({
    where: {
      id: withdrawalId,
    },
    include: {
      vendor: {
        select: {
          id: true,
          uuid: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal not found.");
  }

  return withdrawal;
};

export const approveWithdrawal = async (
  withdrawalId: bigint
) => {
  const withdrawal = await prisma.vendorWithdrawal.findUnique({
    where: {
      id: withdrawalId,
    },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal not found.");
  }

  if (withdrawal.status !== "pending") {
    throw new Error(
      `Cannot approve withdrawal with status "${withdrawal.status}".`
    );
  }

  return prisma.vendorWithdrawal.update({
    where: {
      id: withdrawalId,
    },
    data: {
      status: "approved",
      processedAt: new Date(),
    },
  });
};

export const processWithdrawal = async (
  withdrawalId: bigint,
  referenceId?: string
) => {
  const withdrawal = await prisma.vendorWithdrawal.findUnique({
    where: {
      id: withdrawalId,
    },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal not found.");
  }

  if (
    withdrawal.status !== "approved" &&
    withdrawal.status !== "pending"
  ) {
    throw new Error(
      `Cannot process withdrawal with status "${withdrawal.status}".`
    );
  }

  return prisma.vendorWithdrawal.update({
    where: {
      id: withdrawalId,
    },
    data: {
      status: "processing",
      processedAt: new Date(),
      referenceId,
    },
  });
};

export const completeWithdrawal = async (
  withdrawalId: bigint,
  referenceId?: string
) => {
  return prisma.$transaction(async (tx) => {
    const withdrawal = await tx.vendorWithdrawal.findUnique({
      where: {
        id: withdrawalId,
      },
    });

    if (!withdrawal) {
      throw new Error("Withdrawal not found.");
    }

    if (
      withdrawal.status !== "processing" &&
      withdrawal.status !== "approved"
    ) {
      throw new Error(
        `Cannot complete withdrawal with status "${withdrawal.status}".`
      );
    }

    const wallet = await tx.vendorWallet.findUnique({
      where: {
        vendorId: withdrawal.vendorId,
      },
    });

    if (!wallet) {
      throw new Error("Vendor wallet not found.");
    }

    const reservedAfter = wallet.reservedBalance.sub(
      withdrawal.amount
    );

    if (reservedAfter.lt(0)) {
      throw new Error("Invalid reserved wallet balance.");
    }

    await tx.vendorWallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        reservedBalance: reservedAfter,
        lastUpdatedAt: new Date(),
      },
    });

    return tx.vendorWithdrawal.update({
      where: {
        id: withdrawalId,
      },
      data: {
        status: "completed",
        completedAt: new Date(),
        referenceId:
          referenceId ?? withdrawal.referenceId,
      },
    });
  });
};

export const rejectWithdrawal = async (
  withdrawalId: bigint,
  failureReason: string
) => {
  return prisma.$transaction(async (tx) => {
    const withdrawal = await tx.vendorWithdrawal.findUnique({
      where: {
        id: withdrawalId,
      },
    });

    if (!withdrawal) {
      throw new Error("Withdrawal not found.");
    }

    if (
      withdrawal.status !== "pending" &&
      withdrawal.status !== "approved" &&
      withdrawal.status !== "processing"
    ) {
      throw new Error(
        `Cannot reject withdrawal with status "${withdrawal.status}".`
      );
    }

    const wallet = await tx.vendorWallet.findUnique({
      where: {
        vendorId: withdrawal.vendorId,
      },
    });

    if (!wallet) {
      throw new Error("Vendor wallet not found.");
    }

    const amount = withdrawal.amount;

    const newBalance = wallet.balance.add(amount);

    const newReservedBalance =
      wallet.reservedBalance.gte(amount)
        ? wallet.reservedBalance.sub(amount)
        : new Prisma.Decimal(0);

    await tx.vendorWallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: newBalance,
        reservedBalance: newReservedBalance,
        lastUpdatedAt: new Date(),
      },
    });

    return tx.vendorWithdrawal.update({
      where: {
        id: withdrawalId,
      },
      data: {
        status: "rejected",
        failureReason,
      },
    });
  });
};