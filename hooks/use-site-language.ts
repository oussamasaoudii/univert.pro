"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_CHANGE_EVENT,
  LANGUAGE_COOKIE_NAME,
  getStoredLanguageClient,
  normalizeLanguage,
  type SiteLanguage,
} from "@/lib/i18n/language";

// Store for language state with external sync
let currentLanguage: SiteLanguage = DEFAULT_LANGUAGE;
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): SiteLanguage {
  return currentLanguage;
}

function getServerSnapshot(): SiteLanguage {
  return DEFAULT_LANGUAGE;
}

function updateLanguage(lang: SiteLanguage) {
  if (currentLanguage !== lang) {
    currentLanguage = lang;
    listeners.forEach((listener) => listener());
  }
}

// Initialize on client side
if (typeof window !== "undefined") {
  // Initialize from storage/cookies on load
  currentLanguage = getStoredLanguageClient();
  
  // Listen for storage events (cross-tab sync)
  window.addEventListener("storage", (event) => {
    if (event.key === LANGUAGE_COOKIE_NAME) {
      updateLanguage(getStoredLanguageClient());
    }
  });
  
  // Listen for custom language change events
  window.addEventListener(LANGUAGE_CHANGE_EVENT, (event: Event) => {
    const detail = (event as CustomEvent<SiteLanguage>).detail;
    if (detail) {
      updateLanguage(normalizeLanguage(detail));
    } else {
      updateLanguage(getStoredLanguageClient());
    }
  });
}

export function useSiteLanguage(): SiteLanguage {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  // Ensure we sync on first client render
  useEffect(() => {
    const storedLang = getStoredLanguageClient();
    if (storedLang !== currentLanguage) {
      updateLanguage(storedLang);
    }
  }, []);

  return language;
}
