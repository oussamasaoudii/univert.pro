import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/security/session-cookies";
import { deleteFromS3, existsInS3 } from "@/lib/s3/storage";
import { isS3Configured } from "@/lib/s3/client";

export async function DELETE(request: NextRequest) {
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
    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    // Security check: Only allow users to delete their own files
    const userPrefix = `uploads/${session.userId}/`;
    if (!key.startsWith(userPrefix)) {
      return NextResponse.json(
        { error: "You can only delete your own files" },
        { status: 403 }
      );
    }

    // Check if file exists
    const exists = await existsInS3(key);
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete the file
    await deleteFromS3(key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("S3 delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
