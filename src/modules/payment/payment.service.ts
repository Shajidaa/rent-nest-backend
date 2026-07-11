import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import Stripe from "stripe";
import config from "../../config";

const createCheckoutSession = async (
  userId: string,
  userEmail: string,
  rentalRequestId: string,
) => {
  const rentalRequest = await prisma.rental.findUnique({
    where: { id: rentalRequestId },
    include: { property: true },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found");
  }

  if (rentalRequest.tenantId !== userId) {
    throw new Error("You are not authorized to pay for this request");
  }

  // Check if payment already exists
  // const existingPayment = await prisma.payment.findFirst({
  //   where: {
  //     rental_request_id: rentalRequestId,
  //     status: { in: ["PENDING", "SUCCEEDED"] },
  //   },
  // });

  // if (existingPayment) {
  //   throw new Error("A payment already exists for this rental request");
  // }

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

  const newPayment = await prisma.payment.create({
    data: {
      rental_request_id: rentalRequestId,
      amount: rentalRequest.property.price_per_month,
      currency: "bdt",
      status: "PENDING",
      payment_method: "STRIPE",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        (session.payment_intent as string) || `pi_placeholder_${session.id}`,
    },
  });

  return { checkoutUrl: session.url, paymentId: newPayment.id };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe_webhook_secret as string,
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    throw new Error(`Webhook Signature Verification Failed: ${err.message}`);
  }

  console.log(`Webhook event received: ${event.type}`);

  try {
    // Handle checkout session completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Processing checkout.session.completed for: ${session.id}`);

      // Retrieve the session with expanded payment_intent
      const expandedSession = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ["payment_intent"],
        },
      );

      const paymentIntent =
        expandedSession.payment_intent as Stripe.PaymentIntent;
      const metadata = session.metadata as { rentalRequestId: string };

      console.log(`Payment Intent ID: ${paymentIntent.id}`);
      console.log(`Rental Request ID: ${metadata?.rentalRequestId}`);

      // Get receipt URL safely
      let receiptUrl: string | null = null;

      // Try to get receipt URL from charges
      // if (paymentIntent.charges && "data" in paymentIntent.charges) {
      //   // const charges = paymentIntent.charges as Stripe.ApiList<Stripe.Charge>;
      //   // if (charges.data && charges.data.length > 0) {
      //   //   receiptUrl = charges.data[0].receipt_url || null;
      //   // }
      // }

      // Alternative: Get from latest_charge if charges is not available
      if (!receiptUrl && paymentIntent.latest_charge) {
        try {
          const charge = await stripe.charges.retrieve(
            paymentIntent.latest_charge as string,
          );
          receiptUrl = charge.receipt_url || null;
        } catch (error) {
          console.log("Could not retrieve charge details");
        }
      }

      console.log(`Receipt URL: ${receiptUrl || "Not available"}`);

      await prisma.$transaction(async (tx) => {
        // Update Payment record
        const updatedPayment = await tx.payment.updateMany({
          where: {
            stripe_checkout_session_id: session.id,
          },
          data: {
            status: "SUCCEEDED",
            stripe_payment_intent_id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            receipt_url: receiptUrl,
            updatedAt: new Date(),
          },
        });

        console.log(`Updated ${updatedPayment.count} payment records`);

        // Update rental request status if metadata exists
        if (metadata?.rentalRequestId) {
          const updatedRental = await tx.rental.update({
            where: { id: metadata.rentalRequestId },
            data: {
              status: "APPROVED",
              updateAt: new Date(),
            },
          });
          console.log(
            `Updated rental request: ${updatedRental.id} to APPROVED`,
          );
        }
      });
    }

    // Handle payment failure
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment failed for: ${paymentIntent.id}`);

      await prisma.payment.updateMany({
        where: { stripe_payment_intent_id: paymentIntent.id },
        data: {
          status: "FAILED",
          failure_reason:
            paymentIntent.last_payment_error?.message || "Payment failed",
          updatedAt: new Date(),
        },
      });
    }

    // Handle successful payment (separate event)
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment succeeded for: ${paymentIntent.id}`);

      // Get receipt URL safely
      let receiptUrl: string | null = null;

      // if (paymentIntent.charges && "data" in paymentIntent.charges) {
      //   const charges = paymentIntent.charges as Stripe.ApiList<Stripe.Charge>;
      //   if (charges.data && charges.data.length > 0) {
      //     receiptUrl = charges.data[0].receipt_url || null;
      //   }
      // }

      if (!receiptUrl && paymentIntent.latest_charge) {
        try {
          const charge = await stripe.charges.retrieve(
            paymentIntent.latest_charge as string,
          );
          receiptUrl = charge.receipt_url || null;
        } catch (error) {
          console.log("Could not retrieve charge details");
        }
      }

      await prisma.payment.updateMany({
        where: { stripe_payment_intent_id: paymentIntent.id },
        data: {
          status: "SUCCEEDED",
          receipt_url: receiptUrl,
          amount: paymentIntent.amount / 100,
          updatedAt: new Date(),
        },
      });
    }

    return { received: true };
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    throw error;
  }
};

const getPaymentDetails = async (userId: string, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
      rental_request: {
        tenantId: userId,
      },
    },
    include: {
      rental_request: {
        include: {
          property: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment history record not found");
  }

  return payment;
};

export const paymentServices = {
  createCheckoutSession,
  handleWebhook,
  getPaymentDetails,
};
