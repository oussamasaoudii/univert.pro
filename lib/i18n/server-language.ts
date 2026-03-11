import { cookies, headers } from "next/headers";
import {
  LANGUAGE_COOKIE_NAME,
  normalizeLanguage,
  parseLanguageFromAcceptLanguage,
  type SiteLanguage,
} from "./language";

export async function getServerLanguage(): Promise<SiteLanguage> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const cookieValue = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;

  if (cookieValue) {
    return normalizeLanguage(cookieValue);
  }

  return parseLanguageFromAcceptLanguage(headerStore.get("accept-language"));
}
