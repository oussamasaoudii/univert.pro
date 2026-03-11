import { NextResponse } from "next/server";
import { listBillingPlans } from "@/lib/mysql/billing";

export async function GET() {
  try {
    const plans = await listBillingPlans();
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("[api/plans][GET] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
