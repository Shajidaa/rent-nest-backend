import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const getAllProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const properties = await PropertyService.getAllProperties();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Properties fetched successfully",
      //   data: properties,
    });
  },
);
export const PropertyController = {
  getAllProperties,
};
