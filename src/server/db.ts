import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * SQLite database (file path from DATABASE_PATH). Stores anonymous usage
 * analytics, admin sessions and push subscriptions — no personal data.
 * Needs a persistent disk (any Node.js host / Docker volume).
 */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS presence (
  sid        TEXT PRIMARY KEY,
  visitor    TEXT NOT NULL,
  last_seen  INTEGER NOT NULL,
  path       TEXT NOT NULL,
  lang       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS presence_last_seen ON presence(last_seen);

CREATE TABLE IF NOT EXISTS visits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor    TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  last_seen  INTEGER NOT NULL,
  lang       TEXT NOT NULL,
  entry_path TEXT NOT NULL,
  pageviews  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS visits_visitor ON visits(visitor, last_seen);
CREATE INDEX IF NOT EXISTS visits_started ON visits(started_at);

CREATE TABLE IF NOT EXISTS pageviews (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  ts    INTEGER NOT NULL,
  path  TEXT NOT NULL,
  lang  TEXT NOT NULL,
  dish  TEXT
);
CREATE INDEX IF NOT EXISTS pageviews_ts ON pageviews(ts);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint   TEXT PRIMARY KEY,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  lang       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`;

type GlobalWithDb = typeof globalThis & { __firdavsDb?: Database.Database };

export function getDb(): Database.Database {
  const g = globalThis as GlobalWithDb;
  if (g.__firdavsDb) return g.__firdavsDb;

  // A runtime location (env-configured), not a source file: keep it out of build tracing.
  const file = path.resolve(/*turbopackIgnore: true*/ process.env.DATABASE_PATH || ".data/firdavs.sqlite");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("busy_timeout = 3000");
  db.exec(SCHEMA);

  g.__firdavsDb = db; // reuse across hot reloads / requests
  return db;
}
