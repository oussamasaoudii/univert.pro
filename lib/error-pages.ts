import type { SiteLanguage } from "@/lib/i18n/language";

interface ErrorPageCopy {
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  footer: string;
  detailsLabel?: string;
}

export const NOT_FOUND_PAGE_COPY: Record<SiteLanguage, ErrorPageCopy> = {
  en: {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or may have been moved.",
    primaryLabel: "Return to Home",
    secondaryLabel: "Go Back",
    footer: "© 2026 Univert",
  },
  ar: {
    title: "الصفحة غير موجودة",
    description: "الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.",
    primaryLabel: "العودة للرئيسية",
    secondaryLabel: "رجوع",
    footer: "© 2026 Univert",
  },
};

export const GENERIC_ERROR_PAGE_COPY: Record<SiteLanguage, ErrorPageCopy> = {
  en: {
    title: "Something Went Wrong",
    description: "An unexpected error occurred. We apologize for the inconvenience.",
    primaryLabel: "Return to Home",
    secondaryLabel: "Try Again",
    footer: "© 2026 Univert",
    detailsLabel: "Error ID",
  },
  ar: {
    title: "حدث خطأ غير متوقع",
    description: "وقع خطأ غير متوقع. نعتذر عن هذا الإزعاج.",
    primaryLabel: "العودة للرئيسية",
    secondaryLabel: "حاول مرة أخرى",
    footer: "© 2026 Univert",
    detailsLabel: "معرّف الخطأ",
  },
};
