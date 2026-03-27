"use client";

import { useState, useCallback } from "react";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseS3UploadOptions {
  folder?: string;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: { key: string; url: string }) => void;
  onError?: (error: Error) => void;
}

interface UseS3UploadReturn {
  upload: (file: File) => Promise<{ key: string; url: string } | null>;
  uploadWithPresignedUrl: (file: File) => Promise<{ key: string; url: string } | null>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: Error | null;
  reset: () => void;
}

export function useS3Upload(options: UseS3UploadOptions = {}): UseS3UploadReturn {
  const { folder = "uploads", onProgress, onSuccess, onError } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  /**
   * Direct upload through the API (server-side upload)
   */
  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/s3/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const result = await response.json();
        setProgress({ loaded: file.size, total: file.size, percentage: 100 });
        onSuccess?.({ key: result.key, url: result.url });

        return { key: result.key, url: result.url };
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onSuccess, onError]
  );

  /**
   * Upload using presigned URL (client-side direct upload to S3)
   */
  const uploadWithPresignedUrl = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      try {
        // Get presigned URL
        const presignedResponse = await fetch("/api/s3/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            folder,
            operation: "upload",
          }),
        });

        if (!presignedResponse.ok) {
          const data = await presignedResponse.json();
          throw new Error(data.error || "Failed to get presigned URL");
        }

        const { presignedUrl, key } = await presignedResponse.json();

        // Upload directly to S3 with progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progressData = {
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100),
              };
              setProgress(progressData);
              onProgress?.(progressData);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        // Construct the file URL
        const bucket = process.env.NEXT_PUBLIC_AWS_BUCKET || "";
        const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";
        const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

        setProgress({ loaded: file.size, total: file.size, percentage: 100 });
        onSuccess?.({ key, url });

        return { key, url };
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onProgress, onSuccess, onError]
  );

  return {
    upload,
    uploadWithPresignedUrl,
    isUploading,
    progress,
    error,
    reset,
  };
}
