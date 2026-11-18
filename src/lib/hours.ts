import { useSyncExternalStore } from "react";
import type { DayHours } from "@/data/restaurant";

/* ── A clock that ticks once a minute (null during SSR/hydration) ───────── */

let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  now = Math.floor(Date.now() / 60_000) * 60_000;
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) timer = setInterval(tick, 30_000);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) clearInterval(timer);
  };
}

function getSnapshot() {
  if (!now) now = Math.floor(Date.now() / 60_000) * 60_000;
  return now;
}

/** Current time in ms (minute precision), or null while rendering on the server. */
export function useNow(): number | null {
  return useSyncExternalStore<number | null>(subscribe, getSnapshot, () => null);
}

/* ── Opening-hours logic, evaluated in the restaurant's time zone ──────── */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const formatters = new Map<string, Intl.DateTimeFormat>();

function zonedParts(ts: number, timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, f);
  }
  const parts = f.formatToParts(new Date(ts));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: Math.max(0, WEEKDAYS.indexOf(get("weekday"))), // 0 = Monday
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export type OpenStatus =
  | { open: true; closesAt: string; today: number }
  | { open: false; opensAt: string | null; opensToday: boolean; today: number };

export function getOpenStatus(ts: number, hours: DayHours[], timeZone: string): OpenStatus {
  const { day, minutes } = zonedParts(ts, timeZone);
  const today = hours[day];
  const yesterday = hours[(day + 6) % 7];

  // Still inside yesterday's after-midnight shift?
  if (yesterday && toMinutes(yesterday.close) <= toMinutes(yesterday.open)) {
    if (minutes < toMinutes(yesterday.close)) return { open: true, closesAt: yesterday.close, today: day };
  }
  if (today) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    const overnight = close <= open;
    if (minutes >= open && (overnight || minutes < close)) {
      return { open: true, closesAt: today.close, today: day };
    }
    if (minutes < open) return { open: false, opensAt: today.open, opensToday: true, today: day };
  }
  for (let i = 1; i <= 7; i++) {
    const next = hours[(day + i) % 7];
    if (next) return { open: false, opensAt: next.open, opensToday: false, today: day };
  }
  return { open: false, opensAt: null, opensToday: false, today: day };
}
