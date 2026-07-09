import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { propertyService } from "./property.service";
import HttpStatus from "http-status";
const getAllProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    const properties = await propertyService.getAllProperties(query);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Properties fetched successfully",
      data: properties,
    });
  },
);
const getPropertyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const property = await propertyService.getPropertyId(id as string);
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Property get successfully",
      data: property,
    });
  },
);
export const PropertyController = {
  getAllProperties,
  getPropertyById,
};
