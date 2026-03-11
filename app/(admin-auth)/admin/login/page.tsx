"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

function normalizeAdminError(value: unknown): string {
  const message = value instanceof Error ? value.message : String(value || "");
  const lowerCaseMessage = message.toLowerCase();

  if (lowerCaseMessage.includes("invalid_credentials")) {
    return "Invalid admin email or password";
  }
  if (lowerCaseMessage.includes("too_many_requests")) {
    return "Too many admin login attempts. Please wait before trying again.";
  }
  if (lowerCaseMessage.includes("admin_only")) {
    return "This account is not an admin account";
  }
  if (lowerCaseMessage.includes("pending_activation")) {
    return "Admin account is pending activation";
  }
  if (lowerCaseMessage.includes("account_suspended")) {
    return "Admin account is suspended";
  }
  return message || "Admin sign in failed";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await fetch("/api/auth/me?scope=admin", {
          cache: "no-store",
          credentials: "include",
        });
        if (!response.ok) return;
        const me = await response.json().catch(() => ({}));
        if (me?.role === "admin") {
          router.replace("/admin");
        }
      } catch {
        // ignore session probe errors
      }
    };

    checkAdminSession();
  }, [router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Admin sign in failed");
      }

      const redirectTo =
        typeof result?.redirectTo === "string" && result.redirectTo.length > 0
          ? result.redirectTo
          : "/admin";
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(normalizeAdminError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <h1 className="text-3xl font-bold text-foreground">Admin Login</h1>
          </div>
          <p className="text-muted-foreground">Sign in to the Ovmon admin panel</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle>Administrator Access</CardTitle>
            <CardDescription>Only admin accounts are allowed on this form</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@yourdomain.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-background font-medium"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in as admin"}
                <ArrowRight className={cn("h-4 w-4 ml-2")} />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-sm text-center text-muted-foreground">
          Need user login?{" "}
          <Link href="/auth/login" className="font-medium text-accent hover:underline">
            Go to user login
          </Link>
        </div>
      </div>
    </div>
  );
}
