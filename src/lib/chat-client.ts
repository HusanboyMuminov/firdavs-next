import { useEffect, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import { subscriptionEndpoint } from "./push-client";

/**
 * Guest side of the private chat with the restaurant.
 *
 * The browser creates a random secret key on the first message and keeps it in
 * localStorage; the server only ever stores its hash. Whoever holds the key can
 * read the thread, so it is sent in a header (never in a URL) and never shown.
 */

export type ChatMessage = { id: number; sender: "guest" | "admin"; body: string; createdAt: number };

const STORAGE_KEY = "firdavs:chat";
const KEY_RE = /^[A-Za-z0-9_-]{32,128}$/;
const UNREAD_POLL_MS = 30_000;

let memoryKey: string | null = null; // fallback when storage is blocked (private mode)

function readKey(): string | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && KEY_RE.test(stored)) return stored;
  } catch {
    // storage blocked
  }
  return memoryKey;
}

function createKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const key = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  memoryKey = key;
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // keep the in-memory key for this visit
  }
  return key;
}

async function parseThread(response: Response): Promise<ChatMessage[]> {
  if (!response.ok) throw new Error(`chat ${response.status}`);
  const data = (await response.json()) as { messages?: ChatMessage[] };
  return data.messages ?? [];
}

/** The guest's conversation (empty until they write). Marks replies as read. */
export async function fetchThread(): Promise<ChatMessage[]> {
  const key = readKey();
  if (!key) return [];
  const messages = await parseThread(
    await fetch("/api/messages", { headers: { "X-Chat-Key": key }, cache: "no-store" }),
  );
  setUnread(0);
  return messages;
}

export async function sendChatMessage(body: string, lang: Locale): Promise<ChatMessage[]> {
  const key = readKey() ?? createKey();
  return parseThread(
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Chat-Key": key },
      body: JSON.stringify({ body, lang }),
    }),
  );
}

/** True once this device has written to the restaurant (it has a conversation). */
export function hasConversation(): boolean {
  return readKey() !== null;
}

/**
 * Links this device's notification subscription (if it has one) to the
 * conversation, so the restaurant's replies can alert the guest.
 */
export async function linkChatPush(): Promise<void> {
  const key = readKey();
  const endpoint = key ? await subscriptionEndpoint().catch(() => null) : null;
  if (!key || !endpoint) return;
  await fetch("/api/messages/push", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Chat-Key": key },
    body: JSON.stringify({ endpoint }),
  }).catch(() => {});
}

/* ── Unread replies (badge on the Info tab) ─────────────────────────────── */

let unread = 0;
const listeners = new Set<() => void>();

function setUnread(next: number) {
  if (next === unread) return;
  unread = next;
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

async function pollUnread() {
  const key = readKey();
  if (!key || document.visibilityState !== "visible") return;
  try {
    const response = await fetch("/api/messages?unread", { headers: { "X-Chat-Key": key }, cache: "no-store" });
    if (response.ok) setUnread(((await response.json()) as { unread?: number }).unread ?? 0);
  } catch {
    // offline — try again on the next tick
  }
}

/**
 * Number of restaurant replies the guest hasn't read. Polls only for guests who
 * have written at least once, and only while the page is visible.
 */
export function useChatUnread(): number {
  useEffect(() => {
    if (!readKey()) return;
    pollUnread();
    const timer = setInterval(pollUnread, UNREAD_POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") pollUnread();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return useSyncExternalStore(subscribe, () => unread, () => 0);
}
