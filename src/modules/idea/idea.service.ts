import { IdeaStatus, PaymentStatus, Prisma, Role } from "@prisma/client";
import { deleteMultipleFromCloudinaryByUrls } from "../../config/cloudinary";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { calculatePagination, IPaginationOptions } from "../../utils/pagination";

interface ICreateIdeaPayload {
  title: string;
  problemStatement: string;
  proposedSolution: string;
  description: string;
  categoryId: string;
  images?: string[];
  isPaid?: boolean;
  price?: number | null;
}

interface IIdeaFilterOptions {
  search?: string;
  category?: string;
  isPaid?: string | boolean;
  minVotes?: string | number;
  author?: string;
  sort?: "recent" | "top" | "commented";
}

const createIdea = async (userId: string, payload: ICreateIdeaPayload) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!category) {
    throw new ApiError(404, "Selected category not found");
  }

  const idea = await prisma.idea.create({
    data: {
      ...payload,
      authorId: userId,
      status: IdeaStatus.DRAFT,
      images: payload.images || [],
    },
    include: {
      category: true,
      author: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  return idea;
};

const submitIdea = async (ideaId: string, userId: string, userRole: Role) => {
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new ApiError(404, "Idea not found");
  }

  if (userRole !== Role.ADMIN && idea.authorId !== userId) {
    throw new ApiError(403, "You can only submit your own ideas");
  }

  if (idea.status !== IdeaStatus.DRAFT && idea.status !== IdeaStatus.REJECTED) {
    throw new ApiError(400, "Only DRAFT or REJECTED ideas can be submitted for review");
  }

  const updatedIdea = await prisma.idea.update({
    where: { id: ideaId },
    data: {
      status: IdeaStatus.UNDER_REVIEW,
      feedback: null, // Clear past feedback on resubmit
    },
  });

  return updatedIdea;
};

const updateIdea = async (
  ideaId: string,
  userId: string,
  userRole: Role,
  payload: Partial<ICreateIdeaPayload>
) => {
  const { updatedIdea, removedImages } = await prisma.$transaction(async (tx) => {
    const idea = await tx.idea.findUnique({ where: { id: ideaId } });
    if (!idea) {
      throw new ApiError(404, "Idea not found");
    }

    if (userRole !== Role.ADMIN) {
      if (idea.authorId !== userId) {
        throw new ApiError(403, "You can only edit your own ideas");
      }
      if (idea.status !== IdeaStatus.DRAFT && idea.status !== IdeaStatus.REJECTED) {
        throw new ApiError(400, "You can only edit ideas that are DRAFT or REJECTED");
      }
    }

    if (payload.categoryId) {
      const category = await tx.category.findUnique({ where: { id: payload.categoryId } });
      if (!category) {
        throw new ApiError(404, "Category not found");
      }
    }

    const removed: string[] = [];
    if (payload.images && Array.isArray(payload.images)) {
      removed.push(...idea.images.filter((img) => !payload.images?.includes(img)));
    }

    const updated = await tx.idea.update({
      where: { id: ideaId },
      data: payload,
      include: { category: true },
    });

    return { updatedIdea: updated, removedImages: removed };
  });

  // Only delete replaced/removed photos from Cloudinary AFTER DB transaction successfully commits
  if (removedImages.length > 0) {
    await deleteMultipleFromCloudinaryByUrls(removedImages);
  }

  return updatedIdea;
};

const deleteIdea = async (ideaId: string, userId: string, userRole: Role) => {
  const imagesToDelete = await prisma.$transaction(async (tx) => {
    const idea = await tx.idea.findUnique({ where: { id: ideaId } });
    if (!idea) {
      throw new ApiError(404, "Idea not found");
    }

    if (userRole !== Role.ADMIN) {
      if (idea.authorId !== userId) {
        throw new ApiError(403, "You can only delete your own ideas");
      }
      if (idea.status !== IdeaStatus.DRAFT && idea.status !== IdeaStatus.REJECTED) {
        throw new ApiError(400, "You can only delete ideas that are DRAFT or REJECTED");
      }
    }

    await tx.idea.delete({ where: { id: ideaId } });
    return idea.images;
  });

  // Only delete Cloudinary images AFTER DB transaction successfully commits
  if (imagesToDelete && imagesToDelete.length > 0) {
    await deleteMultipleFromCloudinaryByUrls(imagesToDelete);
  }

  return null;
};

const approveIdea = async (ideaId: string) => {
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new ApiError(404, "Idea not found");
  }

  if (idea.status !== IdeaStatus.UNDER_REVIEW) {
    throw new ApiError(409, "Only ideas with UNDER_REVIEW status can be approved");
  }

  const approved = await prisma.idea.update({
    where: { id: ideaId },
    data: { status: IdeaStatus.APPROVED },
  });

  return approved;
};

const rejectIdea = async (ideaId: string, feedback: string) => {
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    throw new ApiError(404, "Idea not found");
  }

  if (idea.status !== IdeaStatus.UNDER_REVIEW) {
    throw new ApiError(409, "Only ideas with UNDER_REVIEW status can be rejected");
  }

  const rejected = await prisma.idea.update({
    where: { id: ideaId },
    data: {
      status: IdeaStatus.REJECTED,
      feedback,
    },
  });

  return rejected;
};

const getAllPublicIdeas = async (
  filterOptions: IIdeaFilterOptions,
  paginationOptions: IPaginationOptions
) => {
  const { page, limit, skip } = calculatePagination(paginationOptions);
  const { search, category, isPaid, author } = filterOptions;

  const andConditions: Prisma.IdeaWhereInput[] = [
    { status: IdeaStatus.APPROVED },
  ];

  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { problemStatement: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (category) {
    andConditions.push({
      OR: [
        { categoryId: category },
        { category: { name: { equals: category, mode: "insensitive" } } },
      ],
    });
  }

  if (isPaid !== undefined && isPaid !== "") {
    andConditions.push({ isPaid: isPaid === "true" || isPaid === true });
  }

  if (author) {
    andConditions.push({ authorId: author });
  }

  const whereClause: Prisma.IdeaWhereInput = { AND: andConditions };

  let orderBy: Prisma.IdeaOrderByWithRelationInput = { createdAt: "desc" };
  if (filterOptions.sort === "top") {
    orderBy = { votes: { _count: "desc" } };
  } else if (filterOptions.sort === "commented") {
    orderBy = { comments: { _count: "desc" } };
  }

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      include: {
        category: true,
        author: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { votes: true, comments: true },
        },
      },
    }),
    prisma.idea.count({ where: whereClause }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: ideas,
  };
};

const getIdeaById = async (ideaId: string, currentUser?: { id: string; role: Role }) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      category: true,
      author: {
        select: { id: true, name: true, image: true, email: true },
      },
      votes: true,
      _count: {
        select: { votes: true, comments: true },
      },
    },
  });

  if (!idea) {
    throw new ApiError(404, "Idea not found");
  }

  const isAuthor = currentUser?.id === idea.authorId;
  const isAdmin = currentUser?.role === Role.ADMIN;

  // Non-approved ideas can only be viewed by author or admin
  if (idea.status !== IdeaStatus.APPROVED && !isAuthor && !isAdmin) {
    throw new ApiError(404, "Idea not found");
  }

  // Paywall check
  let hasPurchased = false;
  if (idea.isPaid && currentUser) {
    const payment = await prisma.payment.findFirst({
      where: {
        userId: currentUser.id,
        ideaId: idea.id,
        status: PaymentStatus.PAID,
      },
    });
    hasPurchased = !!payment;
  }

  const canViewFull = !idea.isPaid || isAuthor || isAdmin || hasPurchased;

  // Mask full content if paid and user hasn't bought it
  const sanitizedIdea = {
    ...idea,
    proposedSolution: canViewFull ? idea.proposedSolution : undefined,
    description: canViewFull ? idea.description : undefined,
    hasPurchased,
    canViewFull,
    // Feedback is only visible to author or admin
    feedback: isAuthor || isAdmin ? idea.feedback : undefined,
  };

  return sanitizedIdea;
};

const getMyIdeas = async (userId: string, paginationOptions: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where: { authorId: userId },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        _count: {
          select: { votes: true, comments: true },
        },
      },
    }),
    prisma.idea.count({ where: { authorId: userId } }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: ideas,
  };
};

const getTopIdeas = async (limit = 3) => {
  const ideas = await prisma.idea.findMany({
    where: { status: IdeaStatus.APPROVED },
    take: limit,
    orderBy: {
      votes: { _count: "desc" },
    },
    include: {
      category: true,
      author: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { votes: true, comments: true },
      },
    },
  });

  return ideas;
};

const getAdminIdeas = async (
  status?: IdeaStatus,
  paginationOptions: IPaginationOptions = {}
) => {
  const { page, limit, skip } = calculatePagination(paginationOptions);
  const whereClause: Prisma.IdeaWhereInput = status ? { status } : {};

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: { votes: true, comments: true },
        },
      },
    }),
    prisma.idea.count({ where: whereClause }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: ideas,
  };
};

export const IdeaService = {
  createIdea,
  submitIdea,
  updateIdea,
  deleteIdea,
  approveIdea,
  rejectIdea,
  getAllPublicIdeas,
  getIdeaById,
  getMyIdeas,
  getTopIdeas,
  getAdminIdeas,
};
