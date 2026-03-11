import { NextResponse } from "next/server";
import { listBillingPlans } from "@/lib/mysql/billing";
import { getPreviewPlanRecords } from "@/lib/preview-data";
import { isPreviewMode } from "@/lib/preview-mode";

export async function GET() {
  try {
    if (isPreviewMode()) {
      return NextResponse.json({ plans: getPreviewPlanRecords() });
    }

    const plans = await listBillingPlans();
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("[api/plans][GET] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
