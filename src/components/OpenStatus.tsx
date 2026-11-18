"use client";

import { restaurant } from "@/data/restaurant";
import { getOpenStatus, useNow } from "@/lib/hours";
import { useApp } from "./AppContext";
import styles from "./OpenStatus.module.css";

/**
 * "Open now · until 23:00". Rendered only after hydration (it depends on the
 * clock) and only once opening hours are set in restaurant.ts.
 */
export function OpenStatus({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { t } = useApp();
  const now = useNow();
  if (now === null || !restaurant.hours) return null;

  const status = getOpenStatus(now, restaurant.hours, restaurant.timeZone);
  const label = status.open ? t.status.open : t.status.closed;
  const detail = status.open
    ? t.status.until(status.closesAt)
    : status.opensAt
      ? t.status.opensAt(status.opensAt)
      : null;

  return (
    <span
      className={`${styles.status} ${tone === "dark" ? styles.dark : styles.light}`}
      data-open={status.open}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.text}>{detail ? `${label} · ${detail}` : label}</span>
    </span>
  );
}
