import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/security/session-cookies";
import { uploadToS3 } from "@/lib/s3/storage";
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Generate unique key
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${session.userId}/${timestamp}-${sanitizedName}`;

    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToS3({
      key,
      body: buffer,
      contentType: file.type,
      metadata: {
        userId: session.userId,
        originalName: file.name,
      },
    });

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
    });
  } catch (error) {
    console.error("S3 upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
