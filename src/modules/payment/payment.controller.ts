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

// Webhook handler - no catchAsync wrapper needed
const handleWebhook = async (req: Request, res: Response) => {
  console.log("🔔🔔🔔 WEBHOOK HIT! 🔔🔔🔔");
  console.log("Time:", new Date().toISOString());
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body type:", typeof req.body);
  console.log("Is Buffer:", Buffer.isBuffer(req.body));
  console.log("Body length:", req.body?.length || 0);

  const signature = req.headers["stripe-signature"] as string;
  console.log("Signature:", signature ? "Present" : "MISSING!");

  if (!signature) {
    return res.status(400).json({
      error: "Missing stripe-signature header",
    });
  }

  try {
    // req.body is already a Buffer from express.raw middleware
    await paymentServices.handleWebhook(req.body, signature);

    res.status(200).json({
      received: true,
      message: "Webhook processed successfully",
    });
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    res.status(400).json({
      error: error.message,
    });
  }
};

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
