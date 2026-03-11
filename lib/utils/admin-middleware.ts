import { AuthenticationError } from "@/lib/utils/errors";
import { getAdminRequestUser } from "@/lib/api-auth";

/**
 * Legacy compatibility wrapper.
 * Prefer getAdminRequestUser() directly for new code.
 */
export async function requireAdmin(userId?: string | null) {
  const adminUser = await getAdminRequestUser();
  if (!adminUser || (userId && adminUser.id !== userId)) {
    throw new AuthenticationError("Admin authentication required");
  }

  return adminUser.id;
}

export async function withAdminAuth<T>(
  handler: (userId: string) => Promise<T>,
  userId?: string | null,
) {
  const adminId = await requireAdmin(userId);
  return handler(adminId);
}
