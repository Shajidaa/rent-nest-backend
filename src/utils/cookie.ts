import { Response } from "express";

const setCookie = (
  res: Response,
  tokenName: string,
  token: string,
  maxAge: number,
) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieToken = res.cookie(tokenName, token, {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    maxAge: maxAge,
  });
  return cookieToken;
};
export default setCookie;
