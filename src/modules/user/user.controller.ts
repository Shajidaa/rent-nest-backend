import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
const createdUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await userService.createUserFromDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "user created successfully",
      data: {
        result,
      },
    });
  },
);
const getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;

    const verifiedToken = jwtUtils.verifyToken(
      accessToken,
      config.JWT_ACCESS_SECRET,
    );

    if (typeof verifiedToken === "string") {
      throw new Error(verifiedToken);
    }

    if (!verifiedToken || !verifiedToken.data?.id) {
      throw new Error("Unauthorized: Invalid token payload");
    }

    const profile = await userService.getMyProfile(verifiedToken.data.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Get my profile successfully",
      data: { profile },
    });
  },
);
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const payload = req.body;

    const result = await userService.updateMyProfile(userId, payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Update my profile successfully!",
      data: result,
    });
  },
);
export const userController = {
  createdUser,
  getProfile,
  updateProfile,
};
