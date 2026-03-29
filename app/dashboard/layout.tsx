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
    <div className="min-h-screen bg-background">
      <RealtimeSessionBridge role="user" userId={user.id} />
      <DashboardSidebar />
      <div className="flex min-h-screen flex-col lg:pl-[280px]">
        <DashboardHeader />
        <main className="flex-1 min-w-0 p-6 lg:p-8 max-w-[1600px] w-full">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
