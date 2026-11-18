import "server-only";
import { isLocale, type Locale } from "@/i18n/config";
import { getDb } from "./db";
import { deliver, pushReady, removeAdminSubscription, removeSubscription, type PushPayload } from "./push";

/**
 * Push alerts that the server sends on its own:
 *  - to the admin's devices: a new guest's first visit, a new order, a new message;
 *  - to a guest: the restaurant replied to their message.
 * Nothing is sent unless Web Push is configured and the device opted in.
 */

export type AdminEvent =
  | { kind: "guest"; guestLang: string; today: number }
  | { kind: "order"; id: number; table: string; items: number; total: string }
  | { kind: "message"; guest: string; preview: string };

type Text = { title: string; body: string };

const langName = (code: string) => code.toUpperCase();

const ADMIN_TEXT: Record<Locale, (e: AdminEvent) => Text> = {
  uz: (e) =>
    e.kind === "guest"
      ? { title: "Yangi mehmon", body: `Menyuni birinchi marta ochdi (${langName(e.guestLang)}) · bugun ${e.today} ta yangi` }
      : e.kind === "order"
        ? { title: `Yangi buyurtma #${e.id} · Stol ${e.table}`, body: `${e.items} ta taom · ${e.total}` }
        : { title: `Yangi xabar · Mehmon ${e.guest}`, body: e.preview },
  ko: (e) =>
    e.kind === "guest"
      ? { title: "새 손님", body: `처음으로 메뉴를 열었습니다 (${langName(e.guestLang)}) · 오늘 새 손님 ${e.today}명` }
      : e.kind === "order"
        ? { title: `새 주문 #${e.id} · 테이블 ${e.table}`, body: `${e.items}개 · ${e.total}` }
        : { title: `새 메시지 · 고객 ${e.guest}`, body: e.preview },
  ru: (e) =>
    e.kind === "guest"
      ? { title: "Новый гость", body: `Впервые открыл меню (${langName(e.guestLang)}) · сегодня новых: ${e.today}` }
      : e.kind === "order"
        ? { title: `Новый заказ #${e.id} · стол ${e.table}`, body: `Позиций: ${e.items} · ${e.total}` }
        : { title: `Новое сообщение · гость ${e.guest}`, body: e.preview },
  en: (e) =>
    e.kind === "guest"
      ? { title: "New guest", body: `Opened the menu for the first time (${langName(e.guestLang)}) · ${e.today} new today` }
      : e.kind === "order"
        ? { title: `New order #${e.id} · Table ${e.table}`, body: `${e.items} item(s) · ${e.total}` }
        : { title: `New message · Guest ${e.guest}`, body: e.preview },
};

const REPLY_TITLE: Record<Locale, string> = {
  uz: "FIRDAVS RESTAURANT javob berdi",
  ko: "FIRDAVS RESTAURANT의 답장",
  ru: "Ответ от FIRDAVS RESTAURANT",
  en: "FIRDAVS RESTAURANT replied",
};

const preview = (text: string) => (text.length > 120 ? `${text.slice(0, 117)}…` : text);

/** Alerts every admin device. Errors are logged, never thrown (alerts must not break requests). */
export async function notifyAdmins(event: AdminEvent): Promise<void> {
  if (!pushReady()) return;
  try {
    const rows = getDb()
      .prepare(`SELECT endpoint, p256dh, auth, lang FROM admin_push_subscriptions`)
      .all() as { endpoint: string; p256dh: string; auth: string; lang: string }[];
    if (rows.length === 0) return;
    const tag = event.kind === "guest" ? "new-guest" : event.kind === "order" ? `order-${event.id}` : `chat-${event.guest}`;
    const targets = rows.map((row) => {
      const lang: Locale = isLocale(row.lang) ? row.lang : "en";
      const text = ADMIN_TEXT[lang](event.kind === "message" ? { ...event, preview: preview(event.preview) } : event);
      const payload: PushPayload = { ...text, url: `/${lang}/admin`, tag, renotify: event.kind !== "guest" };
      return { target: row, payload };
    });
    await deliver(targets, removeAdminSubscription);
  } catch (error) {
    console.error("[notify] admin alert failed:", error);
  }
}

/** Tells a guest the restaurant replied (only devices they linked to the conversation). */
export async function notifyGuestReply(thread: string, lang: string, reply: string): Promise<void> {
  if (!pushReady()) return;
  try {
    const rows = getDb()
      .prepare(
        `SELECT s.endpoint, s.p256dh, s.auth, s.lang FROM chat_push c
           JOIN push_subscriptions s ON s.endpoint = c.endpoint WHERE c.thread = ?`,
      )
      .all(thread) as { endpoint: string; p256dh: string; auth: string; lang: string }[];
    if (rows.length === 0) return;
    const targets = rows.map((row) => {
      const l: Locale = isLocale(row.lang) ? row.lang : isLocale(lang) ? lang : "en";
      return {
        target: row,
        payload: { title: REPLY_TITLE[l], body: preview(reply), url: `/${l}/info#chat`, tag: "chat-reply", renotify: true },
      };
    });
    await deliver(targets, removeSubscription);
  } catch (error) {
    console.error("[notify] reply alert failed:", error);
  }
}

/** Guests seen for the first time today (Korean time) — for the "new guest" alert. */
export function newGuestsToday(): number {
  const KST = 9 * 3_600_000;
  const startOfDay = Math.floor((Date.now() + KST) / 86_400_000) * 86_400_000 - KST;
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM (SELECT visitor, MIN(started_at) AS first FROM visits GROUP BY visitor) WHERE first >= ?`,
    )
    .get(startOfDay) as { n: number };
  return row.n;
}
