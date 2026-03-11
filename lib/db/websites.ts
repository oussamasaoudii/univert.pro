import { getMySQLPool } from "@/lib/mysql/pool";
import {
  createWebsite as createPlatformWebsite,
  getWebsiteById as getPlatformWebsiteById,
  listUserWebsites,
  updateWebsiteDeployment,
} from "@/lib/mysql/platform";
import type { WebsiteRow } from "./types";

function mapWebsite(row: Awaited<ReturnType<typeof getPlatformWebsiteById>>): WebsiteRow | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    user_id: row.userId,
    template_id: row.templateId || "",
    name: row.projectName,
    project_name: row.projectName,
    status: row.status,
    subdomain: row.subdomain,
    custom_domain: row.customDomain,
    live_url: row.liveUrl || "",
    admin_url: row.dashboardUrl,
    stack: row.templateStack,
    provisioning_job_id: row.provisioningJobId,
    provisioning_error: row.provisioningError,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export async function getUserWebsites(userId: string): Promise<WebsiteRow[]> {
  const websites = await listUserWebsites(userId);
  return websites
    .map((website) => mapWebsite(website))
    .filter(Boolean) as WebsiteRow[];
}

export async function getWebsiteById(websiteId: string): Promise<WebsiteRow | null> {
  return mapWebsite(await getPlatformWebsiteById(websiteId));
}

export async function createWebsite(
  userId: string,
  input: {
    id?: string;
    name: string;
    description?: string;
    template_id?: string | null;
    subdomain: string;
    stack?: string;
    live_url?: string;
    admin_url?: string | null;
  },
): Promise<WebsiteRow | null> {
  try {
    if (!input.id || !input.template_id) {
      throw new Error("Website id and template_id are required for MySQL website creation");
    }

    const created = await createPlatformWebsite({
      id: input.id,
      userId,
      templateId: input.template_id,
      projectName: input.name,
      subdomain: input.subdomain,
      status: "pending",
      liveUrl: input.live_url || null,
      dashboardUrl: input.admin_url || null,
    });

    return mapWebsite(created);
  } catch (error) {
    console.error("[db] Error creating website:", error);
    return null;
  }
}

export async function updateWebsiteStatus(
  websiteId: string,
  status: WebsiteRow["status"],
  progress?: number,
): Promise<WebsiteRow | null> {
  const website = await updateWebsiteDeployment(websiteId, {
    status,
  });

  if (website && typeof progress === "number") {
    // The MySQL platform schema does not persist legacy progress, but callers still pass it.
    // Ignoring it keeps compatibility without duplicating state in two places.
  }

  return mapWebsite(website);
}

export async function suspendWebsite(websiteId: string): Promise<WebsiteRow | null> {
  return updateWebsiteStatus(websiteId, "suspended");
}

export async function deleteWebsite(userId: string, websiteId: string): Promise<boolean> {
  try {
    const website = await getPlatformWebsiteById(websiteId, userId);
    if (!website || website.userId !== userId) {
      return false;
    }

    const pool = getMySQLPool();
    const [result] = await pool.query("DELETE FROM websites WHERE id = ? AND user_id = ?", [
      websiteId,
      userId,
    ]);

    return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
  } catch (error) {
    console.error("[db] Error deleting website:", error);
    return false;
  }
}
