"use server";

import { getAdminRequestUser } from "@/lib/api-auth";
import { updateWebsiteStatus, suspendWebsite } from "@/lib/db/websites";
import { 
  updateProvisioningJob, 
  getAllPendingJobs, 
  getAllRunningJobs 
} from "@/lib/db/provisioning";
import { upsertTemplate } from "@/lib/db/templates";
import type { ProvisioningJobRow, TemplateRow } from "@/lib/db/types";

async function requireAdminUser() {
  const adminUser = await getAdminRequestUser();
  if (!adminUser) {
    return null;
  }

  return adminUser;
}

/**
 * Admin-only action to approve and start provisioning a website
 */
export async function approveWebsiteProvisioning(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAdminUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Update job status to running
    const updatedJob = await updateProvisioningJob(jobId, {
      status: "running",
      progress: 10,
      current_step: "Setting up server environment",
      started_at: new Date().toISOString(),
    });

    if (!updatedJob) {
      return { success: false, error: "Failed to update provisioning job" };
    }

    return { success: true };
  } catch (error) {
    console.error("[approveWebsiteProvisioning] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Admin action to update provisioning job progress
 */
export async function updateProvisioningProgress(
  jobId: string,
  progress: number,
  step: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAdminUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await updateProvisioningJob(jobId, {
      progress,
      current_step: step,
    });

    return { success: true };
  } catch (error) {
    console.error("[updateProvisioningProgress] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Admin action to mark provisioning as complete
 */
export async function completeProvisioning(
  jobId: string,
  websiteId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAdminUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Update job
    await updateProvisioningJob(jobId, {
      status: "completed",
      progress: 100,
      current_step: "Deployment complete",
      completed_at: new Date().toISOString(),
    });

    // Update website status to ready
    await updateWebsiteStatus(websiteId, "ready", 100);

    return { success: true };
  } catch (error) {
    console.error("[completeProvisioning] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Admin action to fail provisioning
 */
export async function failProvisioning(
  jobId: string,
  websiteId: string,
  errorMessage: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAdminUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Update job
    await updateProvisioningJob(jobId, {
      status: "failed",
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    });

    // Update website status to failed
    await updateWebsiteStatus(websiteId, "failed");

    return { success: true };
  } catch (error) {
    console.error("[failProvisioning] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Admin action to suspend a user's website
 */
export async function suspendUserWebsite(websiteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAdminUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await suspendWebsite(websiteId);
    return { success: true };
  } catch (error) {
    console.error("[suspendUserWebsite] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Admin action to create or update a template
 */
export async function saveTemplate(
  template: Partial<TemplateRow> & { id: string; name: string; slug: string }
): Promise<{ success: boolean; template?: TemplateRow; error?: string }> {
  try {
    const user = await requireAdminUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const savedTemplate = await upsertTemplate(template);

    if (!savedTemplate) {
      return { success: false, error: "Failed to save template" };
    }

    return { success: true, template: savedTemplate };
  } catch (error) {
    console.error("[saveTemplate] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Admin action to get pending provisioning queue
 */
export async function getPendingProvisioningQueue(): Promise<{
  success: boolean;
  jobs?: ProvisioningJobRow[];
  error?: string;
}> {
  try {
    const user = await requireAdminUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const jobs = await getAllPendingJobs();
    return { success: true, jobs };
  } catch (error) {
    console.error("[getPendingProvisioningQueue] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Admin action to get currently running jobs
 */
export async function getRunningProvisioningJobs(): Promise<{
  success: boolean;
  jobs?: ProvisioningJobRow[];
  error?: string;
}> {
  try {
    const user = await requireAdminUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const jobs = await getAllRunningJobs();
    return { success: true, jobs };
  } catch (error) {
    console.error("[getRunningProvisioningJobs] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
