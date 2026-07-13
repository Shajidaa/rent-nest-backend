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

export const reviewService = {
  createdReview,
};
