import { prisma } from "../config/db.js";
import type { ReviewStatus, Prisma } from "@prisma/client";

const reviewInclude = {
  user: { select: { firstName: true, lastName: true } },
  images: { orderBy: { position: "asc" as const } },
} as const;

export const reviewRepository = {
  /** A DELIVERED order item for this product/user that isn't already
   * linked to a review — the purchase a new review would attach to. Also
   * doubles as the "can this user review this product at all" check. */
  findReviewableOrderItem(userId: string, productId: string) {
    return prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: "DELIVERED" },
        review: null,
      },
    });
  },

  findByProductAndUser(productId: string, userId: string) {
    return prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
      include: reviewInclude,
    });
  },

  findById(id: string) {
    return prisma.review.findUnique({ where: { id }, include: reviewInclude });
  },

  async findManyForProduct(
    productId: string,
    sort: "newest" | "highest_rated" | "lowest_rated",
    pagination: { page: number; pageSize: number },
  ) {
    const orderBy: Prisma.ReviewOrderByWithRelationInput =
      sort === "highest_rated"
        ? { rating: "desc" }
        : sort === "lowest_rated"
          ? { rating: "asc" }
          : { createdAt: "desc" };

    const where: Prisma.ReviewWhereInput = { productId, status: "APPROVED" };

    const [items, totalItems] = await Promise.all([
      prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      prisma.review.count({ where }),
    ]);

    return { items, totalItems };
  },

  /** Rating distribution (how many 5-star, 4-star, ...) via GROUP BY —
   * powers the bar-chart breakdown on the product page. */
  async findRatingDistribution(productId: string) {
    const rows = await prisma.$queryRaw<{ rating: number; count: bigint }[]>`
      SELECT rating, COUNT(*) AS count
      FROM reviews
      WHERE product_id = ${productId} AND status = 'APPROVED'
      GROUP BY rating
    `;
    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of rows) {
      distribution[row.rating as 1 | 2 | 3 | 4 | 5] = Number(row.count);
    }
    return distribution;
  },

  create(
    userId: string,
    input: { productId: string; orderItemId: string; rating: number; title?: string; body: string },
  ) {
    return prisma.review.create({
      data: {
        userId,
        productId: input.productId,
        orderItemId: input.orderItemId,
        rating: input.rating,
        title: input.title,
        body: input.body,
        isVerifiedPurchase: true,
        status: "PENDING",
      },
    });
  },

  update(id: string, input: { rating?: number; title?: string; body?: string; status: ReviewStatus }) {
    return prisma.review.update({ where: { id }, data: input });
  },

  delete(id: string) {
    return prisma.review.delete({ where: { id } });
  },

  setImages(reviewId: string, urls: string[]) {
    return prisma.$transaction([
      prisma.reviewImage.deleteMany({ where: { reviewId } }),
      ...(urls.length > 0
        ? [
            prisma.reviewImage.createMany({
              data: urls.map((url, position) => ({ reviewId, url, position })),
            }),
          ]
        : []),
    ]);
  },

  setStatus(id: string, status: ReviewStatus) {
    return prisma.review.update({ where: { id }, data: { status } });
  },

  async findManyForAdmin(
    status: ReviewStatus | undefined,
    pagination: { page: number; pageSize: number },
  ) {
    const where: Prisma.ReviewWhereInput = status ? { status } : {};
    const [items, totalItems] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          ...reviewInclude,
          product: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      prisma.review.count({ where }),
    ]);
    return { items, totalItems };
  },
};
