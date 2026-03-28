"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
// ArrowRight kept for submit button
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSiteLanguage } from "@/hooks/use-site-language";
import { cn } from "@/lib/utils";
import { OAuthButtons, OAuthDivider } from "@/components/auth/oauth-buttons";

const SIGNUP_COPY = {
  en: {
    title: "Create your account",
    subtitle: "Start launching your website with Univert today",
    email: "Email address",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "Create a strong password",
    repeatPassword: "Confirm password",
    repeatPasswordPlaceholder: "Repeat your password",
    submit: "Create account",
    loading: "Creating account...",
    loginHint: "Already have an account?",
    login: "Sign in",
    passwordMismatch: "Passwords do not match",
    requiredFields: "Please complete all fields",
    defaultError: "Failed to create account",
    secureNote: "Your data is protected with enterprise-grade encryption",
    passwordRequirements: "Password requirements",
    requirements: [
      "At least 12 characters",
      "One uppercase letter",
      "One number",
      "One special character",
    ],
  },
  ar: {
    title: "إنشاء حسابك",
    subtitle: "ابدأ إطلاق موقعك مع Univert اليوم",
    email: "البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    password: "كلمة المرور",
    passwordPlaceholder: "أنشئ كلمة مرور قوية",
    repeatPassword: "تأكيد كلمة المرور",
    repeatPasswordPlaceholder: "أعد كتابة كلمة المرور",
    submit: "إنشاء الحساب",
    loading: "جاري إنشاء الحساب...",
    loginHint: "هل لديك حساب بالفعل؟",
    login: "تسجيل الدخول",
    passwordMismatch: "كلمات المرور غير متطابقة",
    requiredFields: "يرجى تعبئة جميع الحقول",
    defaultError: "فشل إنشاء الحساب",
    secureNote: "بياناتك محمية بتشفير بمستوى المؤسسات",
    passwordRequirements: "متطلبات كلمة المرور",
    requirements: [
      "12 حرفًا على الأقل",
      "حرف كبير واحد",
      "رقم واحد",
      "رمز خاص واحد",
    ],
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

// Password strength checker
function checkPasswordStrength(password: string) {
  return {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
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

  const passwordStrength = checkPasswordStrength(password);
  const strengthChecks = [
    passwordStrength.length,
    passwordStrength.uppercase,
    passwordStrength.number,
    passwordStrength.special,
  ];

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
          {copy.title}
        </h1>
        <p className="text-muted-foreground">{copy.subtitle}</p>
      </div>

      {/* OAuth Buttons */}
      <OAuthButtons language={language} returnUrl="/dashboard" />

      <OAuthDivider language={language} />

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
      <form onSubmit={handleSignUp} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{copy.email}</label>
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "h-12 bg-secondary/30 border-border/50 focus:border-accent focus:ring-accent/20 transition-all",
                isArabic ? "pr-12" : "pl-12"
              )}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{copy.password}</label>
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
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "h-12 bg-secondary/30 border-border/50 focus:border-accent focus:ring-accent/20 transition-all",
                isArabic ? "pr-12 pl-12" : "pl-12 pr-12"
              )}
              disabled={isLoading}
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
          
          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2 pt-2"
            >
              <div className="flex gap-1">
                {strengthChecks.map((met, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      met ? "bg-accent" : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {copy.requirements.map((req, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "flex items-center gap-1.5 text-xs transition-colors",
                      strengthChecks[i] ? "text-accent" : "text-muted-foreground",
                      isArabic && "flex-row-reverse"
                    )}
                  >
                    <Check className={cn("h-3 w-3", strengthChecks[i] ? "opacity-100" : "opacity-30")} />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Repeat Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{copy.repeatPassword}</label>
          <div className="relative group">
            <Lock
              className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent",
                isArabic ? "right-4" : "left-4"
              )}
            />
            <Input
              type={showRepeatPassword ? "text" : "password"}
              placeholder={copy.repeatPasswordPlaceholder}
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={cn(
                "h-12 bg-secondary/30 border-border/50 focus:border-accent focus:ring-accent/20 transition-all",
                isArabic ? "pr-12 pl-12" : "pl-12 pr-12",
                repeatPassword.length > 0 && password !== repeatPassword && "border-destructive/50 focus:border-destructive"
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                isArabic ? "left-4" : "right-4"
              )}
            >
              {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {repeatPassword.length > 0 && password !== repeatPassword && (
            <p className="text-xs text-destructive">{copy.passwordMismatch}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
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


    </motion.div>
  );
}
