import { type NextRequest, NextResponse } from "next/server";
import { createBillingPortalSession } from "@/lib/stripe/checkout";
import { getStripeCustomerByUserId } from "@/lib/stripe/customer";
import { getSessionFromRequest } from "@/lib/security/session-cookies";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await getStripeCustomerByUserId(session.userId);
    if (!customerId) {
      return NextResponse.json(
        { error: "No billing account found. Please subscribe to a plan first." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const result = await createBillingPortalSession(
      customerId,
      `${appUrl}/dashboard/billing`
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to access billing portal" },
      { status: 500 }
    );
  }
}
