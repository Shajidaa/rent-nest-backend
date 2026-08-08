import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { IGoogleLoginPayload } from "./auth.interface";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { googleClient } from "../../lib/googleAuth";
import { Role } from "../../../generated/prisma/enums";

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
const googleLogin = async (payload: IGoogleLoginPayload) => {
  let googleIdTokenPayload: TokenPayload | null | undefined = null;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: config.google_client_id,
    });
    googleIdTokenPayload = ticket.getPayload();
  } catch (error) {
    console.log("Google Id Token Verification Failed", error);
    throw new Error("Invalid or Expired Google Id Token");
  }
  if (!googleIdTokenPayload) {
    throw new Error("Invalid or Expired Google Id Token");
  }
  const ifTenantExistGoogleAuth = await prisma.user.findUnique({
    where: {
      email: googleIdTokenPayload.email,
      role: Role.TENANT,
    },
  });
  return {};
};
export const authService = {
  loginFromDB,
  refreshTokenDB,
  googleLogin,
};
