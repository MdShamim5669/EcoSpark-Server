import { Role } from "@prisma/client";
import { deleteFromCloudinaryByUrl } from "../../config/cloudinary";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { calculatePagination, IPaginationOptions } from "../../utils/pagination";

const updateProfile = async (userId: string, payload: { name?: string; image?: string | null }) => {
  const { updatedUser, oldImageToDelete } = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    let oldImage: string | null = null;
    if (
      payload.image !== undefined &&
      existingUser.image &&
      existingUser.image !== payload.image
    ) {
      oldImage = existingUser.image;
    }

    const updated = await tx.user.update({
      where: { id: userId },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return { updatedUser: updated, oldImageToDelete: oldImage };
  });

  // Only remove old Cloudinary image after DB transaction commits successfully
  if (oldImageToDelete) {
    await deleteFromCloudinaryByUrl(oldImageToDelete);
  }

  return updatedUser;
};

const getAllUsers = async (paginationOptions: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { ideas: true, votes: true, comments: true },
        },
      },
    }),
    prisma.user.count(),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  };
};

const updateUserStatus = async (userId: string, isActive: boolean) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return updatedUser;
};

const updateUserRole = async (userId: string, role: Role) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return updatedUser;
};

export const UserService = {
  updateProfile,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
};
