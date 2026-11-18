export const locales = ["uz", "ko", "ru", "en"] as const;

export type Locale = (typeof locales)[number];

/** Used when neither the saved choice nor the browser language matches. */
export const defaultLocale: Locale = "en";

/** Cookie that remembers the guest's language so the next visit renders in it. */
export const LOCALE_COOKIE = "menu-lang";

/** Short labels for the language picker. */
export const localeLabels: Record<Locale, string> = {
  uz: "UZ",
  ko: "한국어",
  ru: "RU",
  en: "EN",
};

/** Native names (picker menu + accessible labels). */
export const localeNames: Record<Locale, string> = {
  uz: "Oʻzbekcha",
  ko: "한국어",
  ru: "Русский",
  en: "English",
};

/** Every translatable string exists in all four languages (enforced by TypeScript). */
export type Localized<T = string> = Record<Locale, T>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
