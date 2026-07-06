import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const loginFromDB = async (payload: any) => {
  const { email, password } = await payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Password is incorrect");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET,

    config.JWT_ACCESS_EXPIRES_IN as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.JWT_REFRESH_SECRET,

    config.JWT_REFRESH_EXPIRES_IN as SignOptions,
  );
  return { accessToken, refreshToken };
};

const refreshTokenDB = async (refreshToken: string) => {
  const verifyRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    config.JWT_REFRESH_SECRET,
  );
  if (!verifyRefreshToken.success) {
    throw new Error(verifyRefreshToken.error);
  }
  const { id } = verifyRefreshToken.data as JwtPayload;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET,

    config.JWT_ACCESS_EXPIRES_IN as SignOptions,
  );
  return accessToken;
};

export const authService = {
  loginFromDB,
  refreshTokenDB,
};
