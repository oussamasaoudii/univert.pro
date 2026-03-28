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
          <h2 className="text-2xl font-bold">Welcome to Univert!</h2>
          <p className="text-muted-foreground">
            Let's get your first website live in 24 hours. Choose a template and we'll handle the setup.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: 1, title: "Choose Template", desc: "Pick from 50+ professional templates" },
            { step: 2, title: "Setup Website", desc: "Our team handles configuration" },
            { step: 3, title: "Go Live", desc: "Your site launches in 24 hours" },
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
            Ready to Launch Your Website
          </CardTitle>
          <CardDescription>
            We'll set everything up for you. Get live in 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {["Professional templates", "Managed setup & hosting", "Custom domain", "24/7 support", "Export anytime"].map(
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
