"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { UI } from "@/i18n/ui";
import { formatDay as dayLabel } from "@/lib/intl";
import styles from "./AdminCharts.module.css";

export type Day = { date: string; visits: number; views: number };

/** 0 / step / 2·step with a clean step (1, 2, 5 × 10ⁿ) covering `max`. */
function scale(max: number): { top: number; ticks: number[] } {
  const half = Math.max(max / 2, 1);
  const exp = 10 ** Math.floor(Math.log10(half));
  const step = [1, 2, 5, 10].map((m) => m * exp).find((v) => v >= half) ?? 10 * exp;
  return { top: step * 2, ticks: [0, step, step * 2] };
}

/**
 * Visits per day as thin columns on one axis, with a hover/focus readout and
 * a table view (every value is reachable without hovering).
 */
export function DailyChart({ days, lang, t }: { days: Day[]; lang: Locale; t: UI }) {
  const [active, setActive] = useState<number | null>(null);
  const nf = new Intl.NumberFormat(lang);
  const max = Math.max(0, ...days.map((d) => d.visits));
  const { top, ticks } = scale(max);
  const peak = max > 0 ? days.findIndex((d) => d.visits === max) : -1;
  const last = days.length - 1;
  const shown = active === null ? null : days[active];

  return (
    <div className={styles.daily}>
      <div className={styles.plot}>
        <div className={styles.grid} aria-hidden="true">
          {ticks.map((tick) => (
            <div key={tick} className={styles.tick} style={{ bottom: `${(tick / top) * 100}%` }}>
              <span>{nf.format(tick)}</span>
            </div>
          ))}
        </div>
        <ol className={styles.cols} onPointerLeave={() => setActive(null)}>
          {days.map((d, i) => {
            const label = dayLabel(d.date, lang, "long");
            const capped = (i === last || i === peak) && d.visits > 0;
            return (
              <li
                key={d.date}
                className={styles.col}
                tabIndex={0}
                aria-label={`${label}: ${t.admin.visits(d.visits)}, ${t.admin.views(d.views)}`}
                data-active={active === i || undefined}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <span className={styles.bar} style={{ height: `${(d.visits / top) * 100}%` }}>
                  {capped && <span className={styles.cap}>{nf.format(d.visits)}</span>}
                </span>
              </li>
            );
          })}
        </ol>
        {shown && active !== null && (
          <div
            className={styles.tooltip}
            data-align={active < 3 ? "start" : active > last - 3 ? "end" : "center"}
            style={{ left: `${((active + 0.5) / days.length) * 100}%` }}
            aria-hidden="true"
          >
            <strong>{t.admin.visits(shown.visits)}</strong>
            <span>{t.admin.views(shown.views)}</span>
            <span className={styles.tooltipDate}>{dayLabel(shown.date, lang, "long")}</span>
          </div>
        )}
      </div>
      <ol className={styles.axis} aria-hidden="true">
        {days.map((d, i) => (
          <li key={d.date}>{(last - i) % 2 === 0 ? dayLabel(d.date, lang, "short") : ""}</li>
        ))}
      </ol>
      <details className={styles.tableView}>
        <summary>{t.admin.showTable}</summary>
        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr>
                <th scope="col">{t.admin.date}</th>
                <th scope="col">{t.admin.visitsCol}</th>
                <th scope="col">{t.admin.viewsCol}</th>
              </tr>
            </thead>
            <tbody>
              {[...days].reverse().map((d) => (
                <tr key={d.date}>
                  <th scope="row">{dayLabel(d.date, lang, "long")}</th>
                  <td>{nf.format(d.visits)}</td>
                  <td>{nf.format(d.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export type BarRow = { key: string; label: string; value: number; note?: string; lang?: string };

/** Ranked horizontal bars on one baseline, one hue, a figure on every row. */
export function RankedBars({ rows, lang, empty }: { rows: BarRow[]; lang: Locale; empty: string }) {
  if (rows.length === 0) return <p className={styles.empty}>{empty}</p>;
  const nf = new Intl.NumberFormat(lang);
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className={styles.ranked}>
      {rows.map((row) => (
        <li key={row.key} className={styles.rankedRow}>
          <span className={styles.rankedLabel} lang={row.lang}>
            {row.label}
          </span>
          <span className={styles.rankedValue}>
            {nf.format(row.value)}
            {row.note && <span className={styles.rankedNote}> · {row.note}</span>}
          </span>
          <span className={styles.rankedTrack} aria-hidden="true">
            <span className={styles.rankedBar} style={{ width: `${(row.value / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
