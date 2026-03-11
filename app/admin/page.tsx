"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Globe,
  FileCode,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type OverviewResponse = {
  stats: {
    totalUsers: number;
    activeWebsites: number;
    totalTemplates: number;
    openTickets: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
    systemUptime: string;
  };
  invoiceCounters: {
    totalRevenue: number;
    paidInvoices: number;
    pendingInvoices: number;
    failedInvoices: number;
  };
  charts: {
    revenue: Array<{ month: string; revenue: number; users: number }>;
    plans: Array<{ name: string; value: number; count: number }>;
  };
  recentTickets: Array<{
    id: string;
    ticketNumber: string;
    subject: string;
    userName: string | null;
    userEmail: string | null;
    category: string;
    status: "open" | "in_progress" | "resolved" | "closed";
    priority: "low" | "medium" | "high" | "urgent";
    createdAt: string;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    status: "pending" | "active" | "suspended";
    plan: string;
    createdAt: string;
  }>;
  popularTemplates: Array<{
    id: string;
    name: string;
    category: string;
    stack: "Laravel" | "Next.js" | "WordPress";
    startingPrice: number;
    featured: boolean;
    usageCount: number;
  }>;
};

const pieColors = ["#06b6d4", "#3b82f6", "#0ea5e9", "#14b8a6", "#22c55e"];

const ticketStatusConfig: Record<
  OverviewResponse["recentTickets"][number]["status"],
  {
    label: string;
    variant: "secondary" | "default" | "outline" | "destructive";
    icon: typeof AlertCircle;
    color: string;
  }
> = {
  open: { label: "Open", variant: "secondary", icon: AlertCircle, color: "text-yellow-500" },
  in_progress: { label: "In Progress", variant: "default", icon: Clock, color: "text-blue-500" },
  resolved: { label: "Resolved", variant: "outline", icon: CheckCircle2, color: "text-green-500" },
  closed: { label: "Closed", variant: "outline", icon: CheckCircle2, color: "text-muted-foreground" },
};

export default function AdminPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/overview", {
        cache: "no-store",
        credentials: "include",
      });
      const result = (await response.json().catch(() => ({}))) as
        | OverviewResponse
        | { error?: string };
      if (!response.ok) {
        throw new Error((result as { error?: string }).error || "failed_to_load_overview");
      }
      setData(result as OverviewResponse);
    } catch (error) {
      console.error("[admin/overview] failed to load", error);
      setErrorMessage("Failed to load admin dashboard data from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-10 text-center text-muted-foreground">
          Loading admin dashboard...
        </CardContent>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="py-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="space-y-3">
              <p className="font-medium text-red-500">{errorMessage}</p>
              <Button size="sm" variant="outline" onClick={loadOverview}>
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const stats = [
    {
      label: "Total Users",
      value: data.stats.totalUsers,
      icon: Users,
      href: "/admin/users",
      highlight: false,
    },
    {
      label: "Active Websites",
      value: data.stats.activeWebsites,
      icon: Globe,
      href: "/admin/websites",
      highlight: false,
    },
    {
      label: "Templates",
      value: data.stats.totalTemplates,
      icon: FileCode,
      href: "/admin/templates",
      highlight: false,
    },
    {
      label: "Open Tickets",
      value: data.stats.openTickets,
      icon: MessageSquare,
      href: "/admin/tickets",
      highlight: data.stats.openTickets > 0,
    },
  ];

  const revenueStats = [
    {
      label: "Total Revenue",
      value: `$${Number(data.invoiceCounters.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      hint: `${data.invoiceCounters.paidInvoices} paid invoices`,
    },
    {
      label: "Active Subscriptions",
      value: Number(data.stats.activeSubscriptions || 0).toLocaleString(),
      icon: TrendingUp,
      hint: "From user subscriptions",
    },
    {
      label: "System Uptime",
      value: data.stats.systemUptime,
      icon: Activity,
      hint: "Live monitoring state",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and key metrics from MySQL</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card
              className={`bg-card border-border hover:border-primary/50 transition-colors cursor-pointer ${
                stat.highlight ? "bg-red-500/5 border-red-500/20" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon
                  className={`h-4 w-4 ${stat.highlight ? "text-red-600" : "text-muted-foreground"}`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {revenueStats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly paid invoices and user growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.charts.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: "#06b6d4", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Subscriptions by plan tier</CardDescription>
          </CardHeader>
          <CardContent>
            {data.charts.plans.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                No subscription data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.charts.plans}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {data.charts.plans.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Support Tickets</CardTitle>
              <CardDescription>Latest customer support requests</CardDescription>
            </div>
            <Link href="/admin/tickets">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tickets yet.</p>
              ) : (
                data.recentTickets.map((ticket) => {
                  const statusConf = ticketStatusConfig[ticket.status];
                  const StatusIcon = statusConf.icon;

                  return (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.userName || ticket.userEmail || "Unknown"} • {ticket.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant={statusConf.variant} className="gap-1">
                          <StatusIcon className={`w-3 h-3 ${statusConf.color}`} />
                          {statusConf.label}
                        </Badge>
                        <Badge
                          variant={
                            ticket.priority === "urgent" || ticket.priority === "high"
                              ? "destructive"
                              : ticket.priority === "medium"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Newest platform members</CardDescription>
            </div>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users found.</p>
              ) : (
                data.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-accent">
                          {user.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge
                        variant={user.status === "active" ? "default" : "secondary"}
                        className={
                          user.status === "active"
                            ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
                            : ""
                        }
                      >
                        {user.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize text-xs">
                        {user.plan}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Popular Templates</CardTitle>
            <CardDescription>Most used templates from real websites</CardDescription>
          </div>
          <Link href="/admin/templates">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.popularTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">
                No template usage yet.
              </p>
            ) : (
              data.popularTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-lg border border-border bg-muted/30 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <FileCode className="w-5 h-5 text-accent" />
                    </div>
                    {template.featured && (
                      <Badge className="bg-accent/10 text-accent hover:bg-accent/20 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize mb-3">{template.category}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">${template.startingPrice}/mo</span>
                    <Badge variant="outline" className="text-xs">
                      {template.usageCount} uses
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
