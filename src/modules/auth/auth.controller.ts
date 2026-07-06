import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import setCookie from "../../utils/cookie";

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { accessToken, refreshToken } =
      await authService.loginFromDB(payload);
    // tokens set on browser
    setCookie(res, "accessToken", accessToken, 60 * 60 * 24);

    setCookie(
      res,
      "refreshToken",
      refreshToken,
      Number(process.env.COOKIE_REFRESH_MAX_AGE),
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User login successfully",
      data: { accessToken, refreshToken },
    });
  },
);

const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    const accessToken = await authService.refreshTokenDB(refreshToken);
    setCookie(res, "accessToken", accessToken, 60 * 60 * 24);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Refresh Token get successfully",
      data: { accessToken },
    });
  },
);

export const authController = {
  login,
  refreshToken,
};
