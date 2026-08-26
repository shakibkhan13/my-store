import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";

// ============================================================
// CREATE ATTRIBUTE
// ============================================================

export const createAttribute = async (data: {
  name: string;
  slug: string;
  type: string;
  isGlobal?: boolean;
}) => {
  return await prisma.attribute.create({
    data: {
      name: data.name,
      slug: data.slug,
      type: data.type,
      isGlobal: data.isGlobal ?? true,
    },
  });
};

// ============================================================
// GET ALL ATTRIBUTES
// ============================================================

export const getAllAttributes = async () => {
  return await prisma.attribute.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      values: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
};

// ============================================================
// GET SINGLE ATTRIBUTE
// ============================================================

export const getAttributeById = async (id: bigint) => {
  return await prisma.attribute.findUnique({
    where: {
      id,
    },
    include: {
      values: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
};

// ============================================================
// UPDATE ATTRIBUTE
// ============================================================

export const updateAttribute = async (
  id: bigint,
  data: {
    name?: string;
    slug?: string;
    type?: string;
    isGlobal?: boolean;
  }
) => {
  return await prisma.attribute.update({
    where: {
      id,
    },
    data,
  });
};

// ============================================================
// DELETE ATTRIBUTE
// ============================================================

export const deleteAttribute = async (id: bigint) => {
  return await prisma.attribute.delete({
    where: {
      id,
    },
  });
};

// ============================================================
// CREATE ATTRIBUTE VALUE
// ============================================================

export const createAttributeValue = async (data: {
  attributeId: bigint;
  value: string;
  slug?: string;
  sortOrder?: number;
}) => {
  return await prisma.attributeValue.create({
    data: {
      attributeId: data.attributeId,
      value: data.value,
      slug: data.slug,
      sortOrder: data.sortOrder ?? 0,
    },
    include: {
      attribute: true,
    },
  });
};

// ============================================================
// GET ALL ATTRIBUTE VALUES
// ============================================================

export const getAllAttributeValues = async (attributeId?: bigint) => {
  return await prisma.attributeValue.findMany({
    where: attributeId
      ? {
          attributeId,
        }
      : undefined,

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        id: "desc",
      },
    ],

    include: {
      attribute: true,
    },
  });
};

// ============================================================
// GET SINGLE ATTRIBUTE VALUE
// ============================================================

export const getAttributeValueById = async (id: bigint) => {
  return await prisma.attributeValue.findUnique({
    where: {
      id,
    },
    include: {
      attribute: true,
    },
  });
};

// ============================================================
// UPDATE ATTRIBUTE VALUE
// ============================================================

export const updateAttributeValue = async (
  id: bigint,
  data: {
    value?: string;
    slug?: string;
    sortOrder?: number;
  }
) => {
  return await prisma.attributeValue.update({
    where: {
      id,
    },
    data,
    include: {
      attribute: true,
    },
  });
};

// ============================================================
// DELETE ATTRIBUTE VALUE
// ============================================================

export const deleteAttributeValue = async (id: bigint) => {
  return await prisma.attributeValue.delete({
    where: {
      id,
    },
  });
};