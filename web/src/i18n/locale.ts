// Locale detection, persistence and <html lang> application for the typed message
// catalog (see messages.ts). Deliberately mirrors web/src/theme.ts's storage pattern:
// a single localStorage key, every access wrapped in try/catch so a storage-disabled
// context (private mode, SSR-less test env without a real Storage) degrades silently to
// the default rather than throwing. These are pure/DOM-only functions with no React
// dependency so they can be unit-tested in isolation, exactly like theme.ts.

import { DEFAULT_LOCALE, LOCALES, type Locale } from "./messages";

const LOCALE_KEY = "ic-locale";

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** The user's explicitly chosen locale, or null if they have not chosen one. */
export function getStoredLocale(): Locale | null {
  try {
    const v = localStorage.getItem(LOCALE_KEY);
    return isLocale(v) ? v : null;
  } catch {
    return null;
  }
}

/** Persist an explicit locale choice; pass null to clear it (fall back to detection). */
export function setStoredLocale(locale: Locale | null): void {
  try {
    if (locale) localStorage.setItem(LOCALE_KEY, locale);
    else localStorage.removeItem(LOCALE_KEY);
  } catch {
    /* storage unavailable: silently degrade, matching theme.ts */
  }
}

/**
 * Best-effort locale from the browser's language preferences. Any Chinese variant
 * (zh, zh-CN, zh-Hans, zh-TW, ...) maps to zh-CN; everything else maps to en-SG, which
 * matches the product's English-first Singapore launch intent (a non-Chinese visitor
 * should land in English, not the zh-CN default). Returns null when no navigator
 * languages are available so the caller can apply DEFAULT_LOCALE deterministically.
 */
export function detectLocale(
  languages: readonly string[] = typeof navigator !== "undefined"
    ? navigator.languages ?? (navigator.language ? [navigator.language] : [])
    : []
): Locale | null {
  for (const raw of languages) {
    const lang = raw.toLowerCase();
    if (lang.startsWith("zh")) return "zh-CN";
    if (lang.startsWith("en")) return "en-SG";
  }
  return null;
}

/** Stored choice wins; otherwise browser detection; otherwise the default locale. */
export function resolveInitialLocale(): Locale {
  return getStoredLocale() ?? detectLocale() ?? DEFAULT_LOCALE;
}

/** Reflect the active locale on <html lang> for a11y / SEO / correct hyphenation. */
export function applyDocumentLocale(
  locale: Locale,
  root: HTMLElement = document.documentElement
): void {
  root.lang = locale;
}
