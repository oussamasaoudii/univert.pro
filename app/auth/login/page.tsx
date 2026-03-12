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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      dir={isArabic ? "rtl" : "ltr"} 
      className={cn("space-y-6", isArabic ? "text-right" : "text-left")}
    >
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {copy.welcomeTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{copy.welcomeDescription}</p>
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
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground/80">{copy.emailLabel}</label>
          <div className="relative group">
            <Mail
              className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-accent",
                isArabic ? "right-3.5" : "left-3.5"
              )}
            />
            <Input
              type="email"
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "h-11 bg-secondary/20 border-border/40 focus:border-accent/60 focus:bg-secondary/30 transition-all",
                isArabic ? "pr-11" : "pl-11"
              )}
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className={cn("flex items-center justify-between", isArabic && "flex-row-reverse")}>
            <label className="text-xs font-medium text-foreground/80">{copy.passwordLabel}</label>
            <Link 
              href="/auth/forgot-password" 
              className="text-[11px] text-muted-foreground hover:text-accent transition-colors"
            >
              {copy.forgotPassword}
            </Link>
          </div>
          <div className="relative group">
            <Lock
              className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-accent",
                isArabic ? "right-3.5" : "left-3.5"
              )}
            />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={copy.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "h-11 bg-secondary/20 border-border/40 focus:border-accent/60 focus:bg-secondary/30 transition-all",
                isArabic ? "pr-11 pl-11" : "pl-11 pr-11"
              )}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors",
                isArabic ? "left-3.5" : "right-3.5"
              )}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 mt-2 bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/20 transition-all"
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
        "flex items-center gap-1.5 text-[11px] text-muted-foreground/70 justify-center",
        isArabic && "flex-row-reverse"
      )}>
        <Shield className="h-3 w-3 text-accent/70" />
        <span>{copy.secureNote}</span>
      </div>

      {/* Footer Links */}
      <div className="pt-5 space-y-3">
        <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
          <p className={cn(
            "text-sm text-muted-foreground text-center"
          )}>
            {copy.noAccount}{" "}
            <Link 
              href="/auth/signup" 
              className="font-medium text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-1"
            >
              {copy.createAccount}
              <ArrowRight className={cn("h-3 w-3", isArabic && "rotate-180")} />
            </Link>
          </p>
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/admin/login" 
            className={cn(
              "inline-flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors",
              isArabic && "flex-row-reverse"
            )}
          >
            <span>{copy.adminPortal}</span>
            <ArrowRight className={cn("h-2 w-2", isArabic && "rotate-180")} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
