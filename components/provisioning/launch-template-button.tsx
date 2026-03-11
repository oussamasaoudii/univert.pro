"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Rocket, AlertTriangle, Loader2 } from "lucide-react";

type LaunchTemplateButtonProps = {
  templateId: string;
  templateName: string;
  buttonLabel?: string;
};

function getPlatformDomainSuffix() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return "univert.pro";
  }

  try {
    return new URL(appUrl).host.replace(/^www\./, "");
  } catch {
    return "univert.pro";
  }
}

export function LaunchTemplateButton({
  templateId,
  templateName,
  buttonLabel = "Launch This Template",
}: LaunchTemplateButtonProps) {
  const platformDomainSuffix = getPlatformDomainSuffix();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = projectName.trim().length > 1 && subdomain.trim().length >= 3;

  const handleLaunch = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/websites/launch", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          name: projectName.trim(),
          subdomain: subdomain.trim().toLowerCase(),
          customDomain: customDomain.trim() || undefined,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push("/auth/signin");
        return;
      }

      if (!response.ok || !result?.success) {
        throw new Error(String(result?.error || "Failed to launch website"));
      }

      setOpen(false);
      router.push(`/dashboard/provisioning/${result.websiteId}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Launch failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Rocket className="w-4 h-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Launch {templateName}</DialogTitle>
          <DialogDescription>
            Create a new website instance from this demo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Project name</label>
            <input
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="My Store"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subdomain</label>
            <input
              type="text"
              value={subdomain}
              onChange={(event) => setSubdomain(event.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
              placeholder="my-store"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-muted-foreground">
              Your default URL will be `{subdomain || "your-site"}.${platformDomainSuffix}`
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom domain (optional)</label>
            <input
              type="text"
              value={customDomain}
              onChange={(event) => setCustomDomain(event.target.value)}
              placeholder="example.com"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <Button onClick={handleLaunch} disabled={!canSubmit || isSubmitting} className="w-full gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            Launch Website
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
