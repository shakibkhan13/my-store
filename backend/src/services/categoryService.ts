import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";

interface CategoryData {
  name: string;
  slug?: string;
  parentId?: bigint | null;
  description?: string | null;
  imageUrl?: string | null;
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
    const existing = await prisma.category.findFirst({
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
// CREATE CATEGORY
// ============================================================

export const createCategory = async (data: CategoryData) => {
  const slug = await uniqueSlug(
    generateSlug(data.slug || data.name)
  );

  if (data.parentId) {
    const parent = await prisma.category.findFirst({
      where: {
        id: data.parentId,
        deletedAt: null,
      },
    });

    if (!parent) {
      throw new Error("Parent category not found.");
    }
  }

  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      parentId: data.parentId ?? null,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      isActive: data.isActive ?? true,
    },
    include: {
      parent: true,
    },
  });
};

// ============================================================
// GET ALL CATEGORIES
// ============================================================

export const getCategories = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  parentId?: bigint | null;
}) => {
  const page = Math.max(params.page || 1, 1);
  const limit = Math.min(Math.max(params.limit || 10, 1), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.CategoryWhereInput = {
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

  if (params.parentId !== undefined) {
    where.parentId = params.parentId;
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    }),

    prisma.category.count({
      where,
    }),
  ]);

  return {
    data: categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================================
// GET CATEGORY BY ID
// ============================================================

export const getCategoryById = async (id: bigint) => {
  return prisma.category.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      parent: true,
      children: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: "asc",
        },
      },
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
  });
};

// ============================================================
// UPDATE CATEGORY
// ============================================================

export const updateCategory = async (
  id: bigint,
  data: CategoryData
) => {
  const existing = await prisma.category.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Category not found.");
  }

  if (data.parentId !== undefined) {
    if (data.parentId === id) {
      throw new Error("Category cannot be its own parent.");
    }

    if (data.parentId) {
      const parent = await prisma.category.findFirst({
        where: {
          id: data.parentId,
          deletedAt: null,
        },
      });

      if (!parent) {
        throw new Error("Parent category not found.");
      }

      // Prevent direct circular relationship
      let currentParentId = parent.parentId;

      while (currentParentId) {
        if (currentParentId === id) {
          throw new Error(
            "Invalid parent category. Circular relationship detected."
          );
        }

        const currentParent = await prisma.category.findUnique({
          where: {
            id: currentParentId,
          },
          select: {
            parentId: true,
          },
        });

        currentParentId = currentParent?.parentId ?? null;
      }
    }
  }

  let slug = existing.slug;

  if (data.slug || data.name) {
    slug = await uniqueSlug(
      generateSlug(data.slug || data.name || existing.name),
      id
    );
  }

  return prisma.category.update({
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

      ...(data.parentId !== undefined && {
        parentId: data.parentId,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.imageUrl !== undefined && {
        imageUrl: data.imageUrl,
      }),

      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
    },
    include: {
      parent: true,
    },
  });
};

// ============================================================
// DELETE CATEGORY
// ============================================================

export const deleteCategory = async (id: bigint) => {
  const category = await prisma.category.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  if (category._count.products > 0) {
    throw new Error(
      "Cannot delete category because products are assigned to it."
    );
  }

  if (category._count.children > 0) {
    throw new Error(
      "Cannot delete category because it has child categories."
    );
  }

  return prisma.category.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });
};