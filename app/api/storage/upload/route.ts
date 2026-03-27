import { type NextRequest, NextResponse } from "next/server";
import { uploadFile, type FileCategory } from "@/lib/storage/blob";
import { getSessionFromRequest } from "@/lib/security/session-cookies";
import { updateUserAvatar } from "@/lib/db/users";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as FileCategory) || "other";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await uploadFile(file, {
      category,
      userId: session.userId,
    });

    // If this is an avatar upload, update the user's avatar_url
    if (category === "avatar") {
      await updateUserAvatar(session.userId, result.pathname);
    }

    return NextResponse.json({
      success: true,
      pathname: result.pathname,
      contentType: result.contentType,
      size: result.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
