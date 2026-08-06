import { Request, NextFunction, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import HttpStatus from "http-status";
const createdReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const { propertyId, rentalId } = req.body;

    const review = req.body;
    const result = await reviewService.createdReview(
      tenantId as string,
      propertyId,
      rentalId,
      review,
    );
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "Review created successfully",
      data: result,
    });
  },
);
const getReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = req.params.id;

    const result = await reviewService.getReview(reviewId as string);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Review fetched successfully",
      data: result,
    });
  },
);
const getReviewsByProperty = catchAsync(async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const result = await reviewService.getReviewsByProperty(propertyId as string);
  sendResponse(res, {
    success: true,
    statusCode: HttpStatus.OK,
    message: "Reviews fetched successfully",
    data: result,
  });
});
export const reviewController = {
  createdReview,
  getReview,
  getReviewsByProperty,
};
