"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { useSiteLanguage } from "@/hooks/use-site-language";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Shield, 
  Globe, 
  BarChart3,
  Star,
} from "lucide-react";

const AUTH_TABS = {
  en: {
    signIn: "Sign in",
    createAccount: "Create account",
  },
  ar: {
    signIn: "تسجيل الدخول",
    createAccount: "إنشاء حساب",
  },
} as const;

const AUTH_LAYOUT_COPY = {
  en: {
    heading: "Launch your website today",
    description:
      "Choose from professional templates, get managed setup and hosting, receive support when you need it, and keep the freedom to move your site later.",
    features: [
      { text: "Launch-ready templates with managed setup", icon: Zap },
      { text: "No lock-in - export and move anytime", icon: Shield },
      { text: "24/7 support and technical management", icon: Globe },
    ],
    rights: "2026 Univert Pro. All rights reserved.",
    trustedBy: "Trusted by hundreds of business owners",
    liveActivity: {
      label: "Active",
      deploysNow: "147 websites live",
      timeLabel: "this week",
    },
    platformStats: {
      deployments: "700+",
      deploymentsLabel: "Sites Launched",
      uptime: "99.99%",
      uptimeLabel: "Uptime",
      countries: "24/7",
      countriesLabel: "Support",
    },
    testimonials: [
      {
        quote: "We had our website live in just 2 days. The managed support handled everything technically so we could focus on our business.",
        author: "Jennifer Smith",
        role: "Shop Owner",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      {
        quote: "Professional templates that look like we hired an expensive designer. Best decision for our startup.",
        author: "David Kumar",
        role: "Founder",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        quote: "Knowing I can move my site to my own server later gave me total peace of mind. No vendor lock-in.",
        author: "Maria García",
        role: "Consultant",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      },
    ],
  },
  ar: {
    heading: "أطلق موقعك اليوم",
    description:
      "اختر من قوالب احترافية، واحصل على إعداد وهوست مُدار، والحصول على الدعم عند الحاجة، مع الحفاظ على حرية نقل موقعك لاحقاً.",
    features: [
      { text: "قوالب جاهزة للإطلاق مع إعداد مُدار", icon: Zap },
      { text: "بدون قيود - يمكنك التصدير والانتقال في أي وقت", icon: Shield },
      { text: "دعم تقني ومدارة 24/7", icon: Globe },
    ],
    rights: "2026 Univert Pro. جميع الحقوق محفوظة.",
    trustedBy: "موثوق من قبل مئات أصحاب الأعمال",
    liveActivity: {
      label: "نشط",
      deploysNow: "147 موقع مباشر",
      timeLabel: "هذا الأسبوع",
    },
    platformStats: {
      deployments: "+700",
      deploymentsLabel: "مواقع مُطلقة",
      uptime: "99.99%",
      uptimeLabel: "وقت التشغيل",
      countries: "24/7",
      countriesLabel: "الدعم",
    },
    testimonials: [
      {
        quote: "كان لدينا موقع مباشر في يومين فقط. الدعم المُدار تعامل مع كل شيء تقني حتى نتمكن من التركيز على عملنا.",
        author: "جنيفر سميث",
        role: "صاحبة متجر",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      {
        quote: "قوالب احترافية تبدو وكأننا استأجرنا مصمماً مكلفاً. أفضل قرار لشركتنا الناشئة.",
        author: "ديفيد كومار",
        role: "مؤسس",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        quote: "معرفتي بأنني يمكنني نقل موقعي إلى خادمي الخاص لاحقاً أعطتني راحة بال كاملة. بدون قيود بائع.",
        author: "ماريا جارسيا",
        role: "مستشار",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      },
    ],
  },
} as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = useSiteLanguage();
  const pathname = usePathname();
  const isArabic = language === "ar";
  const copy = AUTH_LAYOUT_COPY[language];
  const tabs = AUTH_TABS[language];
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const isLoginPage = pathname === "/auth/login" || pathname === "/auth/signin";
  const isSignupPage = pathname === "/auth/signup" || pathname === "/auth/register";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % copy.testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [copy.testimonials.length]);

  return (
    <div className="min-h-screen flex" dir={isArabic ? "rtl" : "ltr"}>
      {/* Left Side - Rich Product Content */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-background via-secondary/10 to-background border-r border-border/50 flex-col relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        
        <div className="relative z-10 flex flex-col h-full p-8 xl:p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-lg shadow-accent/20">
              <span className="text-sm font-bold text-accent-foreground">U</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Univert</span>
          </Link>

          {/* Main Content */}
          <div className={cn("flex-1 flex flex-col justify-center max-w-xl py-4", isArabic ? "text-right" : "text-left")}>
            {/* Heading */}
            <div className="space-y-2.5 mb-6">
              <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-[1.15]">
                {copy.heading}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                {copy.description}
              </p>
            </div>

            {/* Unified Stats Row */}
            <div className="p-3.5 rounded-xl bg-card/30 border border-border/40 mb-5">
              <div className={cn("grid grid-cols-4 gap-3", isArabic && "direction-rtl")}>
                <div className="text-center">
                  <div className="text-lg xl:text-xl font-bold text-accent">{copy.platformStats.deployments}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{copy.platformStats.deploymentsLabel}</div>
                </div>
                <div className="text-center border-x border-border/30">
                  <div className="text-lg xl:text-xl font-bold text-accent">{copy.platformStats.uptime}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{copy.platformStats.uptimeLabel}</div>
                </div>
                <div className="text-center border-r border-border/30">
                  <div className="text-lg xl:text-xl font-bold text-accent">{copy.platformStats.countries}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{copy.platformStats.countriesLabel}</div>
                </div>
                <div className={cn("flex items-center justify-center gap-2", isArabic && "flex-row-reverse")}>
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  </div>
                  <div className={cn("", isArabic ? "text-right" : "text-left")}>
                    <p className="text-xs font-medium text-foreground">{copy.liveActivity.deploysNow}</p>
                    <p className="text-[10px] text-muted-foreground">{copy.liveActivity.timeLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-2 mb-5">
              {copy.features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: isArabic ? 15 : -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 + 0.15 }}
                    className={cn(
                      "flex items-center gap-3",
                      isArabic && "flex-row-reverse"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <IconComponent className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm text-foreground/80">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Mini Dashboard Preview */}
            <div className="p-3 rounded-xl bg-card/25 border border-border/30 overflow-hidden">
              {/* Window chrome */}
              <div className={cn("flex items-center justify-between mb-3", isArabic && "flex-row-reverse")}>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400/50" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400/50" />
                </div>
                <span className="text-[9px] font-medium text-muted-foreground/60 tracking-wide">
                  app.univert.pro/dashboard
                </span>
              </div>
              
              {/* Dashboard content */}
              <div className="space-y-2.5">
                {/* Mini stats row */}
                <div className="flex gap-2">
                  <div className="flex-1 p-2 rounded-md bg-secondary/30">
                    <div className="text-[9px] text-muted-foreground/60 mb-0.5">{isArabic ? "الطلبات" : "Requests"}</div>
                    <div className="text-xs font-semibold text-foreground">1.2M</div>
                  </div>
                  <div className="flex-1 p-2 rounded-md bg-secondary/30">
                    <div className="text-[9px] text-muted-foreground/60 mb-0.5">{isArabic ? "زمن الاستجابة" : "Response"}</div>
                    <div className="text-xs font-semibold text-emerald-400">42ms</div>
                  </div>
                  <div className="flex-1 p-2 rounded-md bg-secondary/30">
                    <div className="text-[9px] text-muted-foreground/60 mb-0.5">{isArabic ? "الأخطاء" : "Errors"}</div>
                    <div className="text-xs font-semibold text-foreground">0.01%</div>
                  </div>
                </div>
                
                {/* Chart area */}
                <div className="h-12 flex items-end gap-1 px-1">
                  {[40, 65, 45, 80, 55, 70, 60, 85, 50, 75].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05 + 0.2, duration: 0.4, ease: "easeOut" }}
                      className="flex-1 bg-gradient-to-t from-accent/50 to-accent/20 rounded-t-sm"
                    />
                  ))}
                </div>
              </div>
              
              {/* Testimonial - Integrated at bottom */}
              <div className={cn("mt-3 pt-3 border-t border-border/20 flex items-center gap-2.5", isArabic && "flex-row-reverse")}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex items-center gap-2.5 flex-1 min-w-0", isArabic && "flex-row-reverse")}
                  >
                    <Image
                      src={copy.testimonials[currentTestimonial].avatar}
                      alt={copy.testimonials[currentTestimonial].author}
                      width={28}
                      height={28}
                      className="rounded-full shrink-0"
                    />
                    <div className={cn("flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0", isArabic && "flex-row-reverse")}>
                      <span className="font-medium text-foreground truncate">{copy.testimonials[currentTestimonial].author}</span>
                      <span className="text-muted-foreground/40 shrink-0">·</span>
                      <span className="truncate">{copy.testimonials[currentTestimonial].role}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className={cn("flex gap-0.5 shrink-0", isArabic && "flex-row-reverse")}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-accent text-accent" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={cn(
            "mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground",
            isArabic && "flex-row-reverse"
          )}>
            <p>{copy.rights}</p>
            <div className={cn("flex items-center gap-2", isArabic && "flex-row-reverse")}>
              <div className="flex -space-x-1.5">
                {[
                  "https://randomuser.me/api/portraits/men/22.jpg",
                  "https://randomuser.me/api/portraits/women/28.jpg",
                  "https://randomuser.me/api/portraits/men/45.jpg",
                ].map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt={`User ${i + 1}`}
                    width={20}
                    height={20}
                    className="rounded-full border border-background"
                  />
                ))}
              </div>
              <span>{copy.trustedBy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative bg-background">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/3 via-transparent to-transparent" />
        
        {/* Language Switcher */}
        <div
          className={cn(
            "absolute top-6 flex items-center gap-2 z-20",
            isArabic ? "left-6 md:left-10" : "right-6 md:right-10"
          )}
        >
          <LanguageSwitcher withTheme />
        </div>

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-lg shadow-accent/20">
              <span className="text-sm font-bold text-accent-foreground">U</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Univert</span>
          </Link>
          
          {/* Auth Tabs */}
          {(isLoginPage || isSignupPage) && (
            <div className="mb-6">
              <div className="flex p-1 bg-secondary/30 rounded-lg border border-border/40">
                <Link
                  href="/auth/login"
                  className={cn(
                    "flex-1 py-2.5 px-4 text-sm font-medium rounded-md text-center transition-all duration-200",
                    isLoginPage 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tabs.signIn}
                </Link>
                <Link
                  href="/auth/signup"
                  className={cn(
                    "flex-1 py-2.5 px-4 text-sm font-medium rounded-md text-center transition-all duration-200",
                    isSignupPage 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tabs.createAccount}
                </Link>
              </div>
            </div>
          )}
          
          {children}
          
          {/* Trust badges - Mobile only */}
          <div className="lg:hidden mt-8 pt-6 border-t border-border/50">
            <div className={cn(
              "flex items-center justify-center gap-6 text-xs text-muted-foreground",
              isArabic && "flex-row-reverse"
            )}>
              <div className={cn("flex items-center gap-1.5", isArabic && "flex-row-reverse")}>
                <Shield className="w-4 h-4 text-accent" />
                <span>{isArabic ? "مُدار" : "Managed"}</span>
              </div>
              <div className={cn("flex items-center gap-1.5", isArabic && "flex-row-reverse")}>
                <Globe className="w-4 h-4 text-accent" />
                <span>{isArabic ? "عالمي" : "Global"}</span>
              </div>
              <div className={cn("flex items-center gap-1.5", isArabic && "flex-row-reverse")}>
                <BarChart3 className="w-4 h-4 text-accent" />
                <span>99.99%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
