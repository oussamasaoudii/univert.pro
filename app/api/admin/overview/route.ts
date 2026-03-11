import { listUsersForAdmin } from "@/lib/mysql/users";
import { listTemplates, listWebsitesForAdmin } from "@/lib/mysql/platform";
import {
  getInvoiceCounters,
  getMonthlyRevenueTrend,
  getSubscriptionPlanDistribution,
} from "@/lib/mysql/billing";
import {
  getSupportTicketStats,
  listSupportTicketsForAdmin,
} from "@/lib/mysql/support";
import {
  adminJson,
  requireAdminRouteAccess,
  toAdminApiErrorResponse,
} from "@/lib/security/admin-api";

type RecentTicket = {
  id: string;
  ticketNumber: string;
  subject: string;
  userName: string | null;
  userEmail: string | null;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
};

function monthLabelFromDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString("en-US", { month: "short" });
}

export async function GET(request: Request) {
  try {
    await requireAdminRouteAccess(request, {
      scope: "admin-overview-read",
      limit: 60,
      resourceId: "/api/admin/overview",
    });

    const [
      users,
      websites,
      templates,
      tickets,
      ticketStats,
      invoiceCounters,
      revenueTrend,
      planDistributionRaw,
    ] = await Promise.all([
      listUsersForAdmin(),
      listWebsitesForAdmin(),
      listTemplates({ includeInactive: true }),
      listSupportTicketsForAdmin({ limit: 20 }),
      getSupportTicketStats(),
      getInvoiceCounters(),
      getMonthlyRevenueTrend(6),
      getSubscriptionPlanDistribution(),
    ]);

    const totalUsers = users.length;
    const activeWebsites = websites.filter((website) => website.status === "ready").length;
    const openTickets = ticketStats.open + ticketStats.inProgress;
    const activeSubscriptions = planDistributionRaw.reduce(
      (sum, row) => sum + Number(row.value || 0),
      0,
    );

    const userCountByMonth = new Map<string, number>();
    for (const user of users) {
      const label = monthLabelFromDate(user.createdAt);
      if (!label) continue;
      userCountByMonth.set(label, (userCountByMonth.get(label) || 0) + 1);
    }

    const chartRevenue = revenueTrend.map((row) => ({
      month: row.month,
      revenue: row.revenue,
      users: userCountByMonth.get(row.month) || 0,
    }));

    const totalPlanUsers = planDistributionRaw.reduce(
      (sum, row) => sum + Number(row.value || 0),
      0,
    );
    const planDistribution = planDistributionRaw.map((row) => ({
      name: row.name,
      value:
        totalPlanUsers > 0
          ? Math.max(1, Math.round((Number(row.value || 0) / totalPlanUsers) * 100))
          : 0,
      count: Number(row.value || 0),
    }));

    const templateUsage = new Map<string, number>();
    for (const website of websites) {
      templateUsage.set(
        website.templateName,
        (templateUsage.get(website.templateName) || 0) + 1,
      );
    }

    const popularTemplates = [...templates]
      .sort((a, b) => {
        const usageA = templateUsage.get(a.name) || 0;
        const usageB = templateUsage.get(b.name) || 0;
        if (usageA === usageB) {
          return Number(b.startingPrice) - Number(a.startingPrice);
        }
        return usageB - usageA;
      })
      .slice(0, 4)
      .map((template) => ({
        id: template.id,
        name: template.name,
        category: template.category,
        stack: template.stack,
        startingPrice: template.startingPrice,
        featured: template.featured,
        usageCount: templateUsage.get(template.name) || 0,
      }));

    const recentUsers = users.slice(0, 5).map((user) => ({
      id: user.id,
      name: user.fullName || user.email.split("@")[0],
      email: user.email,
      status: user.status,
      plan: user.plan,
      createdAt: user.createdAt,
    }));

    const recentTickets: RecentTicket[] = tickets.slice(0, 5).map((ticket) => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      userName: ticket.userName,
      userEmail: ticket.userEmail,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
    }));

    return adminJson({
      stats: {
        totalUsers,
        activeWebsites,
        totalTemplates: templates.length,
        openTickets,
        monthlyRevenue: invoiceCounters.totalRevenue,
        activeSubscriptions,
        systemUptime: "99.98%",
      },
      invoiceCounters,
      charts: {
        revenue: chartRevenue,
        plans: planDistribution,
      },
      recentTickets,
      recentUsers,
      popularTemplates,
    });
  } catch (error) {
    return toAdminApiErrorResponse(error, { action: "admin.overview.read" });
  }
}
