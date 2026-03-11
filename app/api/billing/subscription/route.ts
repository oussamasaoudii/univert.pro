import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { getUserBillingSnapshot } from "@/lib/mysql/billing";

export async function GET() {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const snapshot = await getUserBillingSnapshot(user.id);
    return NextResponse.json({
      subscription: snapshot.subscription,
      currentPlan: snapshot.currentPlan,
    });
  } catch (error) {
    console.error("[api/billing/subscription][GET] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
