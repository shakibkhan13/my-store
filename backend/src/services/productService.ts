import  prisma  from "../config/db.js";

interface CreateProductData {
    vendorId: bigint;
    categoryId?: bigint | null;
    brandId?: bigint | null;

    name: string;
    slug: string;

    shortDescription?: string | null;
    description?: string | null;

    productType?: string;
    status?: string;

    isFeatured?: boolean;

    seoTitle?: string | null;
    seoDescription?: string | null;
}

interface UpdateProductData {
    vendorId?: bigint;
    categoryId?: bigint | null;
    brandId?: bigint | null;

    name?: string;
    slug?: string;

    shortDescription?: string | null;
    description?: string | null;

    productType?: string;
    status?: string;

    isFeatured?: boolean;

    seoTitle?: string | null;
    seoDescription?: string | null;
}

export const createProduct = async (
    data: CreateProductData
) => {
    return prisma.product.create({
        data,
        include: {
            vendor: true,
            category: true,
            brand: true,
            images: true,
            variants: {
                include: {
                    attributes: {
                        include: {
                            attribute: true,
                            attributeValue: true,
                        },
                    },
                    images: true,
                },
            },
        },
    });
};

export const getProducts = async () => {
    return prisma.product.findMany({
        where: {
            deletedAt: null,
        },

        include: {
            vendor: true,
            category: true,
            brand: true,
            images: {
                orderBy: {
                    sortOrder: "asc",
                },
            },
            variants: {
                where: {
                    deletedAt: null,
                },
                include: {
                    attributes: {
                        include: {
                            attribute: true,
                            attributeValue: true,
                        },
                    },
                    images: {
                        orderBy: {
                            sortOrder: "asc",
                        },
                    },
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};

export const getProductById = async (
    id: bigint
) => {
    return prisma.product.findFirst({
        where: {
            id,
            deletedAt: null,
        },

        include: {
            vendor: true,
            category: true,
            brand: true,

            images: {
                orderBy: {
                    sortOrder: "asc",
                },
            },

            attributes: {
                include: {
                    attribute: {
                        include: {
                            values: true,
                        },
                    },
                },
            },

            variants: {
                where: {
                    deletedAt: null,
                },

                include: {
                    attributes: {
                        include: {
                            attribute: true,
                            attributeValue: true,
                        },
                    },

                    images: {
                        orderBy: {
                            sortOrder: "asc",
                        },
                    },
                },
            },
        },
    });
};

export const updateProduct = async (
    id: bigint,
    data: UpdateProductData
) => {
    return prisma.product.update({
        where: {
            id,
        },

        data,

        include: {
            vendor: true,
            category: true,
            brand: true,
            images: true,
            variants: {
                where: {
                    deletedAt: null,
                },
                include: {
                    images: true,
                },
            },
        },
    });
};

export const deleteProduct = async (
    id: bigint
) => {
    return prisma.product.update({
        where: {
            id,
        },

        data: {
            deletedAt: new Date(),
        },
    });
};