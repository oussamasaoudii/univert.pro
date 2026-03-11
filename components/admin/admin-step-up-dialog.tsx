"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type AdminStepUpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified?: () => void;
  title?: string;
  description?: string;
};

function normalizeStepUpError(value: unknown) {
  const message = value instanceof Error ? value.message : String(value || "");
  const lower = message.toLowerCase();

  if (lower.includes("invalid_credentials")) {
    return "Your password is incorrect.";
  }
  if (lower.includes("invalid_mfa_code")) {
    return "The authenticator code or recovery code is invalid.";
  }
  if (lower.includes("too_many_requests")) {
    return "Too many verification attempts. Please wait before trying again.";
  }

  return message || "Step-up verification failed.";
}

export function AdminStepUpDialog({
  open,
  onOpenChange,
  onVerified,
  title = "Re-authenticate admin access",
  description = "Confirm your password and current authenticator code before this sensitive action.",
}: AdminStepUpDialogProps) {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setCode("");
      setError("");
      setVerifying(false);
    }
  }, [open]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/auth/admin-mfa/step-up", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password, code }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(String(result?.error || "step_up_failed"));
      }

      onOpenChange(false);
      onVerified?.();
    } catch (verifyError) {
      setError(normalizeStepUpError(verifyError));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleVerify}>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={verifying}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Authenticator code or recovery code
            </label>
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456 or ABCDE-FGHIJ"
              disabled={verifying}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={verifying}>
              Cancel
            </Button>
            <Button type="submit" disabled={verifying || !password || !code.trim()}>
              {verifying ? "Verifying..." : "Verify admin access"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
