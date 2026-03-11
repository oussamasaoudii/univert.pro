import { cookies } from "next/headers";
import { getAuthenticatedRequestUser } from "@/lib/api-auth";
import {
  findUserById,
  updateUserAdminFields,
  type AppUser,
} from "@/lib/mysql/users";
import type { ProfileRow } from "./types";

export async function getUserProfile(userId: string): Promise<ProfileRow | null> {
  const user = await findUserById(userId);
  if (!user) {
    return null;
  }

  return appUserToProfile(user);
}

export async function getCurrentUser() {
  await cookies();
  const user = await getAuthenticatedRequestUser();
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.source === "local_admin_fallback" ? "Local Admin" : null,
      role: user.role,
      is_admin: user.role === "admin",
      status: user.status,
    },
  };
}

export async function getCurrentUserProfile(): Promise<ProfileRow | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  
  return getUserProfile(user.id);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<ProfileRow>
): Promise<ProfileRow | null> {
  const user = await updateUserAdminFields(
    userId,
    {
      role: updates.role,
      emailVerified:
        typeof updates.onboarding_completed === "boolean"
          ? updates.onboarding_completed
          : undefined,
    },
    null,
  );

  return user ? appUserToProfile(user) : null;
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await findUserById(userId);
  return user?.role === "admin" ?? false;
}

function appUserToProfile(user: AppUser): ProfileRow {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    avatar_url: null,
    company_name: user.companyName,
    role: user.role,
    onboarding_completed: user.status === "active",
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}
