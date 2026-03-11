"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLiveNotificationFeed } from "@/hooks/use-live-notification-feed";
import { useCurrentSessionUser } from "@/hooks/use-current-session-user";
import { USER_NOTIFICATION_WINDOW_EVENT } from "@/lib/realtime/events";
import {
  Menu,
  Bell,
  Settings,
  CreditCard,
  LogOut,
  LayoutDashboard,
  Globe,
  Server,
  Link2,
  HelpCircle,
  Plus,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Websites", href: "/dashboard/websites", icon: Globe },
  { name: "Provisioning", href: "/dashboard/provisioning", icon: Server },
  { name: "Domains", href: "/dashboard/domains", icon: Link2 },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Support", href: "/dashboard/support", icon: HelpCircle },
];

export function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUser = useCurrentSessionUser("user");
  const displayName = currentUser?.email.split("@")[0] ?? "Account";
  const emailLabel = currentUser?.email ?? "Loading...";
  const { notifications, unreadCount, isLoading } = useLiveNotificationFeed({
    endpoint: "/api/dashboard/notifications",
    windowEventName: USER_NOTIFICATION_WINDOW_EVENT,
    limit: 8,
  });

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-8">
      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0 bg-sidebar border-sidebar-border">
          <div className="flex h-[72px] items-center gap-2.5 px-6 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <span className="text-sm font-bold text-accent-foreground">O</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">Ovmon</span>
            </Link>
          </div>
          <div className="px-5 py-5">
            <Link href="/demos" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full h-11 font-medium">
                <Plus className="w-4 h-4 mr-2" />
                New Website
              </Button>
            </Link>
          </div>
          <ScrollArea className="h-[calc(100vh-13rem)]">
            <nav className="space-y-1 px-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-smooth"
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Mobile Logo */}
      <Link href="/dashboard" className="lg:hidden flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <span className="text-sm font-bold text-accent-foreground">O</span>
        </div>
      </Link>

      <div className="flex-1" />

      {/* Right Side */}
      <div className="flex items-center gap-1">
        <LanguageSwitcher withTheme className="hidden sm:inline-flex mr-2" />
        <ThemeToggle
          iconOnly
          variant="ghost"
          className="sm:hidden mr-1 h-9 w-9 rounded-lg border border-border bg-background/80 backdrop-blur"
        />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-lg">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[360px]">
            <DropdownMenuLabel className="flex items-center justify-between py-3">
              <span className="text-base font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs font-medium">{unreadCount} new</Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoading ? (
              <div className="px-4 py-4 text-sm text-muted-foreground">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-4 text-sm text-muted-foreground">No notifications yet.</div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1.5 py-3.5 px-4 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    )}
                    <span className={`font-medium text-sm ${notification.read ? 'text-muted-foreground' : ''}`}>{notification.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-4">{notification.message}</p>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center py-3 font-medium text-accent">
              <Link href="/dashboard/notifications">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu (Mobile) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-lg">
              <Avatar className="h-8 w-8 ring-2 ring-border">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-medium">
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
          <DropdownMenuContent align="end" className="w-[240px]">
            <DropdownMenuLabel className="font-normal py-3">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{emailLabel}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="py-2.5 cursor-pointer">
              <Link href="/dashboard/settings">
                <Settings className="w-4 h-4 mr-2.5" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="py-2.5 cursor-pointer">
              <Link href="/dashboard/billing">
                <CreditCard className="w-4 h-4 mr-2.5" />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="py-2.5 cursor-pointer text-destructive focus:text-destructive">
              <Link href="/api/auth/logout">
                <LogOut className="w-4 h-4 mr-2.5" />
                Sign Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
