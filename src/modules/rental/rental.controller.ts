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
const getRentedRentalId = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.id; 
    const { propertyId } = req.query; 

    if (!tenantId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!propertyId) {
      return res.status(400).json({ success: false, message: "Property ID is required" });
    }

    const rentalId = await rentalService.getRentedRentalIdForTenantAndProperty(
      tenantId,
      propertyId as string
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Rented rental ID fetched successfully",
      data: rentalId,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const rentalController = {
  createRentalRequest,

  getMyRentals,
  getRentalDetails,
  getRentedRentalId
    
};
