import { S3Client } from "@aws-sdk/client-s3";

const globalForS3 = globalThis as unknown as {
  s3Client: S3Client | undefined;
};

function createS3Client(): S3Client {
  const config: ConstructorParameters<typeof S3Client>[0] = {
    region: process.env.AWS_DEFAULT_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  };

  // Support for S3-compatible services (MinIO, DigitalOcean Spaces, etc.)
  if (process.env.AWS_ENDPOINT) {
    config.endpoint = process.env.AWS_ENDPOINT;
  }

  // Use path-style endpoint if configured
  if (process.env.AWS_USE_PATH_STYLE_ENDPOINT === "true") {
    config.forcePathStyle = true;
  }

  return new S3Client(config);
}

export const s3Client =
  globalForS3.s3Client ?? createS3Client();

if (process.env.NODE_ENV !== "production") {
  globalForS3.s3Client = s3Client;
}

export function getS3Bucket(): string {
  const bucket = process.env.AWS_BUCKET;
  if (!bucket) {
    throw new Error("AWS_BUCKET environment variable is not set");
  }
  return bucket;
}

export function isS3Configured(): boolean {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_BUCKET
  );
}
