import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

const createComment = async (
  userId: string,
  ideaId: string,
  payload: { content: string; parentId?: string | null }
) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
  });

  if (!idea) {
    throw new ApiError(404, "Idea not found");
  }

  if (payload.parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: payload.parentId },
    });
    if (!parentComment || parentComment.ideaId !== ideaId) {
      throw new ApiError(404, "Parent comment not found for this idea");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: payload.content,
      userId,
      ideaId,
      parentId: payload.parentId || null,
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, role: true },
      },
    },
  });

  return comment;
};

const getCommentsByIdea = async (ideaId: string) => {
  const comments = await prisma.comment.findMany({
    where: {
      ideaId,
      parentId: null, // Root comments
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, image: true, role: true },
      },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: { id: true, name: true, image: true, role: true },
          },
        },
      },
    },
  });

  return comments;
};

const deleteComment = async (commentId: string, userId: string, userRole: Role) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (userRole !== Role.ADMIN && comment.userId !== userId) {
    throw new ApiError(403, "You can only delete your own comments");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return null;
};

export const CommentService = {
  createComment,
  getCommentsByIdea,
  deleteComment,
};
