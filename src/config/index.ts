import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env"),
});
export default {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  APP_URL: process.env.APP_URL,
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN!,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN!,
  COOKIE_REFRESH_MAX_AGE: process.env.COOKIE_REFRESH_MAX_AGE!,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
  stripe_product_id: process.env.STRIPE_PRODUCT_ID!,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
};
