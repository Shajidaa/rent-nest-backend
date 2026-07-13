import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";

export const isRentalPaid = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { rentalRequestId } = req.body;

    if (!rentalRequestId) {
      return res.status(400).json({
        success: false,
        message: "Rental ID is required!",
      });
    }

    const rental = await prisma.rental.findFirst({
      where: {
        id: rentalRequestId,
        tenantId: userId,
        status: "PAID",
      },
    });

    if (!rental) {
      await prisma.rental.findUnique({
        where: { id: rentalRequestId },
      });

      return res.status(403).json({
        success: false,
        message: "You have not access to reviews this land",
      });
    }

    req.rental = rental;
    next();
  },
);
