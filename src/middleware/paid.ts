import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const validateRentalAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { rentalId } = req.body;
  const tenantId = req.user?.id;

  if (!rentalId) {
    return res.status(400).json({ message: "Rental ID is required" });
  }

  const rental = await prisma.rental.findFirst({
    where: {
      id: rentalId,
      tenantId: tenantId,
      status: "PAID",
    },
  });

  if (!rental) {
    return res
      .status(403)
      .json({ message: "You are not authorized to review this rental." });
  }

  req.rental = rental;

  next();
};
