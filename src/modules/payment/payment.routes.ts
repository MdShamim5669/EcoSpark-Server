import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = Router();

// Member: initiate purchase of a paid idea
router.post(
  "/initiate",
  auth,
  validateRequest(PaymentValidation.initiatePaymentSchema),
  PaymentController.initiatePayment
);

// Webhook / gateway server-to-server callback
router.post(
  "/callback",
  validateRequest(PaymentValidation.callbackPaymentSchema),
  PaymentController.handleCallback
);

// SSLCommerz Gateway Callbacks (Public endpoints receiving SSLCommerz POST/GET redirects)
router.post("/ssl/success", PaymentController.sslSuccess);
router.get("/ssl/success", PaymentController.sslSuccess);

router.post("/ssl/fail", PaymentController.sslFail);
router.get("/ssl/fail", PaymentController.sslFail);

router.post("/ssl/cancel", PaymentController.sslCancel);
router.get("/ssl/cancel", PaymentController.sslCancel);

router.post("/ssl/ipn", PaymentController.sslIpn);

// ==========================================
// Stripe Payment Routes
// ==========================================

// Member: Create Stripe Checkout Session
router.post(
  "/stripe/checkout",
  auth,
  validateRequest(PaymentValidation.initiatePaymentSchema),
  PaymentController.createStripeCheckout
);

// Member: Create Stripe PaymentIntent for custom card form
router.post(
  "/stripe/create-payment-intent",
  auth,
  validateRequest(PaymentValidation.initiatePaymentSchema),
  PaymentController.createStripePaymentIntent
);

// Verify Stripe checkout session status
router.get("/stripe/verify-session", PaymentController.verifyStripeSession);

// Stripe Webhook (Public, signature-verified)
router.post("/stripe/webhook", PaymentController.handleStripeWebhook);

// Member: view purchase history
router.get("/my", auth, PaymentController.getMyPurchases);

export const PaymentRoutes = router;
