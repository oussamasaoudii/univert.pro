"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, BookOpen, Mail, MessageSquare, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    title: "Support Tickets",
    description: "Review customer tickets that already exist inside the dashboard support workflow.",
    href: "/admin/tickets",
    icon: MessageSquare,
    cta: "Open tickets",
  },
  {
    title: "Contact Page",
    description: "Review the public contact experience and keep support paths aligned with the live product.",
    href: "/contact",
    icon: Mail,
    cta: "Open contact page",
  },
  {
    title: "Help Center",
    description: "Confirm that help and ownership guidance remain clear before messages are collected publicly.",
    href: "/help-center",
    icon: BookOpen,
    cta: "Open help center",
  },
  {
    title: "Admin Settings",
    description: "Use settings and content surfaces when you later wire a real contact inbox or contact workflow.",
    href: "/admin/settings",
    icon: Settings,
    cta: "Open settings",
  },
];

export default function AdminContactMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
          <Badge variant="outline">Admin</Badge>
        </div>
        <p className="mt-2 text-muted-foreground">
          Review how public contact requests are handled and prepare the inbox flow when contact message storage is connected.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          A dedicated public contact inbox is not wired into this project yet. This page gives the workflow a clear
          home inside admin, but no stored contact-message feed is available to display at the moment.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-border/60 bg-card/60">
              <CardHeader className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="mt-2">{item.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href={item.href}>
                    {item.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/60 bg-secondary/20">
        <CardHeader>
          <CardTitle>What this means right now</CardTitle>
          <CardDescription>Current state of the admin contact-message flow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>- The admin navigation now exposes Contact Messages directly.</p>
          <p>- The project currently routes customer support through dashboard tickets and help pages.</p>
          <p>- If you later connect a real contact form endpoint and storage table, this page can expand into a full inbox.</p>
        </CardContent>
      </Card>
    </div>
  );
}
