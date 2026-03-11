"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSiteLanguage } from "@/hooks/use-site-language";
import { cn } from "@/lib/utils";

const LOGIN_COPY = {
  en: {
    welcomeTitle: "Welcome back",
    welcomeDescription: "Sign in to continue to your dashboard",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    submit: "Sign in",
    loading: "Signing in...",
    noAccount: "Don't have an account?",
    createAccount: "Create one",
    adminPortal: "Admin portal",
    requiredFields: "Email and password are required",
    defaultError: "Sign in failed",
    secureNote: "Your connection is secure and encrypted",
  },
  ar: {
    welcomeTitle: "أهلاً بعودتك",
    welcomeDescription: "سجل الدخول للمتابعة إلى لوحة التحكم",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    submit: "تسجيل الدخول",
    loading: "جاري تسجيل الدخول...",
    noAccount: "ليس لديك حساب؟",
    createAccount: "إنشاء حساب",
    adminPortal: "بوابة الإدارة",
    requiredFields: "البريد الإلكتروني وكلمة المرور مطلوبان",
    defaultError: "فشل تسجيل الدخول",
    secureNote: "اتصالك آمن ومشفر",
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      dir={isArabic ? "rtl" : "ltr"} 
      className={cn("space-y-8", isArabic ? "text-right" : "text-left")}
    >
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {copy.welcomeTitle}
        </h1>
        <p className="text-muted-foreground">{copy.welcomeDescription}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{copy.emailLabel}</label>
          <div className="relative group">
            <Mail
              className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent",
                isArabic ? "right-4" : "left-4"
              )}
            />
            <Input
              type="email"
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "h-12 bg-secondary/30 border-border/50 focus:border-accent focus:ring-accent/20 transition-all",
                isArabic ? "pr-12" : "pl-12"
              )}
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className={cn("flex items-center justify-between", isArabic && "flex-row-reverse")}>
            <label className="text-sm font-medium text-foreground">{copy.passwordLabel}</label>
            <Link 
              href="/auth/forgot-password" 
              className="text-xs text-accent hover:text-accent/80 hover:underline transition-colors"
            >
              {copy.forgotPassword}
            </Link>
          </div>
          <div className="relative group">
            <Lock
              className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent",
                isArabic ? "right-4" : "left-4"
              )}
            />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={copy.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "h-12 bg-secondary/30 border-border/50 focus:border-accent focus:ring-accent/20 transition-all",
                isArabic ? "pr-12 pl-12" : "pl-12 pr-12"
              )}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                isArabic ? "left-4" : "right-4"
              )}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {copy.loading}
            </span>
          ) : (
            <>
              {copy.submit}
              <ArrowRight className={cn("h-4 w-4", isArabic ? "mr-2 rotate-180" : "ml-2")} />
            </>
          )}
        </Button>
      </form>

      {/* Security Note */}
      <div className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground justify-center",
        isArabic && "flex-row-reverse"
      )}>
        <Shield className="h-3.5 w-3.5 text-accent" />
        <span>{copy.secureNote}</span>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
      </div>

      {/* Footer Links */}
      <div className="space-y-3">
        <p className={cn(
          "text-sm text-muted-foreground",
          isArabic ? "text-right" : "text-left"
        )}>
          {copy.noAccount}{" "}
          <Link 
            href="/auth/signup" 
            className="font-medium text-accent hover:text-accent/80 hover:underline transition-colors"
          >
            {copy.createAccount}
          </Link>
        </p>
        
        <Link 
          href="/admin/login" 
          className={cn(
            "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
            isArabic && "flex-row-reverse"
          )}
        >
          <span>{copy.adminPortal}</span>
          <ArrowRight className={cn("h-3 w-3", isArabic && "rotate-180")} />
        </Link>
      </div>
    </motion.div>
  );
}
