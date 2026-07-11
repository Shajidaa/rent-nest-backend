import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalService } from "./rental.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rentalData = req.body;

    const tenantId = req.user?.id;
    const status = req.user?.status;

    if (status === "BANNED") {
      throw new Error(`You can't created any rental request. You're banned `);
    }
    const result = await rentalService.createRentalRequestDB({
      ...rentalData,
      tenantId,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental request submitted successfully",
      data: result,
    });
  },
);

const getMyRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const Id = req.user?.id;

    const result = await rentalService.getMyRentalsFromDB(Id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests fetched successfully",
      data: { total: result.length, data: result },
    });
  },
);

const getRentalDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await rentalService.getRentalDetailsFromDB(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request details fetched successfully",
      data: result,
    });
  },
);

export const rentalController = {
  createRentalRequest,

  getMyRentals,
  getRentalDetails,
};
