import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

const addToWatchlist = async (userId: string, ideaId: string) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
  });

  if (!idea) {
    throw new ApiError(404, "Idea not found");
  }

  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId,
      },
    },
  });

  if (existing) {
    throw new ApiError(409, "Idea is already in your watchlist");
  }

  const item = await prisma.watchlist.create({
    data: {
      userId,
      ideaId,
    },
    include: {
      idea: {
        include: {
          category: true,
          author: { select: { id: true, name: true } },
        },
      },
    },
  });

  return item;
};

const removeFromWatchlist = async (userId: string, ideaId: string) => {
  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId,
      },
    },
  });

  if (!existing) {
    throw new ApiError(404, "Idea not found in your watchlist");
  }

  await prisma.watchlist.delete({
    where: {
      userId_ideaId: {
        userId,
        ideaId,
      },
    },
  });

  return null;
};

const getMyWatchlist = async (userId: string) => {
  const items = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      idea: {
        include: {
          category: true,
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { votes: true, comments: true } },
        },
      },
    },
  });

  return items;
};

export const WatchlistService = {
  addToWatchlist,
  removeFromWatchlist,
  getMyWatchlist,
};
