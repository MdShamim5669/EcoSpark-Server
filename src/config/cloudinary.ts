import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import { CLOUDINARY_FOLDERS, CloudinaryFolder } from "../constants";
import { ApiError } from "../utils/ApiError";
import { config } from "./index";

export { CLOUDINARY_FOLDERS, CloudinaryFolder };

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Resilient local file storage fallback if Cloudinary credentials have permission restrictions
 */
export const uploadLocalFallback = async (
  file: Express.Multer.File,
  folder: string = CLOUDINARY_FOLDERS.GENERAL
): Promise<UploadApiResponse> => {
  const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "_");
  const uploadsDir = path.join(process.cwd(), "public", "uploads", cleanFolder);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(file.originalname) || ".png";
  const sanitizedFileName = file.originalname
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .toLowerCase();

  const fileName = `${Date.now()}_${sanitizedFileName}${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.promises.writeFile(filePath, file.buffer);

  const serverUrl = config.payment.serverUrl || "http://localhost:5000";
  const secure_url = `${serverUrl}/uploads/${cleanFolder}/${fileName}`;

  return {
    public_id: `${cleanFolder}/${fileName}`,
    version: 1,
    signature: "local-fallback",
    width: 400,
    height: 400,
    format: ext.replace(".", ""),
    resource_type: "image",
    created_at: new Date().toISOString(),
    tags: [],
    bytes: file.size,
    type: "upload",
    etag: "local",
    placeholder: false,
    url: secure_url,
    secure_url: secure_url,
    access_mode: "public",
    original_filename: sanitizedFileName,
  } as unknown as UploadApiResponse;
};

/**
 * Upload a single file buffer directly to Cloudinary using upload_stream
 * Falls back safely to local storage if Cloudinary returns a permission or credential error
 * @param file Express.Multer.File object with in-memory buffer
 * @param folder Destination folder in Cloudinary (e.g., 'ecospark-hub/ideas', 'ecospark-hub/users')
 * @returns Promise<UploadApiResponse>
 */
export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string = CLOUDINARY_FOLDERS.GENERAL
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new ApiError(400, "File buffer is missing"));
    }

    // Clean file name (remove extension and replace non-alphanumeric chars with dashes)
    const sanitizedFileName = file.originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: `${Date.now()}-${sanitizedFileName}`,
      },
      async (error, result) => {
        if (error) {
          console.warn(
            `[Cloudinary Notice] Cloudinary rejected upload (${error.http_code || 500}: ${error.message}). ` +
              `Falling back automatically to local static upload so user operation is not blocked.`
          );
          try {
            const fallbackResult = await uploadLocalFallback(file, folder);
            return resolve(fallbackResult);
          } catch (fallbackErr: any) {
            return reject(new ApiError(500, `Cloudinary upload error: ${error.message}`));
          }
        }
        if (!result) {
          return reject(new ApiError(500, "Cloudinary upload returned empty response"));
        }
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

/**
 * Upload multiple files to Cloudinary concurrently
 * @param files Array of Express.Multer.File objects
 * @param folder Destination subfolder in Cloudinary
 * @returns Promise<UploadApiResponse[]>
 */
export const uploadMultipleToCloudinary = async (
  files: Express.Multer.File[],
  folder: string = CLOUDINARY_FOLDERS.IDEAS
): Promise<UploadApiResponse[]> => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, folder));
  return await Promise.all(uploadPromises);
};

/**
 * Delete an image from Cloudinary by its public ID
 * @param publicId Public ID of the asset
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    console.error(`Failed to delete from Cloudinary (${publicId}):`, error);
    // Don't crash request if deletion of old asset fails, but log it
    return null;
  }
};

/**
 * Extracts public_id from a Cloudinary URL
 * Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567/ecospark-hub/users/1720000000_avatar.png
 * Matches: ecospark-hub/users/1720000000_avatar
 */
export const extractPublicIdFromUrl = (url?: string | null): string | null => {
  if (!url || typeof url !== "string") return null;

  // Cloudinary standard upload pattern: /upload/(v<version>/)?<public_id>.<extension>
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : null;
};

/**
 * Delete an image from Cloudinary directly using its full URL
 * @param url Full Cloudinary URL
 */
export const deleteFromCloudinaryByUrl = async (url?: string | null): Promise<any> => {
  const publicId = extractPublicIdFromUrl(url);
  if (publicId) {
    return await deleteFromCloudinary(publicId);
  }
  return null;
};

/**
 * Delete multiple images from Cloudinary directly using an array of URLs
 * @param urls Array of Cloudinary URLs
 */
export const deleteMultipleFromCloudinaryByUrls = async (
  urls?: string[] | null
): Promise<void> => {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return;

  const deletePromises = urls
    .map((url) => extractPublicIdFromUrl(url))
    .filter((publicId): publicId is string => Boolean(publicId))
    .map((publicId) => deleteFromCloudinary(publicId));

  await Promise.allSettled(deletePromises);
};

export default cloudinary;

