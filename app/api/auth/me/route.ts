import { NextResponse } from "next/server";
import { getAdminRequestUser, getAuthenticatedRequestUser } from "@/lib/api-auth";
import { logger } from "@/lib/utils/errors";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");

    const user =
      scope === "admin"
        ? await getAdminRequestUser()
        : await getAuthenticatedRequestUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      source: user.source,
    });
  } catch (error) {
    logger.error("[auth/me] Error", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
