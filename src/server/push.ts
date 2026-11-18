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
  getDb().prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?`).run(endpoint);
}

export type PushMessage = { title: string; body: string; url: string; lang: Locale | null };

/** Sends to everyone who opted in (optionally one language). Expired subscriptions are removed. */
export async function sendToSubscribers(message: PushMessage) {
  const keys = vapid();
  if (!keys) throw new Error("Web Push is not configured");
  webpush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);

  const db = getDb();
  const rows = (
    message.lang
      ? db.prepare(`SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE lang = ?`).all(message.lang)
      : db.prepare(`SELECT endpoint, p256dh, auth FROM push_subscriptions`).all()
  ) as { endpoint: string; p256dh: string; auth: string }[];

  const payload = JSON.stringify({ title: message.title, body: message.body, url: message.url });
  let sent = 0;
  let failed = 0;
  let removed = 0;
  for (let i = 0; i < rows.length; i += 25) {
    const batch = rows.slice(i, i + 25);
    const results = await Promise.allSettled(
      batch.map((row) =>
        webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, payload, {
          TTL: 24 * 60 * 60,
        }),
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
        removeSubscription(batch[j].endpoint); // the browser unsubscribed or the subscription expired
        removed += 1;
      }
    });
  }
  return { total: rows.length, sent, failed, removed };
}
