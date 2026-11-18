import type { Locale } from "@/i18n/config";

/**
 * Date and relative-time labels. Browsers ship little or no Uzbek locale data
 * (Chrome prints "-3 s" or "M11 18"), so Uzbek is formatted here by hand;
 * the other languages use the browser's Intl data.
 */

const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
/** Indexed like Date#getUTCDay (Sunday first). */
const UZ_WEEKDAYS = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
const UZ_UNITS = { second: "soniya", minute: "daqiqa", hour: "soat", day: "kun" } as const;

/** "2026-11-18" (a calendar date) → "11/18" (short) or "Wed, November 18" (long), per language. */
export function formatDay(date: string, lang: Locale, style: "short" | "long"): string {
  const [y, m, d] = date.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d);
  if (lang === "uz") {
    if (style === "short") return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
    return `${d}-${UZ_MONTHS[m - 1]}, ${UZ_WEEKDAYS[new Date(utc).getUTCDay()]}`;
  }
  return new Intl.DateTimeFormat(lang, {
    timeZone: "UTC",
    ...(style === "short" ? { month: "numeric", day: "numeric" } : { weekday: "short", month: "long", day: "numeric" }),
  }).format(utc);
}

const relative = new Map<Locale, Intl.RelativeTimeFormat>();

/** Milliseconds elapsed → "5 minutes ago" / "5 daqiqa oldin" / "5분 전" / "5 минут назад". */
export function formatAgo(elapsedMs: number, lang: Locale): string {
  let value = Math.max(0, Math.round(elapsedMs / 1000));
  let unit: keyof typeof UZ_UNITS = "second";
  if (value >= 60) {
    value = Math.round(value / 60);
    unit = "minute";
    if (value >= 60) {
      value = Math.round(value / 60);
      unit = "hour";
      if (value >= 24) {
        value = Math.round(value / 24);
        unit = "day";
      }
    }
  }
  if (lang === "uz") return value === 0 ? "hozir" : `${value} ${UZ_UNITS[unit]} oldin`;
  let rtf = relative.get(lang);
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    relative.set(lang, rtf);
  }
  return rtf.format(-value, unit);
}
