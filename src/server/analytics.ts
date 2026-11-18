import "server-only";
import { getDb } from "./db";

/** A tab is "active" while it keeps sending heartbeats (every 15 s). */
export const ACTIVE_TIMEOUT_MS = 45_000;
/** A new visit starts after 30 minutes without activity. */
const VISIT_GAP_MS = 30 * 60_000;
const DAY_MS = 86_400_000;
const KST_OFFSET_MS = 9 * 3_600_000; // Asia/Seoul, no daylight saving
const PAGEVIEW_RETENTION_MS = 365 * DAY_MS;

export type Heartbeat = {
  sid: string;
  visitor: string;
  path: string;
  lang: string;
  dish: string | null;
  view: boolean;
};

export function recordHeartbeat(h: Heartbeat): void {
  const db = getDb();
  const now = Date.now();
  db.transaction(() => {
    db.prepare(
      `INSERT INTO presence (sid, visitor, last_seen, path, lang) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(sid) DO UPDATE SET visitor = excluded.visitor, last_seen = excluded.last_seen,
         path = excluded.path, lang = excluded.lang`,
    ).run(h.sid, h.visitor, now, h.path, h.lang);

    const visit = db
      .prepare(`SELECT id FROM visits WHERE visitor = ? AND last_seen > ? ORDER BY last_seen DESC LIMIT 1`)
      .get(h.visitor, now - VISIT_GAP_MS) as { id: number } | undefined;
    if (visit) {
      db.prepare(`UPDATE visits SET last_seen = ?, pageviews = pageviews + ? WHERE id = ?`).run(now, h.view ? 1 : 0, visit.id);
    } else {
      db.prepare(
        `INSERT INTO visits (visitor, started_at, last_seen, lang, entry_path, pageviews) VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(h.visitor, now, now, h.lang, h.path, h.view ? 1 : 0);
    }

    if (h.view) {
      db.prepare(`INSERT INTO pageviews (ts, path, lang, dish) VALUES (?, ?, ?, ?)`).run(now, h.path, h.lang, h.dish);
    }
    // Inactive tabs drop out automatically.
    db.prepare(`DELETE FROM presence WHERE last_seen < ?`).run(now - ACTIVE_TIMEOUT_MS);
  })();
}

export function removePresence(sid: string): void {
  getDb().prepare(`DELETE FROM presence WHERE sid = ?`).run(sid);
}

type Count = { n: number };

export type Stats = ReturnType<typeof getStats>;

export function getStats() {
  const db = getDb();
  const now = Date.now();
  const activeSince = now - ACTIVE_TIMEOUT_MS;
  db.prepare(`DELETE FROM presence WHERE last_seen < ?`).run(activeSince);
  db.prepare(`DELETE FROM pageviews WHERE ts < ?`).run(now - PAGEVIEW_RETENTION_MS);

  const today = Math.floor((now + KST_OFFSET_MS) / DAY_MS) * DAY_MS - KST_OFFSET_MS; // 00:00 KST
  const weekStart = today - 6 * DAY_MS;
  const rangeStart = today - 13 * DAY_MS;
  const count = (sql: string, ...params: unknown[]) => (db.prepare(sql).get(...params) as Count).n;
  const dayExpr = (col: string) => `CAST((${col} + ${KST_OFFSET_MS}) / ${DAY_MS} AS INTEGER)`;

  const visitsByDay = new Map(
    (db.prepare(`SELECT ${dayExpr("started_at")} AS d, COUNT(*) AS n FROM visits WHERE started_at >= ? GROUP BY d`).all(rangeStart) as {
      d: number;
      n: number;
    }[]).map((r) => [r.d, r.n]),
  );
  const viewsByDay = new Map(
    (db.prepare(`SELECT ${dayExpr("ts")} AS d, COUNT(*) AS n FROM pageviews WHERE ts >= ? GROUP BY d`).all(rangeStart) as {
      d: number;
      n: number;
    }[]).map((r) => [r.d, r.n]),
  );
  const firstDay = Math.floor((rangeStart + KST_OFFSET_MS) / DAY_MS);
  const daily = Array.from({ length: 14 }, (_, i) => {
    const d = firstDay + i;
    return {
      date: new Date(d * DAY_MS).toISOString().slice(0, 10), // calendar date in KST
      visits: visitsByDay.get(d) ?? 0,
      views: viewsByDay.get(d) ?? 0,
    };
  });

  return {
    generatedAt: now,
    activeTimeoutSeconds: ACTIVE_TIMEOUT_MS / 1000,
    activeNow: count(`SELECT COUNT(DISTINCT visitor) AS n FROM presence WHERE last_seen >= ?`, activeSince),
    activeByScreen: db
      .prepare(
        `SELECT path, COUNT(DISTINCT visitor) AS n FROM presence WHERE last_seen >= ? GROUP BY path ORDER BY n DESC, path`,
      )
      .all(activeSince) as { path: string; n: number }[],
    visits: {
      today: count(`SELECT COUNT(*) AS n FROM visits WHERE started_at >= ?`, today),
      week: count(`SELECT COUNT(*) AS n FROM visits WHERE started_at >= ?`, weekStart),
      total: count(`SELECT COUNT(*) AS n FROM visits`),
    },
    views: {
      today: count(`SELECT COUNT(*) AS n FROM pageviews WHERE ts >= ?`, today),
      week: count(`SELECT COUNT(*) AS n FROM pageviews WHERE ts >= ?`, weekStart),
    },
    daily,
    languages: db
      .prepare(`SELECT lang, COUNT(*) AS n FROM visits WHERE started_at >= ? GROUP BY lang ORDER BY n DESC`)
      .all(weekStart) as { lang: string; n: number }[],
    topScreens: db
      .prepare(
        `SELECT path, COUNT(*) AS n FROM pageviews WHERE ts >= ? AND dish IS NULL GROUP BY path ORDER BY n DESC LIMIT 6`,
      )
      .all(weekStart) as { path: string; n: number }[],
    topDishes: db
      .prepare(
        `SELECT dish, COUNT(*) AS n FROM pageviews WHERE ts >= ? AND dish IS NOT NULL GROUP BY dish ORDER BY n DESC LIMIT 6`,
      )
      .all(weekStart) as { dish: string; n: number }[],
    recent: db
      .prepare(`SELECT ts, path, lang, dish FROM pageviews ORDER BY ts DESC LIMIT 15`)
      .all() as { ts: number; path: string; lang: string; dish: string | null }[],
    subscribers: count(`SELECT COUNT(*) AS n FROM push_subscriptions`),
  };
}
