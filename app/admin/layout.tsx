import { requireAdmin } from "@/lib/auth-guard";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { RealtimeSessionBridge } from "@/components/realtime/realtime-session-bridge";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect the admin area - requires auth + admin role
  const adminUser = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <RealtimeSessionBridge role="admin" userId={adminUser.id} />
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
