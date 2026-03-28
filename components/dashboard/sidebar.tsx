"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useCurrentSessionUser } from "@/hooks/use-current-session-user";
import { currentSubscription as mockSubscription } from "@/lib/mock-data";

// Defensive defaults for user data
const currentSubscription = mockSubscription ?? { planName: 'Free' };
import {
  LayoutDashboard,
  Globe,
  Server,
  CreditCard,
  Link2,
  HelpCircle,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Sparkles,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Websites", href: "/dashboard/websites", icon: Globe },
  { name: "Website Setup", href: "/dashboard/provisioning", icon: Server },
  { name: "Domains", href: "/dashboard/domains", icon: Link2 },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Support", href: "/dashboard/support", icon: HelpCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const currentUser = useCurrentSessionUser("user");
  const displayName = currentUser?.email.split("@")[0] ?? "Account";
  const emailLabel = currentUser?.email ?? "Loading...";

  return (
    <div className="hidden lg:flex lg:w-[280px] lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-sidebar">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex h-[72px] items-center gap-2.5 px-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent transition-smooth group-hover:shadow-glow-sm">
              <span className="text-sm font-bold text-accent-foreground">U</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Univert</span>
          </Link>
        </div>

        {/* New Website Button */}
        <div className="px-5 py-5">
          <Link href="/demos">
            <Button className="w-full h-11 font-medium shadow-sm hover:shadow-md transition-smooth">
              <Plus className="w-4 h-4 mr-2" />
              New Website
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 overflow-hidden px-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/20"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
                  )}
                >
                  <item.icon className={cn(
                    "w-[18px] h-[18px] transition-smooth",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Plan Badge */}
        <div className="px-5 pb-3">
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Plan</span>
            </div>
            <p className="font-semibold text-foreground">{currentSubscription.planName}</p>
            <Link href="/dashboard/billing" className="text-xs text-accent hover:underline mt-1 inline-block">
              Manage plan
            </Link>
            <Link href="/dashboard/support#ownership" className="text-xs text-accent hover:underline mt-1 ml-3 inline-block">
              Ownership &amp; export
            </Link>
          </div>
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-3 h-auto py-2.5 hover:bg-sidebar-accent">
                <Avatar className="h-9 w-9 ring-2 ring-sidebar-border">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-medium">
                    {displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{emailLabel}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{emailLabel}</p>
            </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing" className="cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                <Link href="/api/auth/logout" className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
