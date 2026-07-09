import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { propertyService } from "./property.service";

const getAllProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    const properties = await propertyService.getAllProperties(query);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Properties fetched successfully",
      data: properties,
    });
  },
);
export const PropertyController = {
  getAllProperties,
};
