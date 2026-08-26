import prisma from "../config/db.js";

const staffInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
    },
  },
  role: true,
  vendor: {
    select: {
      id: true,
      uuid: true,
      name: true,
      slug: true,
    },
  },
};

export const getVendorStaff = async (vendorId: bigint) => {
  const vendor = await prisma.vendor.findFirst({
    where: {
      id: vendorId,
      deletedAt: null,
    },
  });

  if (!vendor) {
    throw new Error("Vendor not found.");
  }

  return prisma.vendorStaff.findMany({
    where: {
      vendorId,
    },
    include: staffInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const addVendorStaff = async (
  vendorId: bigint,
  userId: bigint,
  roleId?: bigint
) => {
  const vendor = await prisma.vendor.findFirst({
    where: {
      id: vendorId,
      deletedAt: null,
    },
  });

  if (!vendor) {
    throw new Error("Vendor not found.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (roleId) {
    const role = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new Error("Role not found.");
    }
  }

  const existingStaff = await prisma.vendorStaff.findUnique({
    where: {
      vendorId_userId: {
        vendorId,
        userId,
      },
    },
  });

  if (existingStaff) {
    throw new Error("User is already a staff member of this vendor.");
  }

  return prisma.vendorStaff.create({
    data: {
      vendorId,
      userId,
      roleId: roleId ?? null,
    },
    include: staffInclude,
  });
};

export const updateVendorStaff = async (
  staffId: bigint,
  data: {
    roleId?: bigint | null;
    isActive?: boolean;
  }
) => {
  const staff = await prisma.vendorStaff.findUnique({
    where: {
      id: staffId,
    },
  });

  if (!staff) {
    throw new Error("Vendor staff not found.");
  }

  if (data.roleId) {
    const role = await prisma.role.findUnique({
      where: {
        id: data.roleId,
      },
    });

    if (!role) {
      throw new Error("Role not found.");
    }
  }

  return prisma.vendorStaff.update({
    where: {
      id: staffId,
    },
    data: {
      ...(data.roleId !== undefined && {
        roleId: data.roleId,
      }),

      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
    },
    include: staffInclude,
  });
};

export const removeVendorStaff = async (staffId: bigint) => {
  const staff = await prisma.vendorStaff.findUnique({
    where: {
      id: staffId,
    },
  });

  if (!staff) {
    throw new Error("Vendor staff not found.");
  }

  await prisma.vendorStaff.delete({
    where: {
      id: staffId,
    },
  });
};