import "server-only";
import webpush from "web-push";
import type { Locale } from "@/i18n/config";
import { getDb } from "./db";

/** Only real browser push services may be used as endpoints (prevents SSRF). */
const PUSH_HOSTS = [
  /(^|\.)fcm\.googleapis\.com$/,
  /(^|\.)push\.services\.mozilla\.com$/,
  /(^|\.)push\.apple\.com$/,
  /(^|\.)notify\.windows\.com$/,
];
const B64URL = /^[A-Za-z0-9_-]+$/;

function vapid() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || process.env.SITE_URL;
  return publicKey && privateKey && subject ? { publicKey, privateKey, subject } : null;
}

export function vapidPublicKey(): string | null {
  return vapid()?.publicKey ?? null;
}

export type PushSubscriptionInput = { endpoint: string; keys: { p256dh: string; auth: string } };

/** Validates a browser PushSubscription.toJSON() payload. */
export function parseSubscription(value: unknown): PushSubscriptionInput | null {
  if (!value || typeof value !== "object") return null;
  const { endpoint, keys } = value as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  if (typeof endpoint !== "string" || endpoint.length > 1024) return null;
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !PUSH_HOSTS.some((re) => re.test(url.hostname))) return null;
  const p256dh = keys?.p256dh;
  const auth = keys?.auth;
  if (typeof p256dh !== "string" || !B64URL.test(p256dh) || p256dh.length < 80 || p256dh.length > 100) return null;
  if (typeof auth !== "string" || !B64URL.test(auth) || auth.length < 16 || auth.length > 32) return null;
  return { endpoint, keys: { p256dh, auth } };
}

export function saveSubscription(sub: PushSubscriptionInput, lang: Locale): void {
  getDb()
    .prepare(
      `INSERT INTO push_subscriptions (endpoint, p256dh, auth, lang, created_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, lang = excluded.lang`,
    )
    .run(sub.endpoint, sub.keys.p256dh, sub.keys.auth, lang, Date.now());
}

export function removeSubscription(endpoint: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?`).run(endpoint);
  db.prepare(`DELETE FROM chat_push WHERE endpoint = ?`).run(endpoint);
}

/* ── Admin devices (alerts about new guests, orders and messages) ───────── */

export function saveAdminSubscription(sub: PushSubscriptionInput, lang: Locale): void {
  getDb()
    .prepare(
      `INSERT INTO admin_push_subscriptions (endpoint, p256dh, auth, lang, created_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, lang = excluded.lang`,
    )
    .run(sub.endpoint, sub.keys.p256dh, sub.keys.auth, lang, Date.now());
}

export function removeAdminSubscription(endpoint: string): void {
  getDb().prepare(`DELETE FROM admin_push_subscriptions WHERE endpoint = ?`).run(endpoint);
}

export function adminSubscriberCount(): number {
  return (getDb().prepare(`SELECT COUNT(*) AS n FROM admin_push_subscriptions`).get() as { n: number }).n;
}

/* ── Chat: a guest's subscription linked to their conversation ──────────── */

/** Links an existing guest subscription to a chat thread; false if the endpoint isn't subscribed. */
export function linkChatSubscription(thread: string, endpoint: string): boolean {
  const db = getDb();
  if (!db.prepare(`SELECT 1 FROM push_subscriptions WHERE endpoint = ?`).get(endpoint)) return false;
  db.prepare(`INSERT OR IGNORE INTO chat_push (thread, endpoint) VALUES (?, ?)`).run(thread, endpoint);
  return true;
}

/* ── Sending ───────────────────────────────────────────────────────────── */

type Target = { endpoint: string; p256dh: string; auth: string };
export type PushPayload = { title: string; body: string; url: string; tag?: string; renotify?: boolean };

/**
 * Sends one payload per target (in batches). Subscriptions the push service
 * reports as gone (404/410) are removed with `forget`.
 */
export async function deliver(targets: { target: Target; payload: PushPayload }[], forget: (endpoint: string) => void) {
  const keys = vapid();
  if (!keys) throw new Error("Web Push is not configured");
  webpush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);
  let sent = 0;
  let failed = 0;
  let removed = 0;
  for (let i = 0; i < targets.length; i += 25) {
    const batch = targets.slice(i, i + 25);
    const results = await Promise.allSettled(
      batch.map(({ target, payload }) =>
        webpush.sendNotification(
          { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
          JSON.stringify(payload),
          { TTL: 24 * 60 * 60 },
        ),
      ),
    );
    results.forEach((result, j) => {
      if (result.status === "fulfilled") {
        sent += 1;
        return;
      }
      failed += 1;
      const status = (result.reason as { statusCode?: number } | undefined)?.statusCode;
      if (status === 404 || status === 410) {
        forget(batch[j].target.endpoint); // the browser unsubscribed or the subscription expired
        removed += 1;
      }
    });
  }
  return { total: targets.length, sent, failed, removed };
}

export type PushMessage = { title: string; body: string; url: string; lang: Locale | null };

/** Sends to every guest who opted in (optionally one language). */
export async function sendToSubscribers(message: PushMessage) {
  const db = getDb();
  const rows = (
    message.lang
      ? db.prepare(`SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE lang = ?`).all(message.lang)
      : db.prepare(`SELECT endpoint, p256dh, auth FROM push_subscriptions`).all()
  ) as Target[];
  const payload = { title: message.title, body: message.body, url: message.url };
  return deliver(
    rows.map((target) => ({ target, payload })),
    removeSubscription,
  );
}

export const pushReady = (): boolean => vapid() !== null;
