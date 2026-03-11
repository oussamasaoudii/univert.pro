import { NextResponse } from "next/server";
import { getTemplateById } from "@/lib/mysql/platform";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "invalid_template_id" }, { status: 400 });
    }

    const template = await getTemplateById(id, { includeInactive: false });
    if (!template) {
      return NextResponse.json({ error: "template_not_found" }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("[api/templates/:id][GET] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
