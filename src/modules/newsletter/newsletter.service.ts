import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

const subscribe = async (email: string) => {
  const existing = await prisma.newsletter.findUnique({
    where: { email },
  });

  if (existing) {
    throw new ApiError(409, "You are already subscribed to our newsletter");
  }

  const subscription = await prisma.newsletter.create({
    data: { email },
  });

  return subscription;
};

const getAllSubscribers = async () => {
  const subscribers = await prisma.newsletter.findMany({
    orderBy: { createdAt: "desc" },
  });

  return subscribers;
};

export const NewsletterService = {
  subscribe,
  getAllSubscribers,
};
