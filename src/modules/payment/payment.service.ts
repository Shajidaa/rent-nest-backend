import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import Stripe from "stripe";
import config from "../../config";

import { handleCheckoutCompleted } from "./payment.utils";
const createCheckoutSession = async (
  userId: string,
  userEmail: string,
  rentalRequestId: string,
) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: {
        rental: true,
      },
    });

    const rentalRequest = await prisma.rental.findUnique({
      where: { id: rentalRequestId },
      include: { property: true },
    });
    if (!rentalRequest) {
      throw new Error("Rental request not found");
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        rental_request_id: rentalRequestId,
        status: { in: ["SUCCEEDED"] },
      },
    });

    if (existingPayment) {
      throw new Error("A payment already exists for this rental request");
    }

    const amountInSmallestUnit = Math.round(
      rentalRequest.property.price_per_month * 100,
    );
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Rental Deposit for ${rentalRequest.property.title}`,
              description: `Booking period: ${rentalRequest.startDate} to ${rentalRequest.endDate}`,
            },
            unit_amount: amountInSmallestUnit,
          },
          quantity: 1,
        },
      ],
      metadata: {
        rentalRequestId: rentalRequestId,
        userId: userId,
      },
    });

    return { checkoutUrl: session.url };
  });
  return {
    paymentUrl: { transactionResult },
  };
};
const handleWebhook = async (payload: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe_webhook_secret as string,
    );
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err);
    throw err;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "payment_intent.payment_failed":
        // Handle payment failure
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
  } catch (err) {
    console.error("Error processing webhook:", err);
    throw err;
  }
};
const userPayments = async (userId: string) => {
  return await prisma.payment.findMany({
    where: {
      rental_request: {
        tenantId: userId,
      },
    },
    include: {
      rental_request: {
        include: { property: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

const getPaymentDetails = async (userId: string, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      rental_request: {
        include: { property: true },
      },
    },
  });

  if (payment && payment.rental_request.tenantId !== userId) {
    throw new Error("Unauthorized access to payment details");
  }

  if (!payment) throw new Error("Payment record not found");
  return payment;
};

export const paymentServices = {
  createCheckoutSession,
  handleWebhook,
  getPaymentDetails,
  userPayments,
};
