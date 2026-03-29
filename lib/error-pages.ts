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
  fr: {
    title: "Page introuvable",
    description: "La page que vous recherchez n'existe pas ou a peut-etre ete deplacee.",
    primaryLabel: "Retour a l'accueil",
    secondaryLabel: "Retour",
    footer: "© 2026 Univert",
  },
  es: {
    title: "Pagina no encontrada",
    description: "La pagina que buscas no existe o puede haber sido movida.",
    primaryLabel: "Volver al inicio",
    secondaryLabel: "Volver",
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
  fr: {
    title: "Une erreur s'est produite",
    description: "Une erreur inattendue s'est produite. Nous nous excusons pour la gene occasionnee.",
    primaryLabel: "Retour a l'accueil",
    secondaryLabel: "Reessayer",
    footer: "© 2026 Univert",
    detailsLabel: "ID de l'erreur",
  },
  es: {
    title: "Algo salio mal",
    description: "Ocurrio un error inesperado. Disculpa las molestias.",
    primaryLabel: "Volver al inicio",
    secondaryLabel: "Intentar de nuevo",
    footer: "© 2026 Univert",
    detailsLabel: "ID del error",
  },
};
