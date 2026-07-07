import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { LandlordService } from "./landlord.service";

const creteLandlord = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;

    const landlordData = req.body;
    const landlord = await LandlordService.createLandlord(
      landlordData,
      landlordId as string,
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Landlord created successfully",
      data: landlord,
    });
  },
);
export const LandlordController = {
  creteLandlord,
};
