"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSiteLanguage } from "@/hooks/use-site-language";
import { cn } from "@/lib/utils";

const SIGNUP_SUCCESS_COPY = {
  en: {
    title: "Account created",
    subtitle: "Your account has been created successfully",
    cardTitle: "Pending activation",
    cardDescription: "An administrator will activate your account shortly.",
    nextTitle: "What next?",
    steps: [
      "Wait for your account activation",
      "Sign in to your dashboard",
      "Create your first website",
    ],
    login: "Go to login",
    home: "Back to home",
  },
  ar: {
    title: "تم إنشاء الحساب",
    subtitle: "تم إنشاء حسابك بنجاح",
    cardTitle: "بانتظار التفعيل",
    cardDescription: "سيقوم المشرف بتفعيل حسابك قريباً.",
    nextTitle: "ما الخطوة التالية؟",
    steps: [
      "انتظر تفعيل الحساب من الإدارة",
      "سجّل الدخول إلى لوحة التحكم",
      "أنشئ موقعك الأول",
    ],
    login: "الذهاب إلى تسجيل الدخول",
    home: "العودة إلى الرئيسية",
  },
} as const;

export default function SignUpSuccessPage() {
  const language = useSiteLanguage();
  const resolvedLanguage: keyof typeof SIGNUP_SUCCESS_COPY = language === "ar" ? "ar" : "en";
  const isArabic = resolvedLanguage === "ar";
  const copy = SIGNUP_SUCCESS_COPY[resolvedLanguage];

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className={cn("space-y-6", isArabic ? "text-right" : "text-left")}>
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
          <Clock3 className="w-20 h-20 text-accent relative" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.subtitle}</p>
      </div>

      <Card className="border border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle>{copy.cardTitle}</CardTitle>
          <CardDescription>{copy.cardDescription}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3 pt-2">
            <h3 className="font-medium text-sm text-foreground">{copy.nextTitle}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {copy.steps.map((step) => (
                <li key={step} className={cn("flex items-center gap-2", isArabic && "flex-row-reverse")}>
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-background font-medium">
          <Link href="/auth/login">
            {copy.login}
            <ArrowRight className={cn("h-4 w-4", isArabic ? "mr-2 rotate-180" : "ml-2")} />
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full">
          <Link href="/">
            <Home className={cn("h-4 w-4", isArabic ? "mr-2" : "ml-2")} />
            {copy.home}
          </Link>
        </Button>
      </div>
    </div>
  );
}
