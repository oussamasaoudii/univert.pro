"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { AlertCircle, ArrowRight, Copy, KeyRound, QrCode, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AdminMfaStatusResponse = {
  ok: true;
  authenticated: boolean;
  redirectTo?: string;
  email?: string;
  mode?: "enroll" | "verify";
  enrollment?: {
    manualEntryKey: string;
    otpAuthUri: string;
    issuer: string;
  };
};

function normalizeError(value: unknown) {
  const message = value instanceof Error ? value.message : String(value || "");
  const lower = message.toLowerCase();

  if (lower.includes("invalid_mfa_code")) {
    return "The authenticator code or recovery code is invalid.";
  }
  if (lower.includes("challenge_required")) {
    return "Your admin login challenge expired. Please sign in again.";
  }
  if (lower.includes("too_many_requests")) {
    return "Too many verification attempts. Please wait and try again.";
  }

  return message || "Verification failed";
}

function AdminMfaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const [status, setStatus] = useState<AdminMfaStatusResponse | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  const effectiveMode = useMemo(() => {
    if (requestedMode === "enroll" || requestedMode === "verify") {
      return requestedMode;
    }

    return status?.mode || "verify";
  }, [requestedMode, status?.mode]);

  useEffect(() => {
    const loadStatus = async () => {
      setLoading(true);
      setError("");

      try {
        // Reset the pool to ensure fresh database connections with updated schema
        try {
          await fetch("/api/admin/reset-pool", { method: "POST" });
        } catch (err) {
          console.log("[v0] Pool reset failed (non-critical):", err);
        }

        const response = await fetch("/api/auth/admin-mfa/status", {
          credentials: "include",
          cache: "no-store",
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(String(result?.error || "challenge_required"));
        }

        const nextStatus = result as AdminMfaStatusResponse;
        if (nextStatus.authenticated && nextStatus.redirectTo) {
          router.replace(nextStatus.redirectTo);
          return;
        }

        setStatus(nextStatus);
      } catch (loadError) {
        setError(normalizeError(loadError));
      } finally {
        setLoading(false);
      }
    };

    void loadStatus();
  }, [router]);

  useEffect(() => {
    let active = true;

    const otpAuthUri = status?.enrollment?.otpAuthUri;
    if (!otpAuthUri) {
      setQrCodeDataUrl("");
      return () => {
        active = false;
      };
    }

    void QRCode.toDataURL(otpAuthUri, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 224,
    })
      .then((value) => {
        if (active) {
          setQrCodeDataUrl(value);
        }
      })
      .catch(() => {
        if (active) {
          setQrCodeDataUrl("");
        }
      });

    return () => {
      active = false;
    };
  }, [status?.enrollment?.otpAuthUri]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard support is optional.
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/auth/admin-mfa/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(String(result?.error || "verification_failed"));
      }

      const nextRecoveryCodes = Array.isArray(result?.recoveryCodes)
        ? (result.recoveryCodes as string[])
        : null;

      if (nextRecoveryCodes?.length) {
        setRecoveryCodes(nextRecoveryCodes);
        setCode("");
        return;
      }

      const redirectTo =
        typeof result?.redirectTo === "string" && result.redirectTo
          ? result.redirectTo
          : "/admin";
      router.replace(redirectTo);
      router.refresh();
    } catch (verifyError) {
      setError(normalizeError(verifyError));
    } finally {
      setVerifying(false);
    }
  };

  if (recoveryCodes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Admin MFA enabled
            </CardTitle>
            <CardDescription>
              Save these recovery codes now. They are shown only once and can replace your authenticator if needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
              {recoveryCodes.map((recoveryCode) => (
                <code key={recoveryCode} className="rounded bg-background px-3 py-2 text-sm font-medium">
                  {recoveryCode}
                </code>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => handleCopy(recoveryCodes.join("\n"))}>
                <Copy className="mr-2 h-4 w-4" />
                Copy recovery codes
              </Button>
              <Button type="button" onClick={() => router.replace("/admin")}>
                Continue to admin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            {effectiveMode === "enroll" ? "Set up admin MFA" : "Verify admin MFA"}
          </CardTitle>
          <CardDescription>
            {effectiveMode === "enroll"
              ? "Add this TOTP secret to your authenticator app, then enter the 6-digit code to finish admin enrollment."
              : "Enter the 6-digit authenticator code, or a recovery code if you lost your device."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading secure admin challenge...</div>
          ) : (
            <>
              {effectiveMode === "enroll" && status?.enrollment ? (
                <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                  <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-background/60 p-4 text-center">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="Admin MFA enrollment QR code"
                        className="h-56 w-56 rounded-lg border bg-white p-3"
                      />
                    ) : (
                      <div className="flex h-56 w-56 items-center justify-center rounded-lg border border-dashed bg-muted/40 text-muted-foreground">
                        <QrCode className="h-10 w-10" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Scan this QR code in your authenticator app</p>
                      <p className="text-xs text-muted-foreground">
                        If QR import fails, use the manual entry key below. The secret is shown only during this secure enrollment challenge.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Manual entry key</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 overflow-hidden rounded bg-background px-3 py-2 text-sm">
                        {status.enrollment.manualEntryKey}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(status.enrollment!.manualEntryKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">OTP Auth URI</p>
                    <div className="flex items-center gap-2">
                      <Input value={status.enrollment.otpAuthUri} readOnly />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(status.enrollment!.otpAuthUri)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Account: {status.email} | Issuer: {status.enrollment.issuer}
                  </p>
                </div>
              ) : null}

              <form className="space-y-4" onSubmit={handleVerify}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Authenticator code or recovery code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      className="pl-10"
                      placeholder="123456 or ABCDE-FGHIJ"
                      disabled={verifying}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={verifying || !code.trim()}>
                  {verifying ? "Verifying..." : effectiveMode === "enroll" ? "Enable admin MFA" : "Verify admin access"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminMfaPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Loading admin MFA
          </CardTitle>
          <CardDescription>Preparing your secure admin verification flow.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading secure admin challenge...</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminMfaPage() {
  return (
    <Suspense fallback={<AdminMfaPageFallback />}>
      <AdminMfaPageContent />
    </Suspense>
  );
}
