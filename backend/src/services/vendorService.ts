import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";

interface CreateVendorData {
  ownerId: bigint;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  commissionRate?: number;
}

interface UpdateVendorData {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  commissionRate?: number;
}

const vendorInclude = {
  owner: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
  staff: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      role: true,
    },
  },
  wallet: true,
  _count: {
    select: {
      products: true,
      staff: true,
      withdrawals: true,
    },
  },
};

export const createVendor = async (data: CreateVendorData) => {
  const existingSlug = await prisma.vendor.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (existingSlug) {
    throw new Error("Vendor slug already exists.");
  }

  const owner = await prisma.user.findUnique({
    where: {
      id: data.ownerId,
    },
  });

  if (!owner) {
    throw new Error("Vendor owner not found.");
  }

  const vendor = await prisma.$transaction(async (tx) => {
    const newVendor = await tx.vendor.create({
      data: {
        ownerId: data.ownerId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        phone: data.phone,
        email: data.email,
        website: data.website,
        taxId: data.taxId,

        commissionRate: new Prisma.Decimal(
          data.commissionRate ?? 0
        ),
      },
    });

    await tx.vendorWallet.create({
      data: {
        vendorId: newVendor.id,
        balance: new Prisma.Decimal(0),
        reservedBalance: new Prisma.Decimal(0),
        currency: "BDT",
      },
    });

    return newVendor;
  });

  return prisma.vendor.findUnique({
    where: {
      id: vendor.id,
    },
    include: vendorInclude,
  });
};

export const getVendors = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const page = Math.max(params.page ?? 1, 1);
  const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.VendorWhereInput = {
    deletedAt: null,
  };

  if (params.status) {
    where.status = params.status;
  }

  if (params.search) {
    where.OR = [
      {
        name: {
          contains: params.search,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: params.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: params.search,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: params.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [vendors, total] = await prisma.$transaction([
    prisma.vendor.findMany({
      where,
      include: vendorInclude,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.vendor.count({
      where,
    }),
  ]);

  return {
    data: vendors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getVendorById = async (vendorId: bigint) => {
  const vendor = await prisma.vendor.findFirst({
    where: {
      id: vendorId,
      deletedAt: null,
    },
    include: vendorInclude,
  });

  if (!vendor) {
    throw new Error("Vendor not found.");
  }

  return vendor;
};

export const updateVendor = async (
  vendorId: bigint,
  data: UpdateVendorData
) => {
  const existingVendor = await prisma.vendor.findFirst({
    where: {
      id: vendorId,
      deletedAt: null,
    },
  });

  if (!existingVendor) {
    throw new Error("Vendor not found.");
  }

  if (data.slug && data.slug !== existingVendor.slug) {
    const slugExists = await prisma.vendor.findFirst({
      where: {
        slug: data.slug,
        NOT: {
          id: vendorId,
        },
      },
    });

    if (slugExists) {
      throw new Error("Vendor slug already exists.");
    }
  }

  const vendor = await prisma.vendor.update({
    where: {
      id: vendorId,
    },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      logoUrl: data.logoUrl,
      bannerUrl: data.bannerUrl,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      phone: data.phone,
      email: data.email,
      website: data.website,
      taxId: data.taxId,

      ...(data.commissionRate !== undefined && {
        commissionRate: new Prisma.Decimal(data.commissionRate),
      }),
    },
    include: vendorInclude,
  });

  return vendor;
};

export const updateVendorStatus = async (
  vendorId: bigint,
  status: string
) => {
  const allowedStatuses = [
    "pending",
    "active",
    "inactive",
    "suspended",
    "rejected",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
    );
  }

  const vendor = await prisma.vendor.findFirst({
    where: {
      id: vendorId,
      deletedAt: null,
    },
  });

  if (!vendor) {
    throw new Error("Vendor not found.");
  }

  return prisma.vendor.update({
    where: {
      id: vendorId,
    },
    data: {
      status,
      isVerified: status === "active" ? vendor.isVerified : false,
    },
    include: vendorInclude,
  });
};

export const verifyVendor = async (
  vendorId: bigint,
  isVerified: boolean
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

  return prisma.vendor.update({
    where: {
      id: vendorId,
    },
    data: {
      isVerified,
    },
    include: vendorInclude,
  });
};

export const deleteVendor = async (vendorId: bigint) => {
  const vendor = await prisma.vendor.findFirst({
    where: {
      id: vendorId,
      deletedAt: null,
    },
  });

  if (!vendor) {
    throw new Error("Vendor not found.");
  }

  return prisma.vendor.update({
    where: {
      id: vendorId,
    },
    data: {
      deletedAt: new Date(),
      status: "inactive",
    },
  });
};