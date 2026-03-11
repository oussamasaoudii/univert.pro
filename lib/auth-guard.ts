import { redirect } from "next/navigation";
import { getAdminRequestUser, getDashboardRequestUser } from "@/lib/api-auth";

export async function requireAuth() {
  const user = await getDashboardRequestUser();
  if (!user) {
    const adminUser = await getAdminRequestUser();
    if (adminUser) {
      redirect("/admin");
    }

    redirect("/auth/login");
  }

  return user;
}

export async function requireAdmin() {
  const adminUser = await getAdminRequestUser();
  if (!adminUser) {
    redirect("/admin/login");
  }

  return adminUser;
}
