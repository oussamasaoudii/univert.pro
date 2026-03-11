"use server";

import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import { launchWebsiteForUser } from "@/lib/provisioning/launch-workflow";

export type LaunchWebsiteResult = {
  success: boolean;
  websiteId?: string;
  jobId?: string;
  error?: string;
};

/**
 * Launch a new website from a template
 * This is the main flow:
 * 1. User selects template and enters details
 * 2. Website record is created with status='pending'
 * 3. Provisioning job is created with status='pending'
 * 4. The provisioning worker is kicked immediately and continues asynchronously
 */
export async function launchWebsite(input: {
  templateId: string;
  name: string;
  description?: string;
  subdomain: string;
  customDomain?: string;
}): Promise<LaunchWebsiteResult> {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user || user.source === "local_admin_fallback") {
      return { success: false, error: "Not authenticated" };
    }

    return await launchWebsiteForUser(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      {
        templateId: input.templateId,
        name: input.name,
        subdomain: input.subdomain,
        customDomain: input.customDomain,
      },
    );
  } catch (error) {
    console.error("[launchWebsite] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Validate subdomain availability and format
 */
export async function validateSubdomain(subdomain: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Regex: alphanumeric and hyphens only, 3-63 chars
  const regex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
  
  if (!regex.test(subdomain)) {
    return {
      valid: false,
      error: "Subdomain must be 3-63 characters, alphanumeric and hyphens only",
    };
  }

  // TODO: Check database for existing subdomains when DB is ready
  // For now, mock validation

  return { valid: true };
}
