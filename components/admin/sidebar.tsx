"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useCurrentSessionUser } from "@/hooks/use-current-session-user";
import {
  LayoutDashboard,
  FileCode,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Globe,
  Zap,
  Server,
  Link2,
  HardDrive,
  Bell,
  Cog,
  PanelLeft,
  MessageSquareQuote,
  HelpCircle,
  Home,
  LogIn,
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
  { name: "Alerts & Automation", href: "/admin/alerts", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Cog },
];

const contentNavigation = [
  { name: "Homepage Content", href: "/admin/content/homepage", icon: Home },
  { name: "Auth Pages", href: "/admin/content/auth", icon: LogIn },
  { name: "FAQs", href: "/admin/content/faqs", icon: HelpCircle },
  { name: "Testimonials", href: "/admin/content/testimonials", icon: MessageSquareQuote },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const currentUser = useCurrentSessionUser("admin");
  const displayName = currentUser?.email.split("@")[0] ?? "Admin";
  const roleLabel = currentUser?.role ?? "admin";

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-sidebar">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
              <span className="text-sm font-bold text-accent-foreground">U</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Univert</span>
          </Link>
          <Badge variant="outline" className="ml-2 border-accent text-accent text-xs">
            Admin
          </Badge>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Content Management Section */}
          <div className="mt-6 pt-4 border-t border-sidebar-border">
            <div className="flex items-center gap-2 px-3 mb-2">
              <PanelLeft className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Content Management
              </span>
            </div>
            <nav className="space-y-1">
              {contentNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Back to Dashboard */}
          <div className="mt-8 pt-4 border-t border-sidebar-border">
            <Link
              href="/home"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Globe className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </ScrollArea>

        {/* User Menu */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-3">
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
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">{roleLabel}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
        </div>
      </div>
    </div>
  );
}
