"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { useSiteLanguage } from "@/hooks/use-site-language";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Shield, 
  Globe, 
  BarChart3,
  CheckCircle,
  Star,
  TrendingUp,
  Users
} from "lucide-react";

const AUTH_LAYOUT_COPY = {
  en: {
    heading: "Launch premium websites in minutes",
    description:
      "Join thousands of businesses using Ovmon to deploy and manage their online presence with enterprise-grade infrastructure.",
    features: [
      { text: "Instant provisioning in under 2 minutes", icon: Zap },
      { text: "No lock-in - export your data anytime", icon: Shield },
      { text: "Enterprise security by default", icon: Globe },
    ],
    rights: "2026 Ovmon. All rights reserved.",
    trustedBy: "Trusted by 50,000+ developers",
    platformStats: {
      deployments: "2.8M+",
      deploymentsLabel: "Deployments",
      uptime: "99.99%",
      uptimeLabel: "Uptime SLA",
      countries: "150+",
      countriesLabel: "Edge Locations",
    },
    testimonials: [
      {
        quote: "Ovmon reduced our deployment time from hours to seconds. The developer experience is unmatched.",
        author: "Sarah Chen",
        role: "CTO at TechFlow",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      {
        quote: "Finally, a platform that just works. Our team shipped 3x faster after switching to Ovmon.",
        author: "Marcus Johnson",
        role: "Engineering Lead at Scale",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        quote: "Enterprise-grade security without the enterprise complexity. Exactly what we needed.",
        author: "Emily Rodriguez",
        role: "Founder at StartupX",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      },
    ],
  },
  ar: {
    heading: "أطلق مواقع احترافية خلال دقائق",
    description:
      "انضم إلى آلاف الشركات التي تستخدم Ovmon لنشر وإدارة حضورها الرقمي ببنية تحتية بمعايير المؤسسات.",
    features: [
      { text: "تجهيز الموقع خلال أقل من دقيقتين", icon: Zap },
      { text: "بدون قيود - يمكنك تصدير بياناتك في أي وقت", icon: Shield },
      { text: "أمان مؤسسي بشكل افتراضي", icon: Globe },
    ],
    rights: "2026 Ovmon. جميع الحقوق محفوظة.",
    trustedBy: "موثوق من قبل أكثر من 50,000 مطور",
    platformStats: {
      deployments: "+2.8M",
      deploymentsLabel: "عملية نشر",
      uptime: "99.99%",
      uptimeLabel: "وقت التشغيل",
      countries: "+150",
      countriesLabel: "موقع حافة",
    },
    testimonials: [
      {
        quote: "قلّلت Ovmon وقت النشر من ساعات إلى ثوانٍ. تجربة المطور لا مثيل لها.",
        author: "سارة أحمد",
        role: "مدير تقني في TechFlow",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      {
        quote: "أخيرًا، منصة تعمل بسلاسة. فريقنا أصبح أسرع 3 مرات بعد التحويل إلى Ovmon.",
        author: "أحمد محمد",
        role: "قائد الهندسة في Scale",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        quote: "أمان بمستوى المؤسسات بدون التعقيد. بالضبط ما كنا نحتاجه.",
        author: "نور الدين",
        role: "مؤسس StartupX",
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
  const isArabic = language === "ar";
  const copy = AUTH_LAYOUT_COPY[language];
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % copy.testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [copy.testimonials.length]);

  return (
    <div className="min-h-screen flex" dir={isArabic ? "rtl" : "ltr"}>
      {/* Left Side - Rich Product Content */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-background via-secondary/20 to-background border-r border-border/50 flex-col relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-lg shadow-accent/20">
              <span className="text-sm font-bold text-accent-foreground">O</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Ovmon</span>
          </Link>

          {/* Main Content */}
          <div className={cn("flex-1 flex flex-col justify-center max-w-lg", isArabic ? "text-right" : "text-left")}>
            {/* Heading */}
            <div className="space-y-4 mb-10">
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.1]">
                {copy.heading}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {copy.description}
              </p>
            </div>

            {/* Platform Stats */}
            <div className={cn(
              "grid grid-cols-3 gap-4 mb-10 p-5 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm",
            )}>
              <div className={cn("text-center", isArabic && "text-center")}>
                <div className="text-2xl xl:text-3xl font-bold text-accent">{copy.platformStats.deployments}</div>
                <div className="text-xs text-muted-foreground mt-1">{copy.platformStats.deploymentsLabel}</div>
              </div>
              <div className={cn("text-center border-x border-border/50", isArabic && "text-center")}>
                <div className="text-2xl xl:text-3xl font-bold text-accent">{copy.platformStats.uptime}</div>
                <div className="text-xs text-muted-foreground mt-1">{copy.platformStats.uptimeLabel}</div>
              </div>
              <div className={cn("text-center", isArabic && "text-center")}>
                <div className="text-2xl xl:text-3xl font-bold text-accent">{copy.platformStats.countries}</div>
                <div className="text-xs text-muted-foreground mt-1">{copy.platformStats.countriesLabel}</div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-10">
              {copy.features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={cn(
                      "flex items-center gap-3",
                      isArabic && "flex-row-reverse"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-sm text-foreground/80">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Testimonial Carousel */}
            <div className="relative h-[140px] mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <div className="p-5 rounded-2xl bg-card/40 border border-border/50 backdrop-blur-sm h-full flex flex-col justify-between">
                    <p className={cn(
                      "text-sm text-foreground/80 leading-relaxed italic",
                      isArabic ? "text-right" : "text-left"
                    )}>
                      &ldquo;{copy.testimonials[currentTestimonial].quote}&rdquo;
                    </p>
                    <div className={cn(
                      "flex items-center gap-3 mt-4",
                      isArabic && "flex-row-reverse"
                    )}>
                      <Image
                        src={copy.testimonials[currentTestimonial].avatar}
                        alt={copy.testimonials[currentTestimonial].author}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-accent/20"
                      />
                      <div className={isArabic ? "text-right" : "text-left"}>
                        <p className="text-sm font-medium text-foreground">
                          {copy.testimonials[currentTestimonial].author}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {copy.testimonials[currentTestimonial].role}
                        </p>
                      </div>
                      <div className={cn("flex gap-0.5", isArabic ? "mr-auto" : "ml-auto")}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Carousel Indicators */}
              <div className={cn(
                "absolute -bottom-6 flex gap-1.5",
                isArabic ? "right-0" : "left-0"
              )}>
                {copy.testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      currentTestimonial === index 
                        ? "w-6 bg-accent" 
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={cn(
            "mt-auto pt-8 flex items-center justify-between text-sm text-muted-foreground",
            isArabic && "flex-row-reverse"
          )}>
            <p>{copy.rights}</p>
            <div className={cn("flex items-center gap-2", isArabic && "flex-row-reverse")}>
              <div className="flex -space-x-2">
                {[
                  "https://randomuser.me/api/portraits/men/22.jpg",
                  "https://randomuser.me/api/portraits/women/28.jpg",
                  "https://randomuser.me/api/portraits/men/45.jpg",
                ].map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt={`User ${i + 1}`}
                    width={24}
                    height={24}
                    className="rounded-full border-2 border-background"
                  />
                ))}
              </div>
              <span className="text-xs">{copy.trustedBy}</span>
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
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-lg shadow-accent/20">
              <span className="text-sm font-bold text-accent-foreground">O</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Ovmon</span>
          </Link>
          
          {children}
          
          {/* Trust badges - Mobile only */}
          <div className="lg:hidden mt-8 pt-6 border-t border-border/50">
            <div className={cn(
              "flex items-center justify-center gap-6 text-xs text-muted-foreground",
              isArabic && "flex-row-reverse"
            )}>
              <div className={cn("flex items-center gap-1.5", isArabic && "flex-row-reverse")}>
                <Shield className="w-4 h-4 text-accent" />
                <span>SOC2</span>
              </div>
              <div className={cn("flex items-center gap-1.5", isArabic && "flex-row-reverse")}>
                <Globe className="w-4 h-4 text-accent" />
                <span>150+ Edges</span>
              </div>
              <div className={cn("flex items-center gap-1.5", isArabic && "flex-row-reverse")}>
                <BarChart3 className="w-4 h-4 text-accent" />
                <span>99.99% SLA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
