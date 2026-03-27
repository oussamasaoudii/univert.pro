import { type NextRequest, NextResponse } from "next/server";
import { deleteFile } from "@/lib/storage/blob";
import { getSessionFromRequest } from "@/lib/security/session-cookies";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pathname } = await request.json();

    if (!pathname) {
      return NextResponse.json({ error: "No pathname provided" }, { status: 400 });
    }

    // Security: Ensure users can only delete their own files
    const pathParts = pathname.split("/");
    if (pathParts.length >= 2) {
      const pathUserId = parseInt(pathParts[1], 10);
      if (pathUserId !== session.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    await deleteFile(pathname);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
