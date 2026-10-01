import { IdeaStatus, PaymentStatus } from "@prisma/client";
import { config } from "../../config";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { calculatePagination, IPaginationOptions } from "../../utils/pagination";
import { SSLCommerzService } from "./sslcommerz.service";

const initiatePayment = async (userId: string, ideaId: string) => {
  return await prisma.$transaction(async (tx) => {
    const idea = await tx.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new ApiError(404, "Idea not found");
    }

    if (!idea.isPaid || !idea.price || Number(idea.price) <= 0) {
      throw new ApiError(400, "This idea is free or has invalid price");
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

    // Check if already paid inside transaction
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

    // Check if there's already an active pending payment created
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
      transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
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

    // Initiate SSLCommerz gateway session
    const sslcommerzResponse = await SSLCommerzService.initPayment({
      transactionId,
      amount: Number(idea.price),
      ideaTitle: idea.title,
      userName: user.name,
      userEmail: user.email,
    });

    return {
      payment,
      paymentUrl: sslcommerzResponse.gatewayUrl,
    };
  });
};

const handleSSLSuccess = async (transactionId: string, valId?: string) => {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { transactionId },
    });

    if (!payment) {
      throw new ApiError(404, "Payment transaction not found");
    }

    // Idempotent: If already paid, return
    if (payment.status === PaymentStatus.PAID) {
      return payment;
    }

    // If val_id is provided, validate with SSLCommerz server
    if (valId) {
      try {
        const validation = await SSLCommerzService.validatePayment(valId);
        if (validation.status !== "VALID" && validation.status !== "VALIDATED") {
          console.warn("⚠️ SSLCommerz validation returned non-valid status:", validation.status);
          return await tx.payment.update({
            where: { transactionId },
            data: { status: PaymentStatus.FAILED },
          });
        }
      } catch (err: any) {
        console.error("⚠️ SSLCommerz validation error:", err.message);
      }
    }

    return await tx.payment.update({
      where: { transactionId },
      data: { status: PaymentStatus.PAID },
    });
  });
};

const handleSSLFailed = async (transactionId: string) => {
  return await prisma.payment.updateMany({
    where: { transactionId, status: PaymentStatus.PENDING },
    data: { status: PaymentStatus.FAILED },
  });
};

const handleSSLCancelled = async (transactionId: string) => {
  return await prisma.payment.updateMany({
    where: { transactionId, status: PaymentStatus.PENDING },
    data: { status: PaymentStatus.CANCELLED },
  });
};

const handleCallback = async (transactionId: string, status: PaymentStatus) => {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { transactionId },
    });

    if (!payment) {
      throw new ApiError(404, "Payment transaction not found");
    }

    // Idempotency: If already finalized, return current status
    if (payment.status === PaymentStatus.PAID || payment.status === PaymentStatus.FAILED) {
      return payment;
    }

    const updatedPayment = await tx.payment.update({
      where: { transactionId },
      data: { status },
    });

    return updatedPayment;
  });
};

const getMyPurchases = async (userId: string, paginationOptions: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: {
        userId,
        status: PaymentStatus.PAID,
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            price: true,
            category: { select: { name: true } },
            author: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.payment.count({
      where: {
        userId,
        status: PaymentStatus.PAID,
      },
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: payments,
  };
};

export const PaymentService = {
  initiatePayment,
  handleCallback,
  handleSSLSuccess,
  handleSSLFailed,
  handleSSLCancelled,
  getMyPurchases,
};
