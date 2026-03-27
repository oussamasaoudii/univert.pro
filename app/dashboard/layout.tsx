import { requireAuth } from "@/lib/auth-guard";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { RealtimeSessionBridge } from "@/components/realtime/realtime-session-bridge";
import { ChatWidget } from "@/components/ai/chat-widget";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect the dashboard route
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <RealtimeSessionBridge role="user" userId={user.id} />
      <DashboardSidebar />
      <div className="lg:pl-[280px] flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full overflow-y-auto">{children}</main>
      </div>
      <ChatWidget />
    </div>
  );
}
