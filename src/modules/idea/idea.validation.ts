import { z } from "zod";

export const createIdeaSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    problemStatement: z.string().min(20, "Problem statement must be at least 20 characters"),
    proposedSolution: z.string().min(20, "Proposed solution must be at least 20 characters"),
    description: z.string().min(30, "Description must be at least 30 characters"),
    categoryId: z.string().uuid("Invalid category ID"),
    images: z.array(z.string().url("Each image must be a valid URL")).default([]),
    isPaid: z.boolean().default(false),
    price: z.number().positive("Price must be greater than 0").optional().nullable(),
  }).refine((data) => !data.isPaid || (data.price !== undefined && data.price !== null && data.price > 0), {
    message: "Price is required and must be greater than 0 for paid ideas",
    path: ["price"],
  }),
});

export const updateIdeaSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    problemStatement: z.string().min(20).optional(),
    proposedSolution: z.string().min(20).optional(),
    description: z.string().min(30).optional(),
    categoryId: z.string().uuid().optional(),
    images: z.array(z.string().url()).optional(),
    isPaid: z.boolean().optional(),
    price: z.number().positive().optional().nullable(),
  }),
});

export const rejectIdeaSchema = z.object({
  body: z.object({
    feedback: z.string().min(10, "Rejection feedback is mandatory and must be at least 10 characters"),
  }),
});

export const IdeaValidation = {
  createIdeaSchema,
  updateIdeaSchema,
  rejectIdeaSchema,
};
