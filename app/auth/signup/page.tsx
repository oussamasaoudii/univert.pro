"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSiteLanguage } from "@/hooks/use-site-language";
import { cn } from "@/lib/utils";

const SIGNUP_COPY = {
  en: {
    title: "Sign up",
    subtitle: "Create a new account",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    repeatPassword: "Repeat Password",
    submit: "Create account",
    loading: "Creating account...",
    loginHint: "Already have an account?",
    login: "Login",
    passwordMismatch: "Passwords do not match",
    requiredFields: "Please complete all fields",
    defaultError: "Failed to create account",
  },
  ar: {
    title: "إنشاء حساب",
    subtitle: "أنشئ حساباً جديداً",
    email: "البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    password: "كلمة المرور",
    repeatPassword: "تأكيد كلمة المرور",
    submit: "إنشاء الحساب",
    loading: "جاري إنشاء الحساب...",
    loginHint: "هل لديك حساب بالفعل؟",
    login: "تسجيل الدخول",
    passwordMismatch: "كلمات المرور غير متطابقة",
    requiredFields: "يرجى تعبئة جميع الحقول",
    defaultError: "فشل إنشاء الحساب",
  },
} as const;

function normalizeSignUpError(value: unknown, language: keyof typeof SIGNUP_COPY): string {
  const fallback = SIGNUP_COPY[language].defaultError;
  const message = value instanceof Error ? value.message : String(value || "");
  const lowerCaseMessage = message.toLowerCase();

  if (lowerCaseMessage.includes("user already registered")) {
    return language === "ar"
      ? "هذا البريد مستخدم بالفعل"
      : "This email is already registered";
  }

  if (lowerCaseMessage.includes("already_exists")) {
    return language === "ar"
      ? "هذا البريد مستخدم بالفعل"
      : "This email is already registered";
  }

  if (lowerCaseMessage.includes("password should be at least")) {
    return language === "ar"
      ? "كلمة المرور يجب أن تكون قوية: 12 حرفًا على الأقل مع رموز وأرقام وحروف كبيرة وصغيرة"
      : "Password must be strong: at least 12 characters with upper, lower, number, and symbol";
  }

  if (lowerCaseMessage.includes("weak_password")) {
    return language === "ar"
      ? "كلمة المرور يجب أن تكون قوية: 12 حرفًا على الأقل مع رموز وأرقام وحروف كبيرة وصغيرة"
      : "Password must be strong: at least 12 characters with upper, lower, number, and symbol";
  }

  if (lowerCaseMessage.includes("too_many_requests")) {
    return language === "ar"
      ? "تم إرسال عدد كبير من الطلبات. انتظر قليلًا ثم حاول مرة أخرى."
      : "Too many requests. Please wait a moment and try again.";
  }

  if (lowerCaseMessage.includes("signup_disabled")) {
    return language === "ar"
      ? "تم إيقاف التسجيل حالياً بواسطة الإدارة"
      : "New account registration is currently disabled by admin";
  }

  if (lowerCaseMessage.includes("invalid email")) {
    return language === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address";
  }

  if (lowerCaseMessage.includes("invalid_email")) {
    return language === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address";
  }

  return message || fallback;
}

export default function SignupPage() {
  const router = useRouter();
  const language = useSiteLanguage();
  const isArabic = language === "ar";
  const copy = SIGNUP_COPY[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !password || !repeatPassword) {
      setError(copy.requiredFields);
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError(copy.passwordMismatch);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
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
        throw new Error(String(result?.error || copy.defaultError));
      }

      router.push("/auth/sign-up-success");
    } catch (err) {
      setError(normalizeSignUpError(err, language));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className={cn("space-y-6", isArabic ? "text-right" : "text-left")}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.subtitle}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{copy.email}</label>
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(isArabic ? "pr-10" : "pl-10")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{copy.password}</label>
                <div className="relative">
                  <Lock
                    className={cn(
                      "absolute top-3 h-4 w-4 text-muted-foreground",
                      isArabic ? "right-3" : "left-3",
                    )}
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(isArabic ? "pr-10 pl-10" : "pl-10 pr-10")}
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

              <div className="space-y-2">
                <label className="text-sm font-medium">{copy.repeatPassword}</label>
                <div className="relative">
                  <Lock
                    className={cn(
                      "absolute top-3 h-4 w-4 text-muted-foreground",
                      isArabic ? "right-3" : "left-3",
                    )}
                  />
                  <Input
                    type={showRepeatPassword ? "text" : "password"}
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className={cn(isArabic ? "pr-10 pl-10" : "pl-10 pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className={cn(
                      "absolute top-3 text-muted-foreground hover:text-foreground",
                      isArabic ? "left-3" : "right-3",
                    )}
                  >
                    {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? copy.loading : copy.submit}
                <ArrowRight className={cn("h-4 w-4", isArabic ? "mr-2 rotate-180" : "ml-2")} />
              </Button>
            </div>

            <div className={cn("mt-4 text-sm", isArabic ? "text-right" : "text-left")}>
              {copy.loginHint}{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                {copy.login}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
