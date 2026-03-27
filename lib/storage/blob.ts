import { put, del, list, get } from "@vercel/blob";

export type FileCategory = "avatar" | "website-asset" | "document" | "other";

export interface UploadOptions {
  category: FileCategory;
  userId: number;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export interface UploadResult {
  pathname: string;
  contentType: string;
  size: number;
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "text/plain",
  "text/html",
  "text/css",
  "application/javascript",
];

export function getAllowedTypes(category: FileCategory): string[] {
  switch (category) {
    case "avatar":
      return ALLOWED_IMAGE_TYPES;
    case "website-asset":
      return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
    case "document":
      return ALLOWED_DOCUMENT_TYPES;
    default:
      return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  }
}

export function getMaxSize(category: FileCategory): number {
  switch (category) {
    case "avatar":
      return AVATAR_MAX_SIZE;
    default:
      return DEFAULT_MAX_SIZE;
  }
}

export function validateFile(
  file: File,
  options: UploadOptions
): { valid: boolean; error?: string } {
  const maxSize = options.maxSizeBytes ?? getMaxSize(options.category);
  const allowedTypes = options.allowedTypes ?? getAllowedTypes(options.category);

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

export function generatePathname(
  filename: string,
  options: UploadOptions
): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  
  return `${options.category}/${options.userId}/${timestamp}-${randomSuffix}-${sanitizedFilename}`;
}

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const validation = validateFile(file, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const pathname = generatePathname(file.name, options);

  const blob = await put(pathname, file, {
    access: "private",
    contentType: file.type,
  });

  return {
    pathname: blob.pathname,
    contentType: file.type,
    size: file.size,
  };
}

export async function deleteFile(pathname: string): Promise<void> {
  await del(pathname);
}

export async function getFile(pathname: string, ifNoneMatch?: string) {
  return get(pathname, {
    access: "private",
    ifNoneMatch,
  });
}

export async function listFiles(prefix?: string) {
  const result = await list({ prefix });
  return result.blobs;
}
