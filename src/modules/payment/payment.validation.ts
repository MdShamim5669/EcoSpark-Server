import { z } from "zod";

export const initiatePaymentSchema = z.object({
  body: z.object({
    ideaId: z.string().uuid("Invalid idea ID"),
  }),
});

export const callbackPaymentSchema = z.object({
  body: z.object({
    transactionId: z.string().min(1, "Transaction ID is required"),
    status: z.enum(["PAID", "FAILED", "CANCELLED"]),
  }),
});

export const PaymentValidation = {
  initiatePaymentSchema,
  callbackPaymentSchema,
};
