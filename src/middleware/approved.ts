import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";

export const isRentalApproved = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { rentalRequestId } = req.body;

    if (!rentalRequestId) {
      return res.status(400).json({
        success: false,
        message: "Rental ID is required!",
      });
    }

    const allRentals = await prisma.rental.findMany({
      where: {
        id: rentalRequestId,
      },
    });
    console.log("All Rentals with this ID:", allRentals);

    const rentalWithTenant = await prisma.rental.findFirst({
      where: {
        id: rentalRequestId,
        tenantId: userId,
      },
    });
    console.log("Rental with Tenant ID:", rentalWithTenant);

    const rental = await prisma.rental.findFirst({
      where: {
        id: rentalRequestId,
        tenantId: userId,
        status: "APPROVED",
      },
    });
    // console.log("Final Rental Query Result:", rental);

    if (!rental) {
      const exists = await prisma.rental.findUnique({
        where: { id: rentalRequestId },
      });

      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to pay. Either the rental request doesn't exist, doesn't belong to you, or is not APPROVED yet.",
      });
    }

    req.rental = rental;
    next();
  },
);
