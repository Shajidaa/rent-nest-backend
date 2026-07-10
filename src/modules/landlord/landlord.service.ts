import { RequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { CreatePropertyInput } from "./landlord.interface";

const createLandlord = async (
  data: CreatePropertyInput,
  landlordId: string,
) => {
  const { categoryId, ...restOfPropertyData } = data;

  const propertyCreatePayload: any = {
    ...restOfPropertyData,
    user: {
      connect: { id: landlordId },
    },
  };

  if (categoryId) {
    propertyCreatePayload.category = {
      connect: { id: categoryId },
    };
  }

  const newProperty = await prisma.property.create({
    data: propertyCreatePayload,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: true,
    },
  });

  return newProperty;
};
const getLandlordProperties = async (landlordId: string) => {
  const properties = await prisma.property.findMany({
    where: {
      landlordId: landlordId,
    },
    include: {
      category: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return properties;
};
const updateLandlord = async (
  landlordId: string,
  landId: string,
  updateData: any,
) => {
  const updatedLandlord = await prisma.property.update({
    where: { landlordId: landlordId, id: landId },

    data: updateData,
    include: {
      category: true,
      user: {
        select: {
          id: true,

          name: true,
          email: true,
        },
      },
    },
  });
  return updatedLandlord;
};
const deleteLandlord = async (landlordId: string, landId: string) => {
  const deletedLandlord = await prisma.property.delete({
    where: { landlordId: landlordId, id: landId },
  });
  return deletedLandlord;
};

const updateLandlordStatusDB = async (
  rentalId: string,
  propertyId: string,
  status: "APPROVED" | "REJECTED",
) => {
  const isRentalExist = await prisma.rental.findUnique({
    where: { id: rentalId },
  });

  if (!isRentalExist) {
    throw new Error("Rental request not found with the provided ID.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRental = await tx.rental.update({
      where: { id: rentalId },
      data: { status: status },
    });

    if (status === "APPROVED") {
      // Do (isAvailable: false)
      await tx.property.update({
        where: { id: propertyId },
        data: { isAvailable: false, status: "UNAVAILABLE" },
      });

      await tx.rental.updateMany({
        where: {
          propertyId: propertyId,
          id: { not: rentalId },
          status: "PENDING",
        },
        data: { status: "REJECTED" },
      });
    }

    return updatedRental;
  });

  return result;
};
const getPropertyRequests = async (propertyId: string) => {
  const requests = await prisma.rental.findMany({
    where: {
      propertyId: propertyId,
    },
    include: {
      tenant: {
        omit: {
          password: true,
          updatedAt: true,
        },
      },
    },
  });

  return {
    totalRequests: requests.length,
    requests: requests,
  };
};
export const LandlordService = {
  createLandlord,
  getLandlordProperties,
  updateLandlord,
  deleteLandlord,
  updateLandlordStatusDB,
  getPropertyRequests,
};
