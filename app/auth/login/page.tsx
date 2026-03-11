"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSiteLanguage } from "@/hooks/use-site-language";
import { cn } from "@/lib/utils";

const LOGIN_COPY = {
  en: {
    welcomeTitle: "Welcome back",
    welcomeDescription: "Sign in to your Ovmon account",
    formTitle: "Sign in",
    formDescription: "Enter your account credentials",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    forgotPassword: "Forgot?",
    submit: "Sign in",
    loading: "Signing in...",
    noAccount: "Don\'t have an account?",
    createAccount: "Create one",
    adminPortal: "Admin login",
    requiredFields: "Email and password are required",
    defaultError: "Sign in failed",
  },
  ar: {
    welcomeTitle: "أهلاً بعودتك",
    welcomeDescription: "سجل الدخول إلى حسابك على Ovmon",
    formTitle: "تسجيل الدخول",
    formDescription: "أدخل بيانات حسابك للوصول إلى لوحة التحكم",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    forgotPassword: "هل نسيت؟",
    submit: "تسجيل الدخول",
    loading: "جاري تسجيل الدخول...",
    noAccount: "ليس لديك حساب؟",
    createAccount: "إنشاء حساب",
    adminPortal: "دخول الإدارة",
    requiredFields: "البريد الإلكتروني وكلمة المرور مطلوبان",
    defaultError: "فشل تسجيل الدخول",
  },
} as const;

function normalizeAuthError(value: unknown, language: keyof typeof LOGIN_COPY): string {
  const fallback = LOGIN_COPY[language].defaultError;
  const message = value instanceof Error ? value.message : String(value || "");
  const lowerCaseMessage = message.toLowerCase();

  if (lowerCaseMessage.includes("invalid login credentials")) {
    return language === "ar"
      ? "بيانات تسجيل الدخول غير صحيحة"
      : "Invalid email or password";
  }

  if (lowerCaseMessage.includes("invalid_credentials")) {
    return language === "ar"
      ? "بيانات تسجيل الدخول غير صحيحة"
      : "Invalid email or password";
  }

  if (lowerCaseMessage.includes("too_many_requests")) {
    return language === "ar"
      ? "تم حظر المحاولات مؤقتًا. حاول مرة أخرى بعد قليل."
      : "Too many attempts. Please wait and try again shortly.";
  }

  if (lowerCaseMessage.includes("email not confirmed")) {
    return language === "ar"
      ? "الحساب غير مفعل بعد. انتظر تفعيل الإدارة ثم حاول مرة أخرى."
      : "Your account is not activated yet. Please wait for admin activation.";
  }

  if (lowerCaseMessage.includes("pending_activation")) {
    return language === "ar"
      ? "الحساب غير مفعل بعد. انتظر تفعيل الإدارة ثم حاول مرة أخرى."
      : "Your account is not activated yet. Please wait for admin activation.";
  }

  if (lowerCaseMessage.includes("account_suspended")) {
    return language === "ar" ? "تم تعليق هذا الحساب" : "This account has been suspended";
  }

  if (lowerCaseMessage.includes("email_not_verified")) {
    return language === "ar"
      ? "يرجى تأكيد البريد الإلكتروني أولاً"
      : "Please verify your email first";
  }

  if (lowerCaseMessage.includes("admin_login_required")) {
    return language === "ar"
      ? "حسابات الإدارة يجب أن تدخل من صفحة /admin/login"
      : "Admin accounts must sign in from /admin/login";
  }

  return message || fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const language = useSiteLanguage();
  const isArabic = language === "ar";
  const copy = LOGIN_COPY[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(copy.requiredFields);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
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
        throw new Error(result?.error || copy.defaultError);
      }

      const redirectTo =
        typeof result?.redirectTo === "string" && result.redirectTo.length > 0
          ? result.redirectTo
          : "/dashboard";

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(normalizeAuthError(err, language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className={cn("space-y-6", isArabic ? "text-right" : "text-left")}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{copy.welcomeTitle}</h1>
        <p className="text-muted-foreground">{copy.welcomeDescription}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle>{copy.formTitle}</CardTitle>
          <CardDescription>{copy.formDescription}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{copy.emailLabel}</label>
              <div className="relative">
                <Mail
                  className={cn(
                    "absolute top-3 h-4 w-4 text-muted-foreground",
                    isArabic ? "right-3" : "left-3",
                  )}
                />
                <Input
                  type="email"
                  placeholder={copy.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(isArabic ? "pr-10" : "pl-10")}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">{copy.passwordLabel}</label>
                <Link href="/auth/forgot-password" className="text-xs text-accent hover:underline">
                  {copy.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className={cn(
                    "absolute top-3 h-4 w-4 text-muted-foreground",
                    isArabic ? "right-3" : "left-3",
                  )}
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={copy.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(isArabic ? "pr-10 pl-10" : "pl-10 pr-10")}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "absolute top-3 text-muted-foreground hover:text-foreground",
                    isArabic ? "left-3" : "right-3",
                  )}
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
              {loading ? copy.loading : copy.submit}
              <ArrowRight className={cn("h-4 w-4", isArabic ? "mr-2 rotate-180" : "ml-2")} />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className={cn("text-sm text-muted-foreground", isArabic ? "text-right" : "text-left")}>
        {copy.noAccount}{" "}
        <Link href="/auth/signup" className="font-medium text-accent hover:underline">
          {copy.createAccount}
        </Link>
      </div>

      <div className={cn("text-sm", isArabic ? "text-right" : "text-left")}>
        <Link href="/admin/login" className="font-medium text-accent hover:underline">
          {copy.adminPortal}
        </Link>
      </div>
    </div>
  );
}
