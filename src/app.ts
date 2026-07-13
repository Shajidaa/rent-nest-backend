import cookieParser from "cookie-parser";
import cors from "cors";
import Express, { Application, Request, Response } from "express";
import { userRouter } from "./modules/user/user.route";
import { authRouter } from "./modules/auth/auth.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { propertyRouter } from "./modules/property/property.route";
import { landlordRouter } from "./modules/landlord/landlord.route";
import { auth } from "./middleware/auth";
import { Role } from "../generated/prisma/client";
import { categoryRouter } from "./modules/categories/categories.route";
import { rentalRouter } from "./modules/rental/rental.route";
import { paymentRouter } from "./modules/payment/payment.route";
import { adminRouter } from "./modules/admin/admin.route";
import express from "express";

import { paymentController } from "./modules/payment/payment.controller";
import { isRentalPaid } from "./middleware/paid";
const app: Application = Express();
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook,
);

app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
  }),
);

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/landlords", auth(Role.LANDLORD), landlordRouter);
app.use("/api/rentals", auth(Role.TENANT), rentalRouter);
app.use("/api/payments", auth(Role.TENANT), paymentRouter);

app.use("/api/admin", auth(Role.ADMIN), adminRouter);
app.use("/api/reviews", auth(Role.TENANT), isRentalPaid, rentalRouter);
app.use(notFound);
app.use(globalErrorHandler);

export default app;
