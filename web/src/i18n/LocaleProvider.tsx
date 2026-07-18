import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { messagesFor, type Locale, type Messages } from "./messages";
import { applyDocumentLocale, resolveInitialLocale, setStoredLocale } from "./locale";

// React binding for the typed message catalog. A single provider near the app root gives
// every space access to `useMessages()` (the resolved catalog for the active locale) and
// `useLocale()` (the active locale + a setter that persists the choice and updates
// <html lang>). Components consume the catalog, so they all re-render together when the
// user switches language -- no page reload, and no per-component locale plumbing.

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  // Test seam: force an initial locale instead of detecting from storage/navigator.
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? resolveInitialLocale());

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setStoredLocale(next);
    setLocaleState(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, messages: messagesFor(locale) }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale/useMessages must be used within a <LocaleProvider>");
  }
  return ctx;
}

/** The active locale plus a persisting setter. */
export function useLocale(): { locale: Locale; setLocale: (locale: Locale) => void } {
  const { locale, setLocale } = useLocaleContext();
  return { locale, setLocale };
}

/** The resolved message catalog for the active locale. */
export function useMessages(): Messages {
  return useLocaleContext().messages;
}
