import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { LandlordService } from "./landlord.service";
import httpStatus from "http-status";
const creteLandlord = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;

    const landlordData = req.body;
    const landlord = await LandlordService.createLandlord(
      landlordData,
      landlordId as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Landlord created successfully",
      data: landlord,
    });
  },
);
const getLandlordProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const properties = await LandlordService.getLandlordProperties(
      landlordId as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Landlord properties retrieved successfully",
      data: { total: properties.length, data: properties },
    });
  },
);
export const landlordController = {
  creteLandlord,
  getLandlordProperties,
};
