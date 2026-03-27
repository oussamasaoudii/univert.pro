import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/security/session-cookies";
import { getPresignedUploadUrl, getPresignedDownloadUrl } from "@/lib/s3/storage";
import { isS3Configured } from "@/lib/s3/client";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check S3 configuration
    if (!isS3Configured()) {
      return NextResponse.json(
        { error: "S3 storage is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { fileName, contentType, folder = "uploads", operation = "upload" } = body;

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    // Generate unique key
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${session.userId}/${timestamp}-${sanitizedName}`;

    if (operation === "upload") {
      if (!contentType) {
        return NextResponse.json({ error: "contentType is required for upload" }, { status: 400 });
      }

      const presignedUrl = await getPresignedUploadUrl(key, contentType, 3600);

      return NextResponse.json({
        success: true,
        presignedUrl,
        key,
        expiresIn: 3600,
      });
    } else if (operation === "download") {
      const presignedUrl = await getPresignedDownloadUrl(body.key || key, 3600);

      return NextResponse.json({
        success: true,
        presignedUrl,
        expiresIn: 3600,
      });
    }

    return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
