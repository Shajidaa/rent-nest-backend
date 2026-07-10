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
  landlordId: string,
  requestId: string,
  newStatus: RequestStatus,
) => {
  return await prisma.$transaction(async (tx) => {
    const rentalRequest = await tx.rental.findUniqueOrThrow({
      where: { id: requestId },
      include: { property: true },
    });

    const updatedRequest = await tx.rental.update({
      where: { id: requestId },
      data: { status: newStatus },
    });

    if (newStatus === RequestStatus.APPROVED) {
      await tx.property.update({
        where: { id: rentalRequest.propertyId },
        data: { status: "PENDING" },
      });
    } else if (newStatus === RequestStatus.REJECTED) {
      await tx.property.update({
        where: { id: rentalRequest.propertyId },
        data: { status: "AVAILABLE" },
      });
    }

    return updatedRequest;
  });
};
const getPropertyRequests = async (propertyId: string) => {
  const requests = await prisma.rental.findMany({
    where: {
      propertyId: propertyId,
    },
    include: {
      tenant: true,
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
