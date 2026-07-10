import cookieParser from "cookie-parser";
import cors from "cors";
import Express, { Application } from "express";
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

const app: Application = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
  }),
);
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
app.use(notFound);
app.use(globalErrorHandler);
export default app;
