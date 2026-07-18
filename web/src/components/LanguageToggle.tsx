import { useLocale, useMessages } from "../i18n/LocaleProvider";
import { LOCALES, type Locale } from "../i18n/messages";

// Language switcher, styled to match AppearanceToggle (same .appearance-toggle shell so it
// sits naturally beside the day/dusk/night control in the Me space). Switching is instant:
// the choice is persisted (localStorage via LocaleProvider) and every catalog consumer
// re-renders in the new language with no page reload.
const NATIVE_NAME: Record<Locale, "zh" | "en"> = {
  "zh-CN": "zh",
  "en-SG": "en",
};

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const t = useMessages();
  return (
    <div className="appearance-toggle language-toggle" role="group" aria-label={t.language.label}>
      <span className="appearance-label">{t.language.label}</span>
      <div className="appearance-options">
        {LOCALES.map((value) => (
          <button
            type="button"
            key={value}
            lang={value}
            aria-pressed={locale === value}
            className={locale === value ? "active" : ""}
            onClick={() => setLocale(value)}
          >
            {t.language[NATIVE_NAME[value]]}
          </button>
        ))}
      </div>
    </div>
  );
}
