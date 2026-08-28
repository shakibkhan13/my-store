import prisma from "../config/db.js";

// ============================================================
// CREATE REVIEW
// ============================================================

export const createReview = async (
  userId: bigint,
  productId: bigint,
  rating: number,
  comment?: string
) => {
  // ----------------------------------------------------------
  // Validate rating
  // ----------------------------------------------------------

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  // ----------------------------------------------------------
  // Check product
  // ----------------------------------------------------------

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  // ----------------------------------------------------------
  // Check existing review
  // ----------------------------------------------------------

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this product.");
  }

  // ----------------------------------------------------------
  // Create review
  // ----------------------------------------------------------

  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment: comment?.trim() || null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return review;
};

// ============================================================
// GET PRODUCT REVIEWS
// ============================================================

export const getProductReviews = async (
  productId: bigint,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  // ----------------------------------------------------------
  // Check product
  // ----------------------------------------------------------

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  // ----------------------------------------------------------
  // Reviews
  // ----------------------------------------------------------

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),

    prisma.review.count({
      where: {
        productId,
        isApproved: true,
      },
    }),
  ]);

  // ----------------------------------------------------------
  // Rating summary
  // ----------------------------------------------------------

  const ratingData = await prisma.review.groupBy({
    by: ["rating"],
    where: {
      productId,
      isApproved: true,
    },
    _count: {
      rating: true,
    },
  });

  const ratingBreakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  for (const item of ratingData) {
    ratingBreakdown[item.rating as 1 | 2 | 3 | 4 | 5] =
      item._count.rating;
  }

  const totalRatings = Object.values(ratingBreakdown).reduce(
    (sum, value) => sum + value,
    0
  );

  const totalRatingScore =
    Object.entries(ratingBreakdown).reduce(
      (sum, [rating, count]) =>
        sum + Number(rating) * count,
      0
    );

  const averageRating =
    totalRatings > 0
      ? Number((totalRatingScore / totalRatings).toFixed(2))
      : 0;

  return {
    product,
    summary: {
      averageRating,
      totalReviews: total,
      ratingBreakdown,
    },
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================================
// GET MY REVIEWS
// ============================================================

export const getMyReviews = async (
  userId: bigint,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        userId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              where: {
                isPrimary: true,
              },
              take: 1,
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
    }),

    prisma.review.count({
      where: {
        userId,
      },
    }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================================
// GET SINGLE REVIEW
// ============================================================

export const getReviewById = async (
  reviewId: bigint,
  userId?: bigint
) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      ...(userId ? { userId } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  return review;
};

// ============================================================
// UPDATE REVIEW
// ============================================================

export const updateReview = async (
  reviewId: bigint,
  userId: bigint,
  rating?: number,
  comment?: string
) => {
  // ----------------------------------------------------------
  // Validate rating
  // ----------------------------------------------------------

  if (
    rating !== undefined &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  // ----------------------------------------------------------
  // Check review ownership
  // ----------------------------------------------------------

  const existingReview = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId,
    },
  });

  if (!existingReview) {
    throw new Error("Review not found.");
  }

  // ----------------------------------------------------------
  // Update
  // ----------------------------------------------------------

  const review = await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      ...(rating !== undefined ? { rating } : {}),
      ...(comment !== undefined
        ? { comment: comment.trim() || null }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return review;
};

// ============================================================
// DELETE REVIEW
// ============================================================

export const deleteReview = async (
  reviewId: bigint,
  userId: bigint
) => {
  const existingReview = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId,
    },
  });

  if (!existingReview) {
    throw new Error("Review not found.");
  }

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  return true;
};