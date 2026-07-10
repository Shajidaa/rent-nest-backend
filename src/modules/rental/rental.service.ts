import { prisma } from "../../lib/prisma";
import { IRentalRequestPayload } from "./rental.interface";

const createRentalRequestDB = async (payload: IRentalRequestPayload) => {
  // console.log("RECEIVED PAYLOAD:", payload);

  const { propertyId, tenantId, status, message, numberOfGuests } = payload;

  if (!tenantId) {
    throw new Error("Authentication failed: tenantId is missing.");
  }

  const propertyData = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!propertyData) {
    throw new Error("Property not found with the provided propertyId.");
  }

  const existingActiveRequest = await prisma.rental.findFirst({
    where: {
      propertyId: propertyId,
      tenantId: tenantId,
      status: {
        in: ["PENDING", "APPROVED"],
      },
    },
  });

  if (existingActiveRequest) {
    throw new Error(
      `You already have a ${existingActiveRequest.status.toLowerCase()} request for this property.`,
    );
  }

  // 3. Set default rental dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 10);

  // 4. Create the new rental request
  const result = await prisma.rental.create({
    data: {
      status: status || "PENDING",
      startDate,
      endDate,
      offeredRent: propertyData.price_per_month,
      message: message || null,
      numberOfGuests: numberOfGuests ? Number(numberOfGuests) : null,

      // Relations connections
      property: {
        connect: { id: propertyId },
      },
      tenant: {
        connect: { id: tenantId },
      },
    },

    include: {
      property: true,
      tenant: {
        omit: {
          password: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return result;
};

const getMyRentalsFromDB = async (tenantId: string) => {
  return await prisma.rental.findMany({
    where: { tenantId: tenantId },
    include: { property: true },
  });
};

const getRentalDetailsFromDB = async (id: string) => {
  const result = await prisma.rental.findUnique({
    where: { id },
    include: {
      property: true,
      tenant: {
        omit: {
          password: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
  return result;
};

export const rentalService = {
  createRentalRequestDB,

  getMyRentalsFromDB,
  getRentalDetailsFromDB,
};
