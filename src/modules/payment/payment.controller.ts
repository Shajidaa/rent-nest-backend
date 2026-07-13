// payment.controller.ts
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { paymentServices } from "./payment.service";
import sendResponse from "../../utils/sendResponse";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const tenantId = req.user?.id;
    const tenantEmail = req.user?.email;
    const { rentalRequestId } = req.body;

    const result = await paymentServices.createCheckoutSession(
      tenantId as string,
      tenantEmail as string,
      rentalRequestId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Stripe checkout session initialized successfully",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = req.body as Buffer;
    const signature = req.headers["stripe-signature"]!;

    await paymentServices.handleWebhook(event, signature as string);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Webhook triggered successfully",
      data: JSON.stringify({ received: true }),
    });
  },
);
const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const result = await paymentServices.getPaymentDetails(
    userId as string,
    id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment data retrieved successfully",
    data: result,
  });
});

export const paymentController = {
  createCheckoutSession,
  handleWebhook,
  getPaymentDetails,
};
