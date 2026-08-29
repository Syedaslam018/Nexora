export interface ReviewImage {
  id: string;
  url: string;
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string;
  isVerifiedPurchase: boolean;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  createdAt: string;
  user: { firstName: string; lastName: string };
  images: ReviewImage[];
}

export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export interface CreateReviewInput {
  productId: string;
  rating: number;
  title?: string;
  body: string;
  images?: string[];
}

export type UpdateReviewInput = Partial<Omit<CreateReviewInput, "productId">>;
