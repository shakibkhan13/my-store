import  prisma  from "../config/db.js";

export const createVariantImage = async (
    data: {
        variantId: bigint;
        imageUrl: string;
        sortOrder?: number;
        isPrimary?: boolean;
    }
) => {
    if (data.isPrimary) {
        await prisma.variantImage.updateMany({
            where: {
                variantId: data.variantId,
            },

            data: {
                isPrimary: false,
            },
        });
    }

    return prisma.variantImage.create({
        data: {
            variantId: data.variantId,
            imageUrl: data.imageUrl,
            sortOrder: data.sortOrder ?? 0,
            isPrimary: data.isPrimary ?? false,
        },
    });
};

export const getVariantImages = async (
    variantId: bigint
) => {
    return prisma.variantImage.findMany({
        where: {
            variantId,
        },

        orderBy: {
            sortOrder: "asc",
        },
    });
};

export const deleteVariantImage = async (
    id: bigint
) => {
    return prisma.variantImage.delete({
        where: {
            id,
        },
    });
};