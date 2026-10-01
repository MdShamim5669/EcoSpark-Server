export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;

export const USER_ROLE = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export const IDEA_STATUS = {
  DRAFT: "DRAFT",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const VOTE_TYPE = {
  UP: "UP",
  DOWN: "DOWN",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export const CLOUDINARY_FOLDERS = {
  ROOT: "ecospark-hub",
  USERS: "ecospark-hub/users",
  IDEAS: "ecospark-hub/ideas",
  CATEGORIES: "ecospark-hub/categories",
  GENERAL: "ecospark-hub/general",
} as const;

export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];

