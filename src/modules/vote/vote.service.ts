import { VoteType } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

const castVote = async (userId: string, ideaId: string, type: VoteType) => {
  // Execute vote upsert and aggregate counts atomically inside a transaction
  return await prisma.$transaction(async (tx) => {
    const idea = await tx.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new ApiError(404, "Idea not found");
    }

    const vote = await tx.vote.upsert({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
      update: {
        type,
      },
      create: {
        userId,
        ideaId,
        type,
      },
    });

    const [upvotes, downvotes] = await Promise.all([
      tx.vote.count({ where: { ideaId, type: VoteType.UP } }),
      tx.vote.count({ where: { ideaId, type: VoteType.DOWN } }),
    ]);

    return {
      vote,
      counts: {
        upvotes,
        downvotes,
        score: upvotes - downvotes,
      },
    };
  });
};

const removeVote = async (userId: string, ideaId: string) => {
  // Execute vote deletion and aggregate counts recalculation atomically
  return await prisma.$transaction(async (tx) => {
    const existingVote = await tx.vote.findUnique({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    if (!existingVote) {
      throw new ApiError(404, "No vote found for this idea by the user");
    }

    await tx.vote.delete({
      where: {
        userId_ideaId: {
          userId,
          ideaId,
        },
      },
    });

    const [upvotes, downvotes] = await Promise.all([
      tx.vote.count({ where: { ideaId, type: VoteType.UP } }),
      tx.vote.count({ where: { ideaId, type: VoteType.DOWN } }),
    ]);

    return {
      counts: {
        upvotes,
        downvotes,
        score: upvotes - downvotes,
      },
    };
  });
};

const getUserVoteStatus = async (userId: string, ideaId: string) => {
  const vote = await prisma.vote.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId,
      },
    },
  });

  return vote;
};

export const VoteService = {
  castVote,
  removeVote,
  getUserVoteStatus,
};
