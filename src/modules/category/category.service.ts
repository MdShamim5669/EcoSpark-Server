import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

const createCategory = async (payload: { name: string; description?: string }) => {
  const existingCategory = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existingCategory) {
    throw new ApiError(409, "Category with this name already exists");
  }

  const newCategory = await prisma.category.create({
    data: payload,
  });

  return newCategory;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { ideas: true },
      },
    },
  });

  return categories;
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      ideas: {
        where: { status: "APPROVED" },
        take: 5,
      },
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

const updateCategory = async (id: string, payload: { name?: string; description?: string | null }) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (payload.name && payload.name !== category.name) {
    const existing = await prisma.category.findUnique({ where: { name: payload.name } });
    if (existing) {
      throw new ApiError(409, "Category with this name already exists");
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return updatedCategory;
};

const deleteCategory = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const category = await tx.category.findUnique({
      where: { id },
      include: { _count: { select: { ideas: true } } },
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    if (category._count.ideas > 0) {
      throw new ApiError(
        400,
        "Cannot delete category that contains ideas. Move or delete ideas first."
      );
    }

    await tx.category.delete({ where: { id } });
    return null;
  });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
