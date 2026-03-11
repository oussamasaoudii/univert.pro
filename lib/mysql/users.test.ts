import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeAdminUserForClient, type AppUser } from "./users.ts";

test("sanitizeAdminUserForClient strips internal security fields from admin API responses", () => {
  const user: AppUser = {
    id: "user-1",
    email: "admin@univert.pro",
    fullName: "Admin User",
    companyName: "Univert",
    role: "admin",
    status: "active",
    emailVerified: true,
    plan: "enterprise",
    totalRevenue: 12345,
    websitesCount: 8,
    lastLoginAt: "2026-03-09T05:00:00.000Z",
    passwordChangedAt: "2026-03-09T04:00:00.000Z",
    sessionVersion: 7,
    adminMfaEnabled: true,
    adminMfaEnrolledAt: "2026-03-08T03:00:00.000Z",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-09T05:00:00.000Z",
    activatedAt: "2026-03-02T00:00:00.000Z",
  };

  const sanitized = sanitizeAdminUserForClient(user) as Record<string, unknown>;

  assert.equal(sanitized.id, user.id);
  assert.equal(sanitized.email, user.email);
  assert.equal("sessionVersion" in sanitized, false);
  assert.equal("passwordChangedAt" in sanitized, false);
  assert.equal("adminMfaEnabled" in sanitized, false);
  assert.equal("adminMfaEnrolledAt" in sanitized, false);
  assert.equal("activatedAt" in sanitized, false);
});
