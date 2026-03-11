import test from "node:test";
import assert from "node:assert/strict";
import { handleAdminUsersGet } from "./route";

test("handleAdminUsersGet returns sanitized admin read payloads without internal security fields", async () => {
  const response = await handleAdminUsersGet(
    new Request("https://univert.pro/api/admin/users?search=alice"),
    {
      listUsersForAdmin: async () => [
        {
          id: "user-1",
          email: "alice@example.com",
          fullName: "Alice",
          companyName: "Example Co",
          role: "admin",
          status: "active",
          emailVerified: true,
          plan: "enterprise",
          totalRevenue: 1000,
          websitesCount: 3,
          lastLoginAt: "2026-03-09T00:00:00.000Z",
          passwordChangedAt: "2026-03-08T00:00:00.000Z",
          sessionVersion: 9,
          adminMfaEnabled: true,
          adminMfaEnrolledAt: "2026-03-08T00:00:00.000Z",
          createdAt: "2026-03-01T00:00:00.000Z",
          updatedAt: "2026-03-09T00:00:00.000Z",
          activatedAt: "2026-03-02T00:00:00.000Z",
        },
      ] as any,
      parseSearchParams: () => ({ search: "alice" }),
      requireAdminRouteAccess: async () => ({
        adminUser: { id: "admin-1" },
        ipAddress: "203.0.113.10",
        userAgent: "test-agent",
      }),
    } as any,
  );

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store, max-age=0, must-revalidate");
  assert.equal(payload.users[0].id, "user-1");
  assert.equal(payload.users[0].email, "alice@example.com");
  assert.equal("sessionVersion" in payload.users[0], false);
  assert.equal("passwordChangedAt" in payload.users[0], false);
  assert.equal("adminMfaEnabled" in payload.users[0], false);
  assert.equal("adminMfaEnrolledAt" in payload.users[0], false);
  assert.equal("activatedAt" in payload.users[0], false);
});
