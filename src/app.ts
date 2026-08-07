import cookieParser from "cookie-parser";
import cors from "cors";
import Express, { Application, Request, Response, Router } from "express";
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

import { validateRentalAccess } from "./middleware/paid";
import { reviewRouter } from "./modules/review/review.route";
import { Stripe } from "stripe";
import { stripe } from "./lib/stripe";
import config from "./config";
import { handleCheckoutCompleted } from "./modules/payment/payment.utils";
import { prisma } from "./lib/prisma";

const app: Application = Express();

// app.use("/api/payments/confirm", express.raw({ type: "application/json" }));
app.post(
  "/api/payments/confirm",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;

    try {
      const payload = req.body;
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          payload,
          signature,
          config.stripe_webhook_secret as string,
        );
      } catch (err) {
        console.error(`⚠️ Webhook signature verification failed.`, err);
        // return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case "payment_intent.payment_failed":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment failed for: ${paymentIntent.id}`);

          await prisma.payment.updateMany({
            where: {
              stripe_checkout_session_id:
                paymentIntent.metadata?.checkout_session_id,
              status: "PENDING",
            },
            data: {
              status: "FAILED",
              failure_reason:
                paymentIntent.last_payment_error?.message || "Payment failed",
            },
          });
          break;

        case "charge.succeeded":
        case "payment_intent.succeeded":
        case "payment_intent.created":
        case "charge.updated":
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("Error processing webhook:", err);
      // return.status(500).json({ error: "Webhook handler failed" });
    }
  },
);

// app.use(
//   cors({
//     origin: process.env.APP_URL,
//     credentials: true,
//   }),
// );
// console.log(process.env.APP_URL);
const allowedOrigins = [process.env.APP_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
app.use("/api/landlord-dashboard", auth(Role.LANDLORD), landlordRouter);
app.use("/api/rentals", auth(Role.TENANT), rentalRouter);
app.use("/api/payments", auth(Role.TENANT), paymentRouter);

app.use("/api/admin", auth(Role.ADMIN), adminRouter);
app.use("/api/reviews", reviewRouter);
app.use(notFound);
app.use(globalErrorHandler);

export default app;
