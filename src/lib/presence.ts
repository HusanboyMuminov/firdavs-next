import { useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";

/**
 * Anonymous live-usage tracking for the admin dashboard: random ids only
 * (no names, IPs or device details). Sends a heartbeat every 15 s while the
 * tab is visible and leaves as soon as it's hidden or closed.
 */

const HEARTBEAT_MS = 15_000;
const ID_RE = /^[A-Za-z0-9_-]{16,64}$/;

function randomId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes); // also available on plain-http LAN testing (unlike randomUUID)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function storedId(getStorage: () => Storage, key: string): string {
  try {
    const storage = getStorage();
    const existing = storage.getItem(key);
    if (existing && ID_RE.test(existing)) return existing;
    const id = randomId();
    storage.setItem(key, id);
    return id;
  } catch {
    return randomId(); // storage blocked: still count this tab
  }
}

export function usePresence(path: string, dish: string | null, lang: Locale) {
  const latest = useRef({ path, dish, lang });
  const sendRef = useRef<((view: boolean) => void) | null>(null);

  useEffect(() => {
    latest.current = { path, dish, lang };
  });

  useEffect(() => {
    const sid = storedId(() => window.sessionStorage, "firdavs:sid"); // one per tab
    const visitor = storedId(() => window.localStorage, "firdavs:vid"); // one per device
    let timer: ReturnType<typeof setInterval> | undefined;

    const send = (view: boolean) => {
      const body = JSON.stringify({ sid, visitor, view, ...latest.current });
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Analytics must never affect the menu.
      });
    };
    const leave = () => {
      const payload = new Blob([JSON.stringify({ sid })], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/presence/leave", payload)) {
        fetch("/api/presence/leave", { method: "POST", body: payload, keepalive: true }).catch(() => {});
      }
    };
    const start = () => {
      timer ??= setInterval(() => send(false), HEARTBEAT_MS);
    };
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        send(false);
        start();
      } else {
        stop();
        leave();
      }
    };

    sendRef.current = send;
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", leave);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", leave);
      sendRef.current = null;
    };
  }, []);

  // A page view whenever the screen or the opened dish changes.
  useEffect(() => {
    sendRef.current?.(true);
  }, [path, dish]);
}
