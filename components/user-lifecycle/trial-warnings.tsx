"use client";

import { AlertCircle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Subscription } from "@/lib/types";
import { billingLogic } from "@/lib/billing-logic";

interface TrialWarningProps {
  subscription: Subscription | null;
}

/**
 * Trial Warning Banner
 * Shown when user's trial is expiring soon or has expired
 */
export function TrialWarningBanner({ subscription }: TrialWarningProps) {
  if (!subscription) return null;

  const isTrialActive = billingLogic.isTrialActive(subscription);
  const isTrialExpiringSoon = billingLogic.isTrialExpiringsoon(subscription);
  const daysRemaining = billingLogic.getDaysRemainingInTrial(subscription.trialEndsAt);

  if (!isTrialActive && !isTrialExpiringSoon) return null;

  return (
    <Card className="bg-yellow-500/5 border-yellow-500/20">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">
                {daysRemaining === 0
                  ? "Trial expires today"
                  : `${daysRemaining} day${daysRemaining > 1 ? "s" : ""} left in trial`}
              </p>
              <p className="text-xs text-muted-foreground">
                Add a payment method to keep your websites live after trial ends.
              </p>
            </div>
          </div>
          <Button size="sm" className="flex-shrink-0">
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Subscription Expired Component
 * Shown when subscription has expired
 */
export function SubscriptionExpiredBanner() {
  return (
    <Card className="bg-red-500/5 border-red-500/20">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Subscription expired</p>
              <p className="text-xs text-muted-foreground">
                Your websites are suspended. Renew your subscription to restore access.
              </p>
            </div>
          </div>
          <Button size="sm" variant="destructive" className="flex-shrink-0">
            Renew Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Payment Past Due Component
 * Shown when payment has failed
 */
export function PaymentPastDueBanner() {
  return (
    <Card className="bg-orange-500/5 border-orange-500/20">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Payment failed</p>
              <p className="text-xs text-muted-foreground">
                Please update your payment method to avoid service interruption.
              </p>
            </div>
          </div>
          <Button size="sm" className="flex-shrink-0">
            Update Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
