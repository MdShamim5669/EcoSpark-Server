import { IdeaStatus, PaymentStatus } from "@prisma/client";
import Stripe from "stripe";
import { config } from "../../config";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

let stripeClient: Stripe | null = null;

const getStripe = (): Stripe | null => {
  if (!stripeClient && config.stripe.secretKey) {
    stripeClient = new Stripe(config.stripe.secretKey, {
      apiVersion: "2024-06-20" as any,
    });
  }
  return stripeClient;
};

export class StripeService {
  /**
   * Create a Stripe Checkout Session for a Paid Idea
   */
  public static async createCheckoutSession(userId: string, ideaId: string) {
    const stripe = getStripe();

    return await prisma.$transaction(async (tx) => {
      const idea = await tx.idea.findUnique({
        where: { id: ideaId },
      });

      if (!idea) {
        throw new ApiError(404, "Idea not found");
      }

      if (!idea.isPaid || !idea.price || Number(idea.price) <= 0) {
        throw new ApiError(400, "This idea is free or has an invalid price");
      }

      if (idea.status !== IdeaStatus.APPROVED) {
        throw new ApiError(400, "Only approved ideas can be purchased");
      }

      if (idea.authorId === userId) {
        throw new ApiError(400, "You cannot purchase your own idea");
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ApiError(404, "Buyer user not found");
      }

      // Check if already purchased
      const alreadyPurchased = await tx.payment.findFirst({
        where: {
          userId,
          ideaId,
          status: PaymentStatus.PAID,
        },
      });

      if (alreadyPurchased) {
        throw new ApiError(400, "You have already purchased this idea");
      }

      // Check for existing pending transaction
      const existingPending = await tx.payment.findFirst({
        where: {
          userId,
          ideaId,
          status: PaymentStatus.PENDING,
        },
        orderBy: { createdAt: "desc" },
      });

      let transactionId: string;
      let payment;

      if (existingPending) {
        transactionId = existingPending.transactionId;
        payment = existingPending;
      } else {
        transactionId = `STRIPE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        payment = await tx.payment.create({
          data: {
            userId,
            ideaId,
            amount: idea.price,
            status: PaymentStatus.PENDING,
            transactionId,
          },
        });
      }

      // If Stripe secret key is not provided (dev simulation fallback)
      if (!stripe) {
        console.warn("⚠️ Stripe Secret Key missing. Using local simulation checkout URL.");
        const simulatedUrl = `${config.clientUrl}/payment/checkout?transactionId=${transactionId}&amount=${idea.price}&gateway=stripe`;
        return {
          payment,
          sessionId: `mock_session_${transactionId}`,
          checkoutUrl: simulatedUrl,
        };
      }

      const unitAmountInCents = Math.round(Number(idea.price) * 100);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: user.email,
        client_reference_id: transactionId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: unitAmountInCents,
              product_data: {
                name: idea.title,
                description: idea.problemStatement.slice(0, 200),
                images: idea.images && idea.images.length > 0 ? [idea.images[0]] : undefined,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          ideaId: idea.id,
          userId,
          transactionId,
        },
        success_url: `${config.clientUrl}/payment/success?transactionId=${transactionId}&session_id={CHECKOUT_SESSION_ID}&gateway=stripe`,
        cancel_url: `${config.clientUrl}/payment/cancelled?transactionId=${transactionId}&gateway=stripe`,
      });

      return {
        payment,
        sessionId: session.id,
        checkoutUrl: session.url,
      };
    });
  }

  /**
   * Create a Stripe PaymentIntent for custom Elements card form
   */
  public static async createPaymentIntent(userId: string, ideaId: string) {
    const stripe = getStripe();

    return await prisma.$transaction(async (tx) => {
      const idea = await tx.idea.findUnique({ where: { id: ideaId } });
      if (!idea || !idea.isPaid || !idea.price) {
        throw new ApiError(400, "Invalid paid idea");
      }

      if (idea.authorId === userId) {
        throw new ApiError(400, "Cannot purchase own idea");
      }

      const transactionId = `STRIPE-PI-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const payment = await tx.payment.create({
        data: {
          userId,
          ideaId,
          amount: idea.price,
          status: PaymentStatus.PENDING,
          transactionId,
        },
      });

      if (!stripe) {
        return {
          clientSecret: `mock_secret_${transactionId}`,
          transactionId,
          amount: idea.price,
        };
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(idea.price) * 100),
        currency: "usd",
        metadata: {
          userId,
          ideaId,
          transactionId,
        },
        automatic_payment_methods: { enabled: true },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId,
        amount: idea.price,
      };
    });
  }

  /**
   * Verify Checkout Session status from Stripe directly
   */
  public static async verifySession(sessionId: string, transactionId?: string) {
    const stripe = getStripe();

    let targetTransactionId = transactionId;

    if (stripe && sessionId && !sessionId.startsWith("mock_")) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
          targetTransactionId =
            session.client_reference_id ||
            session.metadata?.transactionId ||
            targetTransactionId;

          if (targetTransactionId) {
            const updated = await prisma.payment.updateMany({
              where: {
                transactionId: targetTransactionId,
                status: PaymentStatus.PENDING,
              },
              data: {
                status: PaymentStatus.PAID,
              },
            });
            return {
              verified: true,
              paymentStatus: PaymentStatus.PAID,
              transactionId: targetTransactionId,
            };
          }
        }
      } catch (err: any) {
        console.error("⚠️ Stripe verifySession error:", err.message);
      }
    }

    if (targetTransactionId) {
      const payment = await prisma.payment.findUnique({
        where: { transactionId: targetTransactionId },
      });
      return {
        verified: payment?.status === PaymentStatus.PAID,
        paymentStatus: payment?.status,
        transactionId: targetTransactionId,
      };
    }

    return {
      verified: false,
      message: "Session could not be verified",
    };
  }

  /**
   * Handle incoming Stripe Webhook events
   */
  public static async handleWebhookEvent(rawBody: Buffer | string, signature: string) {
    const stripe = getStripe();

    if (!stripe || !config.stripe.webhookSecret) {
      console.warn("⚠️ Stripe webhook received but webhook secret is not configured in .env.");
      return { received: true };
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripe.webhookSecret
      );
    } catch (err: any) {
      console.error(`❌ Stripe Webhook signature verification failed: ${err.message}`);
      throw new ApiError(400, `Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const transactionId =
          session.client_reference_id || session.metadata?.transactionId;

        if (transactionId) {
          await prisma.payment.updateMany({
            where: { transactionId, status: PaymentStatus.PENDING },
            data: { status: PaymentStatus.PAID },
          });
          console.log(`✅ Stripe Payment confirmed: ${transactionId}`);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const transactionId = paymentIntent.metadata?.transactionId;

        if (transactionId) {
          await prisma.payment.updateMany({
            where: { transactionId, status: PaymentStatus.PENDING },
            data: { status: PaymentStatus.PAID },
          });
          console.log(`✅ Stripe PaymentIntent confirmed: ${transactionId}`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const transactionId = paymentIntent.metadata?.transactionId;

        if (transactionId) {
          await prisma.payment.updateMany({
            where: { transactionId, status: PaymentStatus.PENDING },
            data: { status: PaymentStatus.FAILED },
          });
          console.warn(`❌ Stripe PaymentIntent failed: ${transactionId}`);
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return { received: true };
  }
}

export default StripeService;
