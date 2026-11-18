import type { Locale } from "@/i18n/config";

/**
 * Web Push in the browser. Permission is only ever requested from a tap on
 * the "Notifications" switch; nothing is subscribed without it.
 */

export type PushStatus =
  | "unsupported" // browser has no Web Push
  | "install" // iPhone/iPad: works only after "Add to Home Screen"
  | "unavailable" // server has no push keys configured
  | "denied" // the guest blocked notifications
  | "off"
  | "on";

function supported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function isAppleMobile(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function keyToBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function sameKey(subscription: PushSubscription, key: string): boolean {
  const current = subscription.options.applicationServerKey;
  if (!current) return false;
  const a = new Uint8Array(current);
  const b = keyToBytes(key);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

async function fetchKey(): Promise<string | null> {
  try {
    const response = await fetch("/api/push/key", { cache: "no-store" });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    const key = (data as { publicKey?: unknown }).publicKey;
    return typeof key === "string" ? key : null;
  } catch {
    return null;
  }
}

export async function readPushStatus(): Promise<{ status: PushStatus; key: string | null }> {
  if (!supported()) return { status: isAppleMobile() && !isStandalone() ? "install" : "unsupported", key: null };
  const key = await fetchKey();
  if (!key) return { status: "unavailable", key: null };
  if (Notification.permission === "denied") return { status: "denied", key };
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  const on = subscription && Notification.permission === "granted" && sameKey(subscription, key);
  return { status: on ? "on" : "off", key };
}

/** Must be called from a click: it asks for permission first. */
export async function enablePush(key: string, lang: Locale): Promise<PushStatus> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";

  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (subscription && !sameKey(subscription, key)) {
    await subscription.unsubscribe(); // server keys were rotated
    subscription = null;
  }
  subscription ??= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: keyToBytes(key),
  });

  const response = await fetch("/api/push/subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON(), lang }),
  });
  if (!response.ok) {
    await subscription.unsubscribe().catch(() => {});
    throw new Error(`subscribe failed: ${response.status}`);
  }
  return "on";
}

/** Keeps the server's copy of this device's language current (notifications can target a language). */
export async function updatePushLanguage(lang: Locale): Promise<void> {
  if (!supported() || Notification.permission !== "granted") return;
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await fetch("/api/push/subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON(), lang }),
  });
}

export async function disablePush(): Promise<PushStatus> {
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await fetch("/api/push/subscription", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => {});
    await subscription.unsubscribe();
  }
  return "off";
}
