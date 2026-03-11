import test from "node:test";
import assert from "node:assert/strict";
import { launchWebsiteForUser } from "./launch-workflow";

function createLaunchWorkflowDeps(overrides: Record<string, unknown> = {}) {
  return {
    createPlatformWebsite: async () => {
      throw new Error("createPlatformWebsite should not run");
    },
    createProvisioningJob: async () => ({ id: "job-1" }),
    createProvisioningQueueJob: async () => ({ id: "job-1" }),
    createUserActivity: async () => {},
    createUserNotification: async () => {},
    enqueueProvisioningJob: async () => "queue-1",
    getAapanelConfig: () => ({
      platformSubdomainSuffix: "univert.pro",
      defaultProtocol: "https",
      baseUrl: "https://panel.univert.pro",
    }),
    getBillingPlanByTier: async () => ({
      id: "plan-pro",
      tier: "pro",
      websiteLimit: 1,
    }),
    getTemplateById: async () => ({
      id: "template-1",
      name: "Corporate Pro",
      slug: "corporate-pro",
      templateSourcePath: null,
      deploymentProfile: null,
      stack: "Next.js",
    }),
    getUserSubscription: async () => ({
      id: "sub-1",
      userId: "user-1",
      planName: "pro",
      status: "active",
      billingCycle: "monthly",
      renewalDate: "2026-04-09",
    }),
    kickProvisioningWorker: () => {},
    listUserWebsites: async () => [],
    updateWebsiteDeployment: async () => null,
    ...overrides,
  };
}

test("launchWebsiteForUser blocks plan escalation abuse by enforcing website limits", async () => {
  const result = await launchWebsiteForUser(
    {
      id: "user-1",
      email: "user@example.com",
      role: "user",
    },
    {
      templateId: "template-1",
      name: "Project One",
      subdomain: "project-one",
    },
    createLaunchWorkflowDeps({
      listUserWebsites: async () => [
        {
          id: "site-1",
          status: "ready",
          subdomain: "existing-site",
        },
      ],
    }) as any,
  );

  assert.deepEqual(result, {
    success: false,
    error: "plan_limit_reached",
  });
});

test("launchWebsiteForUser rejects duplicate launch replays for the same subdomain", async () => {
  const result = await launchWebsiteForUser(
    {
      id: "user-1",
      email: "user@example.com",
      role: "user",
    },
    {
      templateId: "template-1",
      name: "Project One",
      subdomain: "project-one",
    },
    createLaunchWorkflowDeps({
      getBillingPlanByTier: async () => ({
        id: "plan-pro",
        tier: "pro",
        websiteLimit: 10,
      }),
      listUserWebsites: async () => [
        {
          id: "site-1",
          status: "pending",
          subdomain: "project-one",
          customDomain: null,
        },
      ],
    }) as any,
  );

  assert.deepEqual(result, {
    success: false,
    error: "website_already_exists",
  });
});
