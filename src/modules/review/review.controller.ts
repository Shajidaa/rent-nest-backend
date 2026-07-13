import { Request, NextFunction, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import HttpStatus from "http-status";
const createdReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const review = req.body;
    const result = await reviewService.createdReview(review);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "Review created successfully",
      data: result,
    });
  },
);

export const reviewController = {
  createdReview,
};
