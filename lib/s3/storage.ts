import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, getS3Bucket, isS3Configured } from "./client";

export interface UploadOptions {
  key: string;
  body: Buffer | Uint8Array | string | ReadableStream;
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: "private" | "public-read";
}

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

/**
 * Upload a file to S3
 */
export async function uploadToS3(options: UploadOptions): Promise<UploadResult> {
  if (!isS3Configured()) {
    throw new Error("S3 is not configured. Please set AWS environment variables.");
  }

  const bucket = getS3Bucket();
  const { key, body, contentType, metadata, acl = "private" } = options;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
    ACL: acl,
  });

  await s3Client.send(command);

  const region = process.env.AWS_DEFAULT_REGION || "us-east-1";
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { key, url, bucket };
}

/**
 * Get a file from S3
 */
export async function getFromS3(key: string): Promise<{
  body: ReadableStream | null;
  contentType?: string;
  contentLength?: number;
  metadata?: Record<string, string>;
}> {
  const bucket = getS3Bucket();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3Client.send(command);

  return {
    body: response.Body?.transformToWebStream() || null,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    metadata: response.Metadata,
  };
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const bucket = getS3Bucket();

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Check if a file exists in S3
 */
export async function existsInS3(key: string): Promise<boolean> {
  const bucket = getS3Bucket();

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "NotFound") {
      return false;
    }
    throw error;
  }
}

/**
 * List files in S3 with optional prefix
 */
export async function listS3Files(
  prefix?: string,
  maxKeys = 1000
): Promise<Array<{ key: string; size: number; lastModified?: Date }>> {
  const bucket = getS3Bucket();

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  const response = await s3Client.send(command);

  return (response.Contents || []).map((item) => ({
    key: item.Key || "",
    size: item.Size || 0,
    lastModified: item.LastModified,
  }));
}

/**
 * Copy a file within S3
 */
export async function copyInS3(sourceKey: string, destinationKey: string): Promise<void> {
  const bucket = getS3Bucket();

  const command = new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${sourceKey}`,
    Key: destinationKey,
  });

  await s3Client.send(command);
}

/**
 * Generate a presigned URL for uploading
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const bucket = getS3Bucket();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const bucket = getS3Bucket();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get file metadata without downloading
 */
export async function getS3FileMetadata(key: string): Promise<{
  contentType?: string;
  contentLength?: number;
  lastModified?: Date;
  metadata?: Record<string, string>;
} | null> {
  const bucket = getS3Bucket();

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);

    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "NotFound") {
      return null;
    }
    throw error;
  }
}
