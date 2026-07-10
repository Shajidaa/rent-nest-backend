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
const updateLandlord = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const landId = req.params.id;
    const updateData = req.body;

    const updatedLandlord = await LandlordService.updateLandlord(
      landlordId as string,
      landId as string,
      updateData,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Landlord updated successfully",
      data: updatedLandlord,
    });
  },
);
const deleteLandlord = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const landId = req.params.id;
    await LandlordService.deleteLandlord(
      landlordId as string,
      landId as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Landlord deleted successfully",
      data: null,
    });
  },
);
const updateLandlordStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenant = req.user?.id;
    const landId = req.params.id;
    const { status } = req.body;
    const property = await LandlordService.updateLandlordStatusDB(
      tenant as string,
      landId as string,
      status,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Landlord updated successfully",
      data: property,
    });
  },
);
export const landlordController = {
  creteLandlord,
  getLandlordProperties,
  updateLandlord,
  deleteLandlord,
  updateLandlordStatus,
};
