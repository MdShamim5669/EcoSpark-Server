import { Router } from "express";
import { USER_ROLE } from "../../constants";
import { auth } from "../../middlewares/auth";
import { role } from "../../middlewares/role";
import { uploadMultiple, uploadSingle } from "../../middlewares/upload";
import { UploadController } from "./upload.controller";

const router = Router();

/**
 * Project-specific subfolder endpoints
 */

// User profile photo upload -> 'ecospark-hub/users'
router.post(
  "/profile",
  auth,
  uploadSingle("image"),
  UploadController.uploadProfileImage
);

// Idea gallery photos upload (up to 5 images) -> 'ecospark-hub/ideas'
router.post(
  "/ideas",
  auth,
  uploadMultiple("images", 5),
  UploadController.uploadIdeaImages
);

// Category image/icon upload (Admin only) -> 'ecospark-hub/categories'
router.post(
  "/category",
  auth,
  role(USER_ROLE.ADMIN),
  uploadSingle("image"),
  UploadController.uploadCategoryImage
);

/**
 * Dynamic / General upload endpoints (supports ?folder=ideas|users|categories|general)
 */

// Single image upload
router.post(
  "/image",
  auth,
  uploadSingle("image"),
  UploadController.uploadSingleImage
);

// Multiple images upload (up to 5)
router.post(
  "/images",
  auth,
  uploadMultiple("images", 5),
  UploadController.uploadMultipleImages
);

// Delete image from Cloudinary (requires auth)
router.delete(
  "/image",
  auth,
  UploadController.deleteImage
);

export const UploadRoutes = router;

