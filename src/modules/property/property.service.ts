import {
  FacingDirection,
  Prisma,
  PropertyStatus,
} from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { CreatePropertyInput } from "../landlord/landlord.interface";
import { PropertyQueryFilter } from "./property.interface";

// const getAllProperties = async (query: PropertyQueryFilter) => {
//   const limit = query.limit ? Number(query.limit) : 10;
//   const page = query.page ? Number(query.page) : 1;
//   const skip = (page - 1) * limit;

//   const sortBy = query.sortBy || "createdAt";
//   const sortOrder = query.sortOrder || "desc";

//   const andConditions: Prisma.PropertyWhereInput[] = [];

//   // 1. Global Search Term
//   if (query.searchTerm) {
//     andConditions.push({
//       OR: [
//         { title: { contains: query.searchTerm, mode: "insensitive" } },
//         { description: { contains: query.searchTerm, mode: "insensitive" } },
//       ],
//     });
//   }

//   // 2. Dynamic String Filters
//   const stringFields: (keyof CreatePropertyInput)[] = [
//     "title",
//     "description",
//     "city",
//     "area",
//     "fullAddress",
//     "amenities",

//     "preferredTenant",

//     "status",
//   ];
//   for (const field of stringFields) {
//     if (query[field]) {
//       andConditions.push({
//         [field]: {
//           contains: query[field] as string,
//           mode: "insensitive",
//         },
//       } as Prisma.PropertyWhereInput);
//     }
//   }
//   const numberFields: (keyof CreatePropertyInput)[] = [
//     "bedrooms",
//     "bathrooms",
//     "veranda",
//     "price_per_month",
//     "securityDeposit",
//     "size",
//   ];

//   for (const field of numberFields) {
//     if (query[field] !== undefined && query[field] !== "") {
//       const numericValue = Number(query[field]);

//       if (!isNaN(numericValue)) {
//         andConditions.push({
//           [field]: numericValue,
//         } as Prisma.PropertyWhereInput);
//       }
//     }
//   }

//   if (query.isAvailable !== undefined) {
//     const isAvailableBool = String(query.isAvailable) === "true";
//     andConditions.push({
//       isAvailable: isAvailableBool,
//     });
//   }

//   if (query.parking !== undefined) {
//     const parkingBool = String(query.parking) === "true";
//     andConditions.push({
//       parking: parkingBool,
//     });
//   }
//   if (query.status) {
//     andConditions.push({
//       status: query.status as PropertyStatus,
//     });
//   }

//   if (query.facing) {
//     andConditions.push({
//       facing: query.facing as FacingDirection,
//     });
//   }
//   if (query.status) {
//     const statusArray = Array.isArray(query.status)
//       ? query.status
//       : JSON.parse(query.status as string);

//     if (Array.isArray(statusArray) && statusArray.length > 0) {
//       andConditions.push({
//         status: {
//           in: statusArray as PropertyStatus[],
//         },
//       });
//     }
//   }

//   if (query.tags) {
//     const tagsArray = JSON.parse(query.tags);
//     if (Array.isArray(tagsArray) && tagsArray.length > 0) {
//       andConditions.push({
//         amenities: {
//           hasSome: tagsArray,
//         },
//       });
//     }
//   }

//   const properties = await prisma.property.findMany({
//     where: andConditions.length > 0 ? { AND: andConditions } : {},
//     take: limit,
//     skip: skip,
//     orderBy: {
//       [sortBy]: sortOrder,
//     },
//     include: {
//       category: true,
//       user: {
//         omit: { password: true, createdAt: true, updatedAt: true },
//       },
//       review: {
//         omit: {
//           id: true,
//           propertyId: true,
//           rentalId: true,
//           createdAt: true,
//         },
//       },
//     },
//   });

//   return properties;
// };

// import { PrismaClient, Prisma, FacingDirection, PropertyStatus } from "@prisma/client";

// const prisma = new PrismaClient();

export const getAllProperties = async (query: PropertyQueryFilter) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder: Prisma.SortOrder =
    query.sortOrder === "asc" ? "asc" : "desc";

  const andConditions: Prisma.PropertyWhereInput[] = [];

  // 1. Global Search Term
  if (query.searchTerm && query.searchTerm.trim() !== "") {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
        { city: { contains: query.searchTerm, mode: "insensitive" } },
        { area: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  // 2. Category Filter (Matches Category Slug or ID)
  if (query.category && query.category.trim() !== "") {
    andConditions.push({
      category: {
        slug: query.category,
      },
    });
  }

  // 3. String Equals/Contains Filters
  if (query.city && query.city.trim() !== "") {
    andConditions.push({
      city: { contains: query.city.trim(), mode: "insensitive" },
    });
  }

  if (query.area && query.area.trim() !== "") {
    andConditions.push({
      area: { contains: query.area.trim(), mode: "insensitive" },
    });
  }

  // 4. Price Range Filters
  if (query.minPrice || query.maxPrice) {
    const priceCondition: Prisma.IntFilter = {};
    if (query.minPrice !== undefined && query.minPrice !== "") {
      priceCondition.gte = Number(query.minPrice);
    }
    if (query.maxPrice !== undefined && query.maxPrice !== "") {
      priceCondition.lte = Number(query.maxPrice);
    }
    andConditions.push({ price_per_month: priceCondition });
  }

  // 5. Exact Numeric Matches (Bedrooms, Bathrooms, Veranda)
  if (query.bedrooms !== undefined && query.bedrooms !== "") {
    andConditions.push({ bedrooms: Number(query.bedrooms) });
  }

  if (query.bathrooms !== undefined && query.bathrooms !== "") {
    andConditions.push({ bathrooms: Number(query.bathrooms) });
  }

  if (query.veranda !== undefined && query.veranda !== "") {
    andConditions.push({ veranda: Number(query.veranda) });
  }

  // 6. Boolean Conditions
  if (query.isAvailable !== undefined && query.isAvailable !== "") {
    andConditions.push({
      isAvailable: String(query.isAvailable) === "true",
    });
  }

  if (query.parking !== undefined && query.parking !== "") {
    andConditions.push({
      parking: String(query.parking) === "true",
    });
  }

  // 7. Facing Enum Filter
  if (query.facing && query.facing.trim() !== "") {
    andConditions.push({
      facing: query.facing as FacingDirection,
    });
  }

  // 8. Status Enum Filter
  if (query.status) {
    if (Array.isArray(query.status)) {
      andConditions.push({ status: { in: query.status as PropertyStatus[] } });
    } else if (typeof query.status === "string") {
      try {
        const parsedStatus = JSON.parse(query.status);
        if (Array.isArray(parsedStatus)) {
          andConditions.push({
            status: { in: parsedStatus as PropertyStatus[] },
          });
        } else {
          andConditions.push({ status: query.status as PropertyStatus });
        }
      } catch {
        andConditions.push({ status: query.status as PropertyStatus });
      }
    }
  }

  // 9. Amenities Array Filter (Tags)
  if (query.tags) {
    try {
      const tagsArray =
        typeof query.tags === "string" ? JSON.parse(query.tags) : query.tags;
      if (Array.isArray(tagsArray) && tagsArray.length > 0) {
        andConditions.push({
          amenities: {
            hasSome: tagsArray,
          },
        });
      }
    } catch (e) {
      console.warn("Failed to parse tags query:", e);
    }
  }

  // Execute Query
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
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      review: true,
    },
  });

  return properties;
};

const getPropertyId = async (id: string) => {
  // const transactionResult = await prisma.$transaction(
  //   async (tx) => {
  //     await tx.property.update({
  //       where: {
  //         id: id,
  //       },
  //       data: {
  //         views: {
  //           increment: 1,
  //         },
  //       },
  //     });

  //     const property = await tx.property.findUniqueOrThrow({
  //       where: {
  //         id: id,
  //       },
  //       include: {
  //         user: {
  //           select: {
  //             id: true,
  //             name: true,
  //             email: true,
  //           },
  //         },
  //       },
  //     });
  //     return property;
  //   },
  //   {
  //     maxWait: 15000,
  //     timeout: 20000,
  //   },
  // );
  // return transactionResult;
  const property = await prisma.property.update({
    where: {
      id: id,
    },
    data: {
      views: {
        increment: 1,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return property;
};
export const propertyService = {
  getAllProperties,
  getPropertyId,
};
