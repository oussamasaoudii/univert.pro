"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Zap } from "lucide-react";

/**
 * Onboarding Flow Component
 * Shown to new users in trial period with no websites yet
 */
export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<"welcome" | "template" | "trial">("welcome");

  if (currentStep === "welcome") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Welcome to Ovmon!</h2>
          <p className="text-muted-foreground">
            Let's get your first website live in minutes. You're on a free 14-day trial with full access.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: 1, title: "Choose Template", desc: "Pick from 12+ premium templates" },
            { step: 2, title: "Launch Website", desc: "Deploy in seconds" },
            { step: 3, title: "Manage & Scale", desc: "Everything in one dashboard" },
          ].map((item) => (
            <Card key={item.step} className="bg-secondary/30 border-border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-background text-sm font-semibold">
                    {item.step}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-4 space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => setCurrentStep("template")}
          >
            Browse Templates
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link href="/dashboard">Maybe Later</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === "trial") {
    return (
      <Card className="bg-accent/5 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            You're on a Free Trial
          </CardTitle>
          <CardDescription>
            Full access to all features for 14 days. No credit card required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {["Launch unlimited websites", "Full infrastructure access", "Premium support", "No credit card needed"].map(
              (feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              )
            )}
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/templates">Start Building</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
