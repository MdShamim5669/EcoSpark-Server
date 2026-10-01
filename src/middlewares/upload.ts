import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { ApiError } from "../utils/ApiError";

// Memory storage to process files as in-memory buffers before uploading to Cloudinary
const storage = multer.memoryStorage();

// File filter restricting uploads to valid image types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type: ${file.mimetype}. Only JPEG, JPG, PNG, and WEBP images are allowed.`
      )
    );
  }
};

// Multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size limit
  },
});

/**
 * Middleware for single image upload
 * @param fieldName Name of the form field (e.g. "image")
 */
export const uploadSingle = (fieldName = "image") => upload.single(fieldName);

/**
 * Middleware for multiple images upload
 * @param fieldName Name of the form field (e.g. "images")
 * @param maxCount Maximum number of files (default: 5)
 */
export const uploadMultiple = (fieldName = "images", maxCount = 5) =>
  upload.array(fieldName, maxCount);
