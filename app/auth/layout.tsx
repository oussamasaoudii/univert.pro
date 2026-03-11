import Link from "next/link";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { getServerLanguage } from "@/lib/i18n/server-language";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AUTH_LAYOUT_COPY = {
  en: {
    heading: "Launch premium websites in minutes",
    description:
      "Join thousands of businesses using Ovmon to deploy and manage their online presence with enterprise-grade infrastructure.",
    features: [
      "Instant provisioning in under 2 minutes",
      "No lock-in - export your data anytime",
      "Enterprise security by default",
    ],
    rights: "2026 Ovmon. All rights reserved.",
  },
  ar: {
    heading: "أطلق مواقع احترافية خلال دقائق",
    description:
      "انضم إلى آلاف الشركات التي تستخدم Ovmon لنشر وإدارة حضورها الرقمي ببنية تحتية بمعايير المؤسسات.",
    features: [
      "تجهيز الموقع خلال أقل من دقيقتين",
      "بدون قيود - يمكنك تصدير بياناتك في أي وقت",
      "أمان مؤسسي بشكل افتراضي",
    ],
    rights: "2026 Ovmon. جميع الحقوق محفوظة.",
  },
} as const;

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = await getServerLanguage();
  const isArabic = language === "ar";
  const copy = AUTH_LAYOUT_COPY[language];

  return (
    <div className="min-h-screen flex" dir={isArabic ? "rtl" : "ltr"}>
      <div className="hidden lg:flex lg:w-1/2 bg-secondary/30 border-r border-border flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
            <span className="text-sm font-bold text-accent-foreground">O</span>
          </div>
          <span className="text-xl font-semibold tracking-tight">Ovmon</span>
        </Link>

        <div className={cn("max-w-md", isArabic ? "text-right" : "text-left")}>
          <h1 className="text-3xl font-bold tracking-tight">{copy.heading}</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">{copy.description}</p>
          <div className="mt-8 space-y-4">
            {copy.features.map((feature) => (
              <div
                key={feature}
                className={cn(
                  "flex items-center gap-3 text-sm",
                  isArabic && "flex-row-reverse justify-end",
                )}
              >
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <p className={cn("text-sm text-muted-foreground", isArabic ? "text-right" : "text-left")}>
          {copy.rights}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div
          className={cn(
            "absolute top-6 flex items-center gap-2",
            isArabic ? "left-6 md:left-12" : "right-6 md:right-12",
          )}
        >
          <LanguageSwitcher withTheme />
        </div>

        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
              <span className="text-sm font-bold text-accent-foreground">O</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Ovmon</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
