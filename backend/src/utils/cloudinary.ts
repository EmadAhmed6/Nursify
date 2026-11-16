import { v2 as cloudinary, type UploadApiResponse, type UploadApiOptions } from "cloudinary";
import { Readable } from "stream";

/**
 * Returns an instance of Cloudinary freshly configured with current environment variables.
 * Avoids race conditions where top-level static config runs before dotenv is loaded,
 * and ensures malformed process.env.CLOUDINARY_URL doesn't override trimmed credentials.
 */
export const getConfiguredCloudinary = () => {
  // Prevent malformed CLOUDINARY_URL in environment from overriding individual credentials
  if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.startsWith("cloudinary://")) {
    delete process.env.CLOUDINARY_URL;
  }

  const cloud_name = (
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUD_NAME ||
    ""
  ).trim();

  const api_key = (
    process.env.CLOUDINARY_API_KEY ||
    process.env.API_KEY ||
    ""
  ).trim();

  const api_secret = (
    process.env.CLOUDINARY_API_SECRET ||
    process.env.API_SECRET ||
    ""
  ).trim();

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });

  return cloudinary;
};

/**
 * Clean unified upload function that supports:
 * - Images, PDFs, Videos, Audio
 * - Memory buffer (Multer memoryStorage) & Disk path fallback
 * - Base64 Data URI for files <= 10MB, and Promise-wrapped upload_stream for larger files
 * - Sets access_mode: 'public' for PDFs/raw documents to ensure delivery
 */
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = "nursify",
  options: UploadApiOptions = {},
): Promise<UploadApiResponse> => {
  const cld = getConfiguredCloudinary();

  if (!file?.buffer && !(file as any)?.path) {
    throw new Error("File buffer or path is required for Cloudinary upload");
  }

  // Determine appropriate default options based on mime type
  const isPdf =
    file.mimetype === "application/pdf" ||
    (file.originalname && file.originalname.toLowerCase().endsWith(".pdf"));

  const defaultOptions: UploadApiOptions = {
    folder,
    resource_type: "auto",
    ...(isPdf ? { access_mode: "public" } : {}),
    ...options,
  };

  const buffer = file.buffer || (await import("fs")).readFileSync((file as any).path);
  const fileSize = buffer.length;
  const TEN_MB = 10 * 1024 * 1024;

  try {
    // For files <= 10MB, Base64 Data URI is fast and atomic
    if (fileSize <= TEN_MB) {
      const b64 = buffer.toString("base64");
      const dataURI = `data:${file.mimetype || "application/octet-stream"};base64,${b64}`;
      const result = await cld.uploader.upload(dataURI, defaultOptions);
      return result;
    }

    // For files > 10MB (Audio, Video, large PDFs), use upload_stream
    return await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cld.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error("Upload finished without a result"));
          }
          resolve(result);
        },
      );

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  } catch (error: any) {
    console.error("[Cloudinary Upload Error]:", {
      message: error?.message,
      http_code: error?.http_code,
      name: error?.name,
      errorDetails: error?.error,
    });
    throw error;
  }
};

/**
 * Delete a resource from Cloudinary safely
 */
export const deleteFromCloudinary = async (
  publicId: string,
  options: Record<string, any> = {},
): Promise<any> => {
  if (!publicId) return null;
  const cld = getConfiguredCloudinary();
  try {
    return await cld.uploader.destroy(publicId, options);
  } catch (error) {
    console.warn(`[Cloudinary Destroy Warning] Failed to delete ${publicId}:`, error);
    return null;
  }
};

export default cloudinary;
