"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, CreditCard, Download, AlertTriangle, Loader2 } from "lucide-react";

type BillingCycle = "monthly" | "yearly";
type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";
type PlanTier = "starter" | "growth" | "pro" | "premium" | "enterprise";

type BillingPlan = {
  id: string;
  name: string;
  tier: PlanTier;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  supportLevel: string;
  isActive: boolean;
};

type BillingSubscription = {
  id: string;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  renewalDate: string;
};

type BillingInvoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: "paid" | "pending" | "failed" | "refunded";
  description: string;
  issuedAt: string;
};

type PaymentMethod = {
  id: string;
  methodType: "card" | "paypal" | "bank";
  brand: string | null;
  last4: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  isDefault: boolean;
};

type BillingResponse = {
  subscription: BillingSubscription;
  currentPlan: BillingPlan | null;
  plans: BillingPlan[];
  invoices: BillingInvoice[];
  paymentMethods: PaymentMethod[];
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function BillingPage() {
  const [data, setData] = useState<BillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const loadBilling = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/dashboard/billing", {
        cache: "no-store",
        credentials: "include",
      });
      const result = (await response.json().catch(() => ({}))) as
        | BillingResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error((result as { error?: string }).error || "failed_to_load_billing");
      }

      setData(result as BillingResponse);
    } catch (error) {
      console.error("[dashboard/billing] load failed", error);
      setErrorMessage("Failed to load billing data from MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, []);

  const currentPlanTier = useMemo(() => {
    if (!data?.subscription?.planName) return "starter";
    const normalized = data.subscription.planName.trim().toLowerCase();
    if (normalized.includes("enterprise")) return "enterprise";
    if (normalized.includes("premium")) return "premium";
    if (normalized.includes("pro")) return "pro";
    if (normalized.includes("growth")) return "growth";
    return "starter";
  }, [data?.subscription?.planName]);

  const isYearly = data?.subscription.billingCycle === "yearly";

  const updateSubscription = async (payload: {
    planTier?: PlanTier;
    billingCycle?: BillingCycle;
  }) => {
    setSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/dashboard/billing", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as
        | BillingResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error((result as { error?: string }).error || "failed_to_update_subscription");
      }

      setData(result as BillingResponse);
    } catch (error) {
      console.error("[dashboard/billing] update failed", error);
      setErrorMessage("Failed to update subscription.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-10 text-center text-muted-foreground">
          Loading billing data...
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
              <Button size="sm" variant="outline" onClick={loadBilling}>
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

  const currentPlan = data.currentPlan;
  const paymentMethod = data.paymentMethods.find((method) => method.isDefault) || data.paymentMethods[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information from MySQL.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Renews on{" "}
                {new Date(data.subscription.renewalDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <Badge
              variant={data.subscription.status === "active" ? "default" : "destructive"}
              className={
                data.subscription.status === "active"
                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                  : ""
              }
            >
              {capitalize(data.subscription.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-lg border border-border bg-secondary/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {(currentPlan?.name || currentPlanTier).toUpperCase()} Plan
                </h3>
                <p className="text-muted-foreground">
                  ${currentPlan?.monthlyPrice || 0}/month - billed {data.subscription.billingCycle}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={saving} onClick={() => loadBilling()}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(currentPlan?.features || []).slice(0, 6).map((feature, index) => (
              <div key={`${feature}-${index}`} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-accent shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Available Plans</CardTitle>
            <div className="flex items-center gap-3">
              <Label htmlFor="billing-toggle" className={!isYearly ? "text-foreground" : "text-muted-foreground"}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                disabled={saving}
                onCheckedChange={(checked) =>
                  updateSubscription({ billingCycle: checked ? "yearly" : "monthly" })
                }
              />
              <Label htmlFor="billing-toggle" className={isYearly ? "text-foreground" : "text-muted-foreground"}>
                Yearly
                <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent">
                  Save 20%
                </Badge>
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {data.plans.map((plan) => {
              const isCurrentPlan = plan.tier === currentPlanTier;
              const monthlyPrice = isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-lg border ${
                    isCurrentPlan ? "border-accent bg-accent/5" : "border-border bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {isCurrentPlan && (
                      <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold">${Math.round(monthlyPrice)}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={`${plan.id}-feature-${index}`} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrentPlan ? "outline" : "default"}
                    className="w-full"
                    size="sm"
                    disabled={isCurrentPlan || saving}
                    onClick={() => updateSubscription({ planTier: plan.tier })}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Updating
                      </>
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : (
                      "Switch Plan"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          {!paymentMethod ? (
            <p className="text-sm text-muted-foreground">No payment method configured.</p>
          ) : (
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-secondary/30">
              <div className="w-12 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {paymentMethod.brand?.toUpperCase() || "CARD"}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {paymentMethod.brand || "Card"} ending in {paymentMethod.last4 || "----"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {paymentMethod.expiryMonth || "--"}/{paymentMethod.expiryYear || "----"}
                </p>
              </div>
              {paymentMethod.isDefault && <Badge variant="outline">Default</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No invoices yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-border">
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(invoice.issuedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.description}
                      </TableCell>
                      <TableCell className="font-medium">${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>
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
                          {capitalize(invoice.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" disabled>
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
