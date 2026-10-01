import { Request, Response } from "express";
import { config } from "../../config";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import { StripeService } from "./stripe.service";

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const { ideaId } = req.body;
  const result = await PaymentService.initiatePayment(req.user!.id, ideaId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

const handleCallback = catchAsync(async (req: Request, res: Response) => {
  const { transactionId, status } = req.body;
  const result = await PaymentService.handleCallback(transactionId, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment status processed successfully",
    data: result,
  });
});

const getMyPurchases = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getMyPurchases(req.user!.id, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Purchase history fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const sslSuccess = catchAsync(async (req: Request, res: Response) => {
  const { tran_id, val_id } = req.body;
  const transactionId = tran_id || (req.query.transactionId as string);
  const valId = val_id || (req.query.val_id as string);

  if (transactionId) {
    await PaymentService.handleSSLSuccess(transactionId, valId);
  }

  const redirectUrl = `${config.clientUrl}/payment/success?transactionId=${transactionId || ""}`;
  return res.redirect(redirectUrl);
});

const sslFail = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.body;
  const transactionId = tran_id || (req.query.transactionId as string);

  if (transactionId) {
    await PaymentService.handleSSLFailed(transactionId);
  }

  const redirectUrl = `${config.clientUrl}/payment/failed?transactionId=${transactionId || ""}`;
  return res.redirect(redirectUrl);
});

const sslCancel = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.body;
  const transactionId = tran_id || (req.query.transactionId as string);

  if (transactionId) {
    await PaymentService.handleSSLCancelled(transactionId);
  }

  const redirectUrl = `${config.clientUrl}/payment/cancelled?transactionId=${transactionId || ""}`;
  return res.redirect(redirectUrl);
});

const sslIpn = catchAsync(async (req: Request, res: Response) => {
  const { tran_id, val_id, status } = req.body;

  if (status === "VALID" || status === "VALIDATED" || status === "SUCCESS") {
    await PaymentService.handleSSLSuccess(tran_id, val_id);
  } else if (status === "FAILED") {
    await PaymentService.handleSSLFailed(tran_id);
  } else if (status === "CANCELLED") {
    await PaymentService.handleSSLCancelled(tran_id);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "SSLCommerz IPN handled successfully",
    data: null,
  });
});

const createStripeCheckout = catchAsync(async (req: Request, res: Response) => {
  const { ideaId } = req.body;
  const result = await StripeService.createCheckoutSession(req.user!.id, ideaId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Stripe checkout session created successfully",
    data: result,
  });
});

const createStripePaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { ideaId } = req.body;
  const result = await StripeService.createPaymentIntent(req.user!.id, ideaId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Stripe PaymentIntent created successfully",
    data: result,
  });
});

const verifyStripeSession = catchAsync(async (req: Request, res: Response) => {
  const { sessionId, transactionId } = req.query;
  const result = await StripeService.verifySession(
    sessionId as string,
    transactionId as string
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Stripe session verified successfully",
    data: result,
  });
});

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const rawBody = req.rawBody || req.body;

  const result = await StripeService.handleWebhookEvent(rawBody, signature);

  res.status(200).json(result);
});

export const PaymentController = {
  initiatePayment,
  handleCallback,
  getMyPurchases,
  sslSuccess,
  sslFail,
  sslCancel,
  sslIpn,
  createStripeCheckout,
  createStripePaymentIntent,
  verifyStripeSession,
  handleStripeWebhook,
};
