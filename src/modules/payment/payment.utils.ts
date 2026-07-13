import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const rentalRequestId = session.metadata?.rentalRequestId;

  const userId = session.metadata?.userId;

  if (!rentalRequestId || !userId) {
    console.error(" Webhook: Missing metadata");
    return;
  }
  const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["payment_intent"],
  });

  const paymentIntent = expandedSession.payment_intent as Stripe.PaymentIntent;
  let receiptUrl: string | null = null;

  if (
    paymentIntent &&
    typeof paymentIntent.latest_charge !== "string" &&
    paymentIntent.latest_charge
  ) {
    receiptUrl = paymentIntent.latest_charge.receipt_url;
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          rental_request_id: rentalRequestId,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || "bdt",
          status: "SUCCEEDED",
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: paymentIntent.id,
          payment_method: "STRIPE",
          receipt_url: receiptUrl,
        },
      });

      await tx.rental.update({
        where: { id: rentalRequestId },
        data: {
          status: "PAID",
          property: {
            update: {
              status: "RENTED",
            },
          },
        },
      });

      console.log("✅ Payment record created and rental updated successfully");
    });
  } catch (error) {
    console.error("❌ Error in handleCheckoutCompleted:", error);
    throw error;
  }
};
