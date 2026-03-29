"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useLiveNotificationFeed } from "@/hooks/use-live-notification-feed";
import { useCurrentSessionUser } from "@/hooks/use-current-session-user";
import { ADMIN_NOTIFICATION_WINDOW_EVENT } from "@/lib/realtime/events";
import {
  Menu,
  Settings,
  LogOut,
  LayoutDashboard,
  FileCode,
  Users,
  BarChart3,
  Globe,
  Zap,
  Server,
  Link2,
  HardDrive,
  Bell,
  Cog,
  MessageSquare,
  Mail,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Websites", href: "/admin/websites", icon: Globe },
  { name: "Templates", href: "/admin/templates", icon: FileCode },
  { name: "Provisioning Queue", href: "/admin/provisioning-queue", icon: Zap },
  { name: "Servers", href: "/admin/servers", icon: Server },
  { name: "Provisioning Profiles", href: "/admin/profiles", icon: Settings },
  { name: "Domains", href: "/admin/domains", icon: Link2 },
  { name: "Backups", href: "/admin/backups", icon: HardDrive },
  { name: "Monitoring", href: "/admin/monitoring", icon: BarChart3 },
  { name: "Support Tickets", href: "/admin/tickets", icon: MessageSquare },
  { name: "Contact Messages", href: "/admin/contact-messages", icon: Mail },
  { name: "Alerts & Automation", href: "/admin/alerts", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Cog },
];

export function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUser = useCurrentSessionUser("admin");
  const displayName = currentUser?.email.split("@")[0] ?? "Admin";
  const roleLabel = currentUser?.role ?? "admin";
  const { notifications, unreadCount, isLoading } = useLiveNotificationFeed({
    endpoint: "/api/admin/notifications",
    windowEventName: ADMIN_NOTIFICATION_WINDOW_EVENT,
    limit: 8,
  });

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar">
          <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
            <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                <span className="text-sm font-bold text-accent-foreground">U</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">Univert</span>
            </Link>
            <Badge variant="outline" className="ml-2 border-accent text-accent text-xs">
              Admin
            </Badge>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <nav className="space-y-1 px-4 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="px-4 pt-4 border-t border-sidebar-border">
              <Link
                href="/home"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Globe className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Mobile Logo */}
      <Link href="/admin" className="lg:hidden flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
          <span className="text-sm font-bold text-accent-foreground">U</span>
        </div>
        <Badge variant="outline" className="border-accent text-accent text-xs">
          Admin
        </Badge>
      </Link>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
            ) : null}
            <span className="sr-only">Admin notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[360px]">
          <DropdownMenuLabel className="flex items-center justify-between py-3">
            <span className="text-base font-semibold">Live Notifications</span>
            {unreadCount > 0 ? (
              <Badge variant="secondary" className="text-xs font-medium">{unreadCount} new</Badge>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoading ? (
            <div className="px-4 py-4 text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-4 text-sm text-muted-foreground">No admin notifications yet.</div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1.5 py-3.5 px-4 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  {!notification.read ? (
                    <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  ) : null}
                  <span className={`font-medium text-sm ${notification.read ? "text-muted-foreground" : ""}`}>
                    {notification.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-4">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ThemeToggle iconOnly className="h-9 w-9 rounded-lg" />

      {/* User Menu (Mobile) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground capitalize">{roleLabel}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin/settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/api/auth/logout">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
