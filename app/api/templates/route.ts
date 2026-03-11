import { NextResponse } from "next/server";
import { listTemplates } from "@/lib/mysql/platform";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category");
    const stack = searchParams.get("stack");
    const featured = searchParams.get("featured");

    let templates = await listTemplates({
      search,
      includeInactive: false,
    });

    if (category && category !== "all") {
      templates = templates.filter((template) => template.category === category);
    }

    if (stack && stack !== "all") {
      templates = templates.filter((template) => template.stack === stack);
    }

    if (featured === "true") {
      templates = templates.filter((template) => template.featured);
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("[api/templates][GET] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
