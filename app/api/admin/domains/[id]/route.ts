import { NextResponse } from "next/server";
import { getAdminRequestUser } from "@/lib/api-auth";
import {
  deleteDomain,
  resolveUserIdByEmail,
  updateDomain,
} from "@/lib/mysql/domains";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "invalid_domain_id" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const domain = typeof body.domain === "string" ? body.domain : undefined;
    const ownerEmail =
      typeof body.ownerEmail === "string" ? body.ownerEmail.trim().toLowerCase() : undefined;
    const verificationStatus =
      body.verificationStatus === "pending" ||
      body.verificationStatus === "verified" ||
      body.verificationStatus === "failed"
        ? body.verificationStatus
        : undefined;
    const sslStatus =
      body.sslStatus === "pending" ||
      body.sslStatus === "active" ||
      body.sslStatus === "expired"
        ? body.sslStatus
        : undefined;
    const isPrimary = typeof body.isPrimary === "boolean" ? body.isPrimary : undefined;

    let userId: string | null | undefined = undefined;
    if (typeof ownerEmail === "string") {
      if (ownerEmail.length === 0) {
        userId = null;
      } else {
        userId = await resolveUserIdByEmail(ownerEmail);
        if (!userId) {
          return NextResponse.json({ error: "owner_not_found" }, { status: 400 });
        }
      }
    }

    const updates: {
      domain?: string;
      userId?: string | null;
      websiteName?: string | null;
      verificationStatus?: "pending" | "verified" | "failed";
      sslStatus?: "pending" | "active" | "expired";
      isPrimary?: boolean;
    } = {};

    if (domain) {
      updates.domain = domain;
    }
    if (Object.prototype.hasOwnProperty.call(body, "ownerEmail")) {
      updates.userId = userId ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "websiteName")) {
      if (typeof body.websiteName === "string") {
        const value = body.websiteName.trim();
        updates.websiteName = value || null;
      } else if (body.websiteName === null) {
        updates.websiteName = null;
      }
    }
    if (verificationStatus) {
      updates.verificationStatus = verificationStatus;
    }
    if (sslStatus) {
      updates.sslStatus = sslStatus;
    }
    if (typeof isPrimary === "boolean") {
      updates.isPrimary = isPrimary;
    }

    const result = await updateDomain(id, updates);

    if (result.error) {
      const statusCode =
        result.error === "not_found"
          ? 404
          : result.error === "already_exists"
            ? 409
            : 422;
      return NextResponse.json({ error: result.error }, { status: statusCode });
    }

    return NextResponse.json({ ok: true, domain: result.domain });
  } catch (error) {
    console.error("[api/admin/domains/:id][PATCH] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const adminUser = await getAdminRequestUser();
    if (!adminUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "invalid_domain_id" }, { status: 400 });
    }

    const deleted = await deleteDomain(id);
    if (!deleted) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/domains/:id][DELETE] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
