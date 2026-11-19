import type { Localized } from "@/i18n/config";

/**
 * Restaurant details shown on Home and the Info screen.
 * Anything set to `null` (or an empty list) stays hidden until you fill it in.
 */

export type DayHours = { open: string; close: string } | null; // null = closed that day

export const restaurant = {
  name: "FIRDAVS RESTAURANT",

  /** `ko` is the official address — it's what "Copy address" copies (for maps and taxis). */
  address: {
    ko: "전주시 덕진구 백제대로 608 1층",
    en: "1F, 608 Baekje-daero, Deokjin-gu, Jeonju-si",
    uz: "Jeonju sh., Deokjin-gu, Baekje-daero 608, 1-qavat",
    ru: "г. Чонджу, Токчин-гу, Пэкче-дэро 608, 1-й этаж",
  } satisfies Localized,

  /** Shown to guests. */
  phoneDisplay: "010-3238-2555",
  /** Used for the Call and SMS buttons (international format works from any phone). */
  phoneE164: "+821032382555",
  /**
   * Where table orders go: the guest's own SMS app opens with the order,
   * addressed to this number (010-3238-2555 in international format, so it also
   * works from phones with a foreign SIM card).
   */
  orderPhone: "+821032382555",

  /** Tables are numbered 1…tables; orders for any other number are refused. */
  tables: 14,

  /** Telegram username without "@" (opens https://t.me/<username>). `null` hides the button. */
  telegram: "Firdavs_restaurant1" as string | null,
  /** Instagram usernames without "@" (each opens https://instagram.com/<username>). */
  instagram: ["firdavs_restaurant_1", "firdavs_market"] as string[],
  /**
   * WhatsApp number, digits only in international format (opens https://wa.me/<number>).
   * Uses the restaurant phone; change it if WhatsApp runs on another number, `null` hides the button.
   */
  whatsapp: "821032382555" as string | null,

  /**
   * The map buttons search for this address. For an exact pin, paste the place
   * links from Naver Map / Kakao Map / Google Maps (Share → copy link) below.
   */
  mapQuery: "전주시 덕진구 백제대로 608",
  mapLinks: {
    naver: null as string | null,
    kakao: null as string | null,
    google: null as string | null,
  },

  timeZone: "Asia/Seoul",
  /**
   * Opening hours, Monday → Sunday, 24h "HH:MM" (close earlier than open = after
   * midnight; `null` entry = closed that day). `null` hides the hours and the
   * "Open now" badge. When every day is the same, the Info screen shows one line:
   * "Ish vaqti - har kuni 10:00-23:00gacha".
   */
  hours: Array<DayHours>(7).fill({ open: "10:00", close: "23:00" }) as DayHours[] | null,
  /** e.g. "21:30" — shown under the hours. */
  lastOrder: null as string | null,

  /** Delivery service is available. */
  delivery: true,
  /** Optional: delivery apps to list, e.g. { id: "baemin", label: { uz: "Baemin", ko: "배달의민족", ru: "Baemin", en: "Baemin" } }. */
  deliveryApps: [] as { id: string; label: Localized }[],

  /** Restaurant-wide halal claim (footer). */
  halalClaim: "100% HALAL · NO PORK · NO ALCOHOL",
};

/** Deep links for the contact buttons (each opens the phone's own app). */
export function contactUrls() {
  return {
    call: `tel:${restaurant.phoneE164}`,
    sms: `sms:${restaurant.phoneE164}`,
    telegram: restaurant.telegram ? `https://t.me/${restaurant.telegram}` : null,
    whatsapp: restaurant.whatsapp ? `https://wa.me/${restaurant.whatsapp}` : null,
    instagram: restaurant.instagram.map((user) => ({
      user,
      url: `https://instagram.com/${user}`,
    })),
  };
}

export function mapUrls() {
  const q = encodeURIComponent(restaurant.mapQuery);
  return {
    naver: restaurant.mapLinks.naver ?? `https://map.naver.com/p/search/${q}`,
    kakao: restaurant.mapLinks.kakao ?? `https://map.kakao.com/link/search/${q}`,
    google:
      restaurant.mapLinks.google ?? `https://www.google.com/maps/search/?api=1&query=${q}`,
  };
}
