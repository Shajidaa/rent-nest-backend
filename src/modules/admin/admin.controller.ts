import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, searchTerm } = req.query;

  const result = await adminService.getAllUsersFromDb({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    searchTerm: searchTerm as string,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users collection fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await adminService.updateUserStatusInDb(id as string, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User status successfully updated to ${status}`,
    data: result,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, searchTerm } = req.query;

  const result = await adminService.getAllPropertiesFromDb({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    searchTerm: searchTerm as string,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All marketplace properties retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, searchTerm } = req.query;

  const result = await adminService.getAllRentalsFromDb({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    searchTerm: searchTerm as string,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All global rental requests retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentals,
};
