import { Role } from "@prisma/client";
import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    image: z.string().url("Image must be a valid URL").optional().nullable(),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean({ required_error: "isActive status is required" }),
  }),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(Role, { required_error: "Valid role is required" }),
  }),
});

export const UserValidation = {
  updateProfileSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
};
