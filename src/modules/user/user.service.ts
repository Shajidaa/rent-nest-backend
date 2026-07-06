import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
const createUserFromDB = async (payload: any) => {
  const { name, email, password } = payload;
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

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email,
    },
    omit: { password: true },
  });
  return user;
};

export const userService = {
  createUserFromDB,
};
