import { Request, Response } from "express";
import {
  CLOUDINARY_FOLDERS,
  uploadMultipleToCloudinary,
  uploadToCloudinary,
} from "../../config/cloudinary";
import { ApiError } from "../../utils/ApiError";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

/**
 * Resolves the destination Cloudinary folder path based on project domain
 */
const resolveFolder = (requestedFolder?: string): string => {
  switch (requestedFolder?.toLowerCase()) {
    case "ideas":
    case "idea":
      return CLOUDINARY_FOLDERS.IDEAS;
    case "users":
    case "user":
    case "profiles":
    case "profile":
      return CLOUDINARY_FOLDERS.USERS;
    case "categories":
    case "category":
      return CLOUDINARY_FOLDERS.CATEGORIES;
    default:
      return CLOUDINARY_FOLDERS.GENERAL;
  }
};

/**
 * Upload single image (supports query ?folder=ideas|users|categories|general)
 */
const uploadSingleImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "Please provide an image file to upload");
  }

  const targetFolder = resolveFolder(req.query.folder as string | undefined);
  const result = await uploadToCloudinary(req.file, targetFolder);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Image uploaded to ${targetFolder} successfully`,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      folder: targetFolder,
      format: result.format,
      bytes: result.bytes,
    },
  });
});

/**
 * Upload multiple images (supports query ?folder=ideas|users|categories|general)
 */
const uploadMultipleImages = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    throw new ApiError(400, "Please provide at least one image file to upload");
  }

  const targetFolder = req.query.folder
    ? resolveFolder(req.query.folder as string)
    : CLOUDINARY_FOLDERS.IDEAS;

  const results = await uploadMultipleToCloudinary(files, targetFolder);

  const formattedData = results.map((result) => ({
    url: result.secure_url,
    publicId: result.public_id,
    folder: targetFolder,
    format: result.format,
    bytes: result.bytes,
  }));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Images uploaded to ${targetFolder} successfully`,
    data: formattedData,
  });
});

/**
 * Upload user profile picture directly to 'ecospark-hub/users'
 */
const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "Please provide a profile image file");
  }

  const result = await uploadToCloudinary(req.file, CLOUDINARY_FOLDERS.USERS);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile image uploaded to ecospark-hub/users successfully",
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      folder: CLOUDINARY_FOLDERS.USERS,
      format: result.format,
      bytes: result.bytes,
    },
  });
});

/**
 * Upload idea gallery photos directly to 'ecospark-hub/ideas'
 */
const uploadIdeaImages = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    throw new ApiError(400, "Please provide idea images to upload");
  }

  const results = await uploadMultipleToCloudinary(files, CLOUDINARY_FOLDERS.IDEAS);

  const formattedData = results.map((result) => ({
    url: result.secure_url,
    publicId: result.public_id,
    folder: CLOUDINARY_FOLDERS.IDEAS,
    format: result.format,
    bytes: result.bytes,
  }));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Idea images uploaded to ecospark-hub/ideas successfully",
    data: formattedData,
  });
});

/**
 * Upload category icon/image directly to 'ecospark-hub/categories'
 */
const uploadCategoryImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "Please provide a category image file");
  }

  const result = await uploadToCloudinary(req.file, CLOUDINARY_FOLDERS.CATEGORIES);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category image uploaded to ecospark-hub/categories successfully",
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      folder: CLOUDINARY_FOLDERS.CATEGORIES,
      format: result.format,
      bytes: result.bytes,
    },
  });
});

/**
 * Delete image from Cloudinary (by URL or publicId)
 */
const deleteImage = catchAsync(async (req: Request, res: Response) => {
  const { url, publicId } = req.body;

  if (!url && !publicId) {
    throw new ApiError(400, "Please provide either image url or publicId to delete");
  }

  const targetPublicId = publicId || (url ? (await import("../../config/cloudinary")).extractPublicIdFromUrl(url) : null);

  if (!targetPublicId) {
    throw new ApiError(400, "Invalid image URL or publicId provided");
  }

  const { deleteFromCloudinary } = await import("../../config/cloudinary");
  await deleteFromCloudinary(targetPublicId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Image removed from Cloudinary successfully",
    data: null,
  });
});

export const UploadController = {
  uploadSingleImage,
  uploadMultipleImages,
  uploadProfileImage,
  uploadIdeaImages,
  uploadCategoryImage,
  deleteImage,
};

