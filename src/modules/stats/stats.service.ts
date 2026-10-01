import { IdeaStatus, PaymentStatus, Role } from "@prisma/client";
import { prisma } from "../../config/prisma";

const getAdminStats = async () => {
  const [
    totalUsers,
    totalMembers,
    totalIdeas,
    underReviewIdeas,
    approvedIdeas,
    rejectedIdeas,
    paidIdeas,
    totalVotes,
    totalComments,
    paidPayments,
    totalSubscribers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.MEMBER } }),
    prisma.idea.count(),
    prisma.idea.count({ where: { status: IdeaStatus.UNDER_REVIEW } }),
    prisma.idea.count({ where: { status: IdeaStatus.APPROVED } }),
    prisma.idea.count({ where: { status: IdeaStatus.REJECTED } }),
    prisma.idea.count({ where: { isPaid: true, status: IdeaStatus.APPROVED } }),
    prisma.vote.count(),
    prisma.comment.count(),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.newsletter.count(),
  ]);

  return {
    users: {
      total: totalUsers,
      members: totalMembers,
    },
    ideas: {
      total: totalIdeas,
      underReview: underReviewIdeas,
      approved: approvedIdeas,
      rejected: rejectedIdeas,
      paid: paidIdeas,
    },
    engagement: {
      totalVotes,
      totalComments,
      totalSubscribers,
    },
    revenue: {
      totalAmount: paidPayments._sum.amount || 0,
      successfulPurchases: paidPayments._count.id,
    },
  };
};

export const StatsService = {
  getAdminStats,
};
