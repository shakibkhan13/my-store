import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";

interface BrandData {
  name: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
}

interface UpdateBrandData {
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
}

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const uniqueSlug = async (
  slug: string,
  excludeId?: bigint
): Promise<string> => {
  let finalSlug = slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.brand.findFirst({
      where: {
        slug: finalSlug,
        ...(excludeId
          ? {
              id: {
                not: excludeId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return finalSlug;
    }

    finalSlug = `${slug}-${counter}`;
    counter++;
  }
};

// ============================================================
// CREATE BRAND
// ============================================================

export const createBrand = async (data: BrandData) => {
  const slug = await uniqueSlug(
    generateSlug(data.slug || data.name)
  );

  return prisma.brand.create({
    data: {
      name: data.name,
      slug,
      logoUrl: data.logoUrl ?? null,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
};

// ============================================================
// GET BRANDS
// ============================================================

export const getBrands = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) => {
  const page = Math.max(params.page || 1, 1);
  const limit = Math.min(Math.max(params.limit || 10, 1), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.BrandWhereInput = {
    deletedAt: null,
  };

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
    ];
  }

  if (params.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),

    prisma.brand.count({
      where,
    }),
  ]);

  return {
    data: brands,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================================
// GET BRAND BY ID
// ============================================================

export const getBrandById = async (id: bigint) => {
  return prisma.brand.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
};

// ============================================================
// UPDATE BRAND
// ============================================================
export const updateBrand = async (
  id: bigint,
  data: UpdateBrandData
) => {
  const existing = await prisma.brand.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Brand not found.");
  }

  let slug = existing.slug;

  if (data.slug || data.name) {
    slug = await uniqueSlug(
      generateSlug(data.slug || data.name || existing.name),
      id
    );
  }

  return prisma.brand.update({
    where: {
      id,
    },
    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.slug !== undefined || data.name !== undefined
        ? {
            slug,
          }
        : {}),

      ...(data.logoUrl !== undefined && {
        logoUrl: data.logoUrl,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
};

// ============================================================
// DELETE BRAND
// ============================================================

export const deleteBrand = async (id: bigint) => {
  const brand = await prisma.brand.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!brand) {
    throw new Error("Brand not found.");
  }

  if (brand._count.products > 0) {
    throw new Error(
      "Cannot delete brand because products are assigned to it."
    );
  }

  return prisma.brand.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });
};