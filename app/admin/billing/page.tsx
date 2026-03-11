"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Search, AlertTriangle } from "lucide-react";

type AdminInvoice = {
  id: string;
  invoiceNumber: string;
  userEmail: string | null;
  planName: string | null;
  amount: number;
  status: "paid" | "pending" | "failed" | "refunded";
  description: string;
  issuedAt: string;
};

type BillingResponse = {
  invoices: AdminInvoice[];
  counters: {
    totalRevenue: number;
    paidInvoices: number;
    pendingInvoices: number;
    failedInvoices: number;
  };
};

export default function AdminBillingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState<BillingResponse>({
    invoices: [],
    counters: {
      totalRevenue: 0,
      paidInvoices: 0,
      pendingInvoices: 0,
      failedInvoices: 0,
    },
  });

  const loadBilling = async (search = "") => {
    setLoading(true);
    setErrorMessage("");

    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
      const response = await fetch(`/api/admin/billing${query}`, {
        cache: "no-store",
        credentials: "include",
      });

      const result = (await response.json().catch(() => ({}))) as BillingResponse | { error?: string };
      if (!response.ok) {
        throw new Error((result as { error?: string }).error || "failed_to_load_billing");
      }

      setData(result as BillingResponse);
    } catch (error) {
      console.error("[admin/billing] failed to load billing", error);
      setErrorMessage("Failed to load billing data from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBilling(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const invoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return data.invoices;
    }
    return data.invoices.filter((invoice) => {
      return (
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        (invoice.userEmail || "").toLowerCase().includes(query) ||
        (invoice.planName || "").toLowerCase().includes(query) ||
        invoice.description.toLowerCase().includes(query)
      );
    });
  }, [data.invoices, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing Management</h1>
            <p className="text-muted-foreground">Invoices and revenue from MySQL</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm font-medium text-red-500">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(data.counters.totalRevenue || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Paid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counters.paidInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counters.pendingInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Failed Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counters.failedInvoices}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Invoice</th>
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-6 px-4 text-muted-foreground" colSpan={7}>
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td className="py-6 px-4 text-muted-foreground" colSpan={7}>
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-xs">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4">{invoice.userEmail || "-"}</td>
                      <td className="py-3 px-4 capitalize">{invoice.planName || "-"}</td>
                      <td className="py-3 px-4 font-medium">${invoice.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        {new Date(invoice.issuedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : invoice.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            invoice.status === "paid"
                              ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                              : ""
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" disabled>
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
