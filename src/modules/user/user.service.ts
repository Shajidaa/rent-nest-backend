import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";

import config from "../../config";

const createUserFromDB = async (payload: any) => {
  const { name, email, password, profilePhoto, phoneNumber, bio } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExist) {
    throw new Error("User with this email already exists");
  }
  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT_ROUNDS),
  );
  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  await prisma.profile.create({
    data: {
      userId: createdUser.id,
      profilePhoto: profilePhoto,
      phoneNumber: phoneNumber,
      bio: bio,
    },
  });
  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email,
    },
    omit: { password: true },
    include: {
      profile: true,
    },
  });
  return user;
};
const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });
  return user;
};
const updateMyProfile = async (userId: string, payload: any) => {
  const { name, profilePhoto, phoneNumber, bio } = payload;

  const updateProfile = await prisma.user.update({
    where: { id: userId },
    data: {
      name,

      profile: {
        upsert: {
          update: {
            profilePhoto,
            phoneNumber,
            bio,
          },

          create: {
            profilePhoto,
            phoneNumber,
            bio,
          },
        },
      },
    },
    include: {
      profile: true,
    },
  });

  return updateProfile;
};
export const userService = {
  createUserFromDB,
  getMyProfile,
  updateMyProfile,
};
