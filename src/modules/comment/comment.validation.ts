import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Comment content cannot be empty").max(1000, "Comment cannot exceed 1000 characters"),
    parentId: z.string().uuid("Invalid parent comment ID").optional().nullable(),
  }),
});

export const CommentValidation = {
  createCommentSchema,
};
