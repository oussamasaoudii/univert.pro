"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_CHANGE_EVENT,
  LANGUAGE_COOKIE_NAME,
  getStoredLanguageClient,
  normalizeLanguage,
  type SiteLanguage,
} from "@/lib/i18n/language";

export function useSiteLanguage(): SiteLanguage {
  const [language, setLanguage] = useState<SiteLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getStoredLanguageClient());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_COOKIE_NAME) {
        syncLanguage();
      }
    };

    const handleLanguageChange = (event: Event) => {
      const detail = (event as CustomEvent<SiteLanguage>).detail;
      if (detail) {
        setLanguage(normalizeLanguage(detail));
        return;
      }
      syncLanguage();
    };

    syncLanguage();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener);
    };
  }, []);

  return language;
}
