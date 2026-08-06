import { prisma } from "../../lib/prisma";
import { IReview } from "./review.interface";

const createdReview = async (
  tenantId: string,
  propertyId: string,
  rentalId: string,
  payload: IReview,
) => {
  const newReview = await prisma.review.create({
    data: {
      propertyId: propertyId,
      tenantId: tenantId,
      rentalId: rentalId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  return newReview;
};
const getReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  return review;
};
const getReviewsByProperty = async (propertyId: string) => {
  const reviews = await prisma.review.findMany({
    where: { propertyId },
    include: {
      tenant: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return reviews;
};
export const reviewService = {
  createdReview,
  getReview,
  getReviewsByProperty,
};
