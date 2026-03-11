import type { Website, WebsiteStatus } from "@/lib/types";
import { getMySQLPool } from "@/lib/mysql/pool";
import {
  ensurePlatformDataSchema,
  listUserWebsites,
  listWebsitesForAdmin,
  type WebsiteRecord,
} from "@/lib/mysql/platform";

function toWebsite(record: WebsiteRecord): Website {
  return {
    id: record.id,
    projectName: record.projectName,
    templateId: record.templateId || "",
    templateName: record.templateName,
    status: record.status,
    liveUrl: record.liveUrl || "",
    dashboardUrl: record.dashboardUrl || "",
    subdomain: record.subdomain,
    customDomain: record.customDomain || undefined,
    createdAt: record.createdAt,
    renewalDate: record.renewalDate || "",
    analytics: {
      pageViews: record.pageViews,
      visitors: record.visits,
      avgSessionDuration: record.avgSessionDuration,
    },
  };
}

async function getWebsiteByIdInternal(websiteId: string): Promise<WebsiteRecord | null> {
  await ensurePlatformDataSchema();
  const pool = getMySQLPool();
  const [rows] = await pool.query<Array<{ id: string }>>(
    "SELECT id FROM websites WHERE id = ? LIMIT 1",
    [websiteId],
  );
  if (!rows[0]) {
    return null;
  }

  const all = await listWebsitesForAdmin();
  return all.find((website) => website.id === websiteId) || null;
}

export const websiteRepository = {
  async getWebsiteById(websiteId: string): Promise<Website | null> {
    const record = await getWebsiteByIdInternal(websiteId);
    return record ? toWebsite(record) : null;
  },

  async getUserWebsites(userId: string): Promise<Website[]> {
    const records = await listUserWebsites(userId);
    return records.map(toWebsite);
  },

  async getWebsitesByStatus(status: WebsiteStatus, limit = 10): Promise<Website[]> {
    const records = await listWebsitesForAdmin();
    return records
      .filter((website) => website.status === status)
      .slice(0, limit)
      .map(toWebsite);
  },

  async createWebsite(_websiteData: Omit<Website, "id" | "createdAt">): Promise<Website> {
    throw new Error("Website creation should go through provisioning APIs.");
  },

  async updateWebsite(websiteId: string, updates: Partial<Website>): Promise<Website | null> {
    const existing = await getWebsiteByIdInternal(websiteId);
    if (!existing) {
      return null;
    }

    await ensurePlatformDataSchema();
    const pool = getMySQLPool();
    const fields: string[] = [];
    const values: Array<string | number | null> = [];

    if (typeof updates.projectName === "string" && updates.projectName.trim()) {
      fields.push("project_name = ?");
      values.push(updates.projectName.trim());
    }
    if (typeof updates.customDomain === "string" || updates.customDomain === undefined) {
      fields.push("custom_domain = ?");
      values.push(updates.customDomain || null);
    }
    if (typeof updates.liveUrl === "string" || updates.liveUrl === undefined) {
      fields.push("live_url = ?");
      values.push(updates.liveUrl || null);
    }
    if (typeof updates.dashboardUrl === "string" || updates.dashboardUrl === undefined) {
      fields.push("dashboard_url = ?");
      values.push(updates.dashboardUrl || null);
    }
    if (typeof updates.status === "string") {
      fields.push("status = ?");
      values.push(updates.status);
    }

    if (fields.length > 0) {
      values.push(websiteId);
      await pool.query(
        `
          UPDATE websites
          SET ${fields.join(", ")}
          WHERE id = ?
        `,
        values,
      );
    }

    const updated = await getWebsiteByIdInternal(websiteId);
    return updated ? toWebsite(updated) : null;
  },

  async deleteWebsite(websiteId: string): Promise<boolean> {
    await ensurePlatformDataSchema();
    const pool = getMySQLPool();
    const [result] = await pool.query("DELETE FROM websites WHERE id = ?", [websiteId]);
    return Number((result as { affectedRows?: number }).affectedRows || 0) > 0;
  },

  async getUserWebsiteCount(userId: string): Promise<number> {
    await ensurePlatformDataSchema();
    const pool = getMySQLPool();
    const [rows] = await pool.query<Array<{ total: number }>>(
      "SELECT COUNT(*) AS total FROM websites WHERE user_id = ?",
      [userId],
    );
    return Number(rows[0]?.total || 0);
  },

  async searchWebsites(query: string, limit = 10): Promise<Website[]> {
    const records = await listWebsitesForAdmin(query);
    return records.slice(0, limit).map(toWebsite);
  },
};
