import {
  FacingDirection,
  Prisma,
  PropertyStatus,
} from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { CreatePropertyInput } from "../landlord/landlord.interface";
import { PropertyQueryFilter } from "./property.interface";

const getAllProperties = async (query: PropertyQueryFilter) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: Prisma.PropertyWhereInput[] = [];

  // 1. Global Search Term
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  // 2. Dynamic String Filters
  const stringFields: (keyof CreatePropertyInput)[] = [
    "title",
    "description",
    "city",
    "area",
    "fullAddress",
    "amenities",

    "preferredTenant",

    "status",
  ];
  for (const field of stringFields) {
    if (query[field]) {
      andConditions.push({
        [field]: {
          contains: query[field] as string,
          mode: "insensitive",
        },
      } as Prisma.PropertyWhereInput);
    }
  }
  const numberFields: (keyof CreatePropertyInput)[] = [
    "bedrooms",
    "bathrooms",
    "veranda",
    "price_per_month",
    "securityDeposit",
    "size",
  ];

  for (const field of numberFields) {
    if (query[field] !== undefined && query[field] !== "") {
      const numericValue = Number(query[field]);

      if (!isNaN(numericValue)) {
        andConditions.push({
          [field]: numericValue,
        } as Prisma.PropertyWhereInput);
      }
    }
  }

  if (query.isAvailable !== undefined) {
    const isAvailableBool = String(query.isAvailable) === "true";
    andConditions.push({
      isAvailable: isAvailableBool,
    });
  }

  if (query.parking !== undefined) {
    const parkingBool = String(query.parking) === "true";
    andConditions.push({
      parking: parkingBool,
    });
  }
  if (query.status) {
    andConditions.push({
      status: query.status as PropertyStatus,
    });
  }

  if (query.facing) {
    andConditions.push({
      facing: query.facing as FacingDirection,
    });
  }
  if (query.status) {
    const statusArray = Array.isArray(query.status)
      ? query.status
      : JSON.parse(query.status as string);

    if (Array.isArray(statusArray) && statusArray.length > 0) {
      andConditions.push({
        status: {
          in: statusArray as PropertyStatus[],
        },
      });
    }
  }

  if (query.tags) {
    const tagsArray = JSON.parse(query.tags);
    if (Array.isArray(tagsArray) && tagsArray.length > 0) {
      andConditions.push({
        amenities: {
          hasSome: tagsArray,
        },
      });
    }
  }

  const properties = await prisma.property.findMany({
    where: andConditions.length > 0 ? { AND: andConditions } : {},
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: true,
      user: {
        omit: { password: true, createdAt: true, updatedAt: true },
      },
    },
  });

  return properties;
};
const getPropertyId = async (id: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.property.update({
      where: {
        id: id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const property = await tx.property.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    return property;
  });
  return transactionResult;
};
export const propertyService = {
  getAllProperties,
  getPropertyId,
};
