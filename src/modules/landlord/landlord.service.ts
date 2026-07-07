import { prisma } from "../../lib/prisma";

interface CreatePropertyInput {
  title: string;
  description: string;
  city: string;
  area: string;
  fullAddress: string;
  price_per_month: number;
  securityDeposit: number;
  categoryId: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  facing: any;
  veranda?: number;
  images: string[];
  size: number;
  sizeUnit: any;
  utilities: string[];
  preferredTenant: any;
  parking?: boolean;
}

const createLandlord = async (
  data: CreatePropertyInput,
  landlordId: string,
) => {
  const { categoryId, ...restOfPropertyData } = data;

  // Build the core payload first
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
export const LandlordService = {
  createLandlord,
};
