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
import config from "./config";
import { stripe } from "./lib/stripe";
import { paymentController } from "./modules/payment/payment.controller";
const app: Application = Express();
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook,
);
// const endpointSecret = config.stripe_webhook_secret;
// app.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   (request, response) => {
//     let event = request.body;
//     // Only verify the event if you have an endpoint secret defined.
//     // Otherwise use the basic event deserialized with JSON.parse
//     if (endpointSecret) {
//       // Get the signature sent by Stripe
//       const signature = request.headers["stripe-signature"];
//       try {
//         event = stripe.webhooks.constructEvent(
//           request.body,
//           signature as string,
//           endpointSecret,
//         );
//       } catch (err: any) {
//         console.log(`⚠️  Webhook signature verification failed.`, err.message);
//         return response.sendStatus(400);
//       }
//     }

//     // Handle the event
//     switch (event.type) {
//       case "payment_intent.succeeded":
//         const paymentIntent = event.data.object;
//         console.log(
//           `PaymentIntent for ${paymentIntent.amount} was successful!`,
//         );
//         // Then define and call a method to handle the successful payment intent.
//         // handlePaymentIntentSucceeded(paymentIntent);
//         break;
//       case "payment_method.attached":
//         const paymentMethod = event.data.object;
//         // Then define and call a method to handle the successful attachment of a PaymentMethod.
//         // handlePaymentMethodAttached(paymentMethod);
//         break;
//       default:
//         // Unexpected event type
//         console.log(`Unhandled event type ${event.type}.`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
//   },
// );
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

app.use(notFound);
app.use(globalErrorHandler);

export default app;
