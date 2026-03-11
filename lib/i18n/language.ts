export const LANGUAGE_COOKIE_NAME = "site_lang";
export const LANGUAGE_CHANGE_EVENT = "site-language-changed";

export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;

export type SiteLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SiteLanguage = "en";

function parseKnownLanguage(value: string | null | undefined): SiteLanguage | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "ar" || normalized.startsWith("ar-") || normalized.startsWith("ar_")) {
    return "ar";
  }

  if (normalized === "en" || normalized.startsWith("en-") || normalized.startsWith("en_")) {
    return "en";
  }

  return null;
}

export function normalizeLanguage(value: string | null | undefined): SiteLanguage {
  return parseKnownLanguage(value) ?? DEFAULT_LANGUAGE;
}

export function extractLanguageFromCookie(cookieHeader: string | null | undefined): SiteLanguage | null {
  if (!cookieHeader) {
    return null;
  }

  const cookieValue = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LANGUAGE_COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  return parseKnownLanguage(cookieValue);
}

export function parseLanguageFromCookie(cookieHeader: string | null | undefined): SiteLanguage {
  return extractLanguageFromCookie(cookieHeader) ?? DEFAULT_LANGUAGE;
}

function extractLanguageFromList(values: readonly (string | null | undefined)[]): SiteLanguage | null {
  for (const value of values) {
    const language = parseKnownLanguage(value);
    if (language) {
      return language;
    }
  }

  return null;
}

export function parseLanguageFromAcceptLanguage(
  acceptLanguage: string | null | undefined,
): SiteLanguage {
  if (!acceptLanguage) {
    return DEFAULT_LANGUAGE;
  }

  const tags = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter(Boolean);

  return extractLanguageFromList(tags) ?? DEFAULT_LANGUAGE;
}

export function getStoredLanguageClient(): SiteLanguage {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const fromStorage = parseKnownLanguage(window.localStorage.getItem(LANGUAGE_COOKIE_NAME));
  if (fromStorage) {
    return fromStorage;
  }

  const fromCookie = extractLanguageFromCookie(document.cookie);
  if (fromCookie) {
    return fromCookie;
  }

  return (
    extractLanguageFromList([
      ...(navigator.languages || []),
      navigator.language,
      navigator.languages?.[0],
    ]) ?? DEFAULT_LANGUAGE
  );
}

export function persistLanguageClient(language: SiteLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LANGUAGE_COOKIE_NAME, language);
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(
    new CustomEvent<SiteLanguage>(LANGUAGE_CHANGE_EVENT, {
      detail: language,
    }),
  );
}
