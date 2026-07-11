import { prisma } from "../../lib/prisma";
import { IPaginationOptions } from "./admin.interface";
import { Prisma } from "../../../generated/prisma/client";

const getAllUsersFromDb = async (options: IPaginationOptions) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const searchTerm = options.searchTerm || "";

  const whereConditions: Prisma.UserWhereInput = searchTerm
    ? { email: { contains: searchTerm, mode: "insensitive" } }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: whereConditions,
      skip,
      take: limit,
      omit: { password: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data,
  };
};

const updateUserStatusInDb = async (
  userId: string,
  status: "ACTIVE" | "BANNED",
) => {
  if (!["ACTIVE", "BANNED"].includes(status)) {
    throw new Error("Invalid state transition targeting user entity");
  }

  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    throw new Error("Targeted user account could not be found");
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });
};

const getAllPropertiesFromDb = async (options: IPaginationOptions) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const searchTerm = options.searchTerm || "";

  const whereConditions: Prisma.PropertyWhereInput = searchTerm
    ? {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { fullAddress: { contains: searchTerm, mode: "insensitive" } },
        ],
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.property.findMany({
      where: whereConditions,
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data,
  };
};

const getAllRentalsFromDb = async (options: IPaginationOptions) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const searchTerm = options.searchTerm || "";

  const whereConditions: Prisma.RentalWhereInput = searchTerm
    ? {
        tenant: {
          email: { contains: searchTerm, mode: "insensitive" },
        },
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.rental.findMany({
      where: whereConditions,
      skip,
      take: limit,
      include: {
        tenant: {
          select: { id: true, name: true, email: true },
        },
        property: true,
        payment: true,
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.rental.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data,
  };
};

export const adminService = {
  getAllUsersFromDb,
  updateUserStatusInDb,
  getAllPropertiesFromDb,
  getAllRentalsFromDb,
};
