import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * SQLite database (file path from DATABASE_PATH). Stores anonymous usage
 * analytics, admin sessions, push subscriptions, guests' private messages and
 * table orders — no names, phone numbers or IP addresses.
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

-- Private guest ↔ admin messages. "thread" is the SHA-256 of a random key that
-- only the guest's browser holds; read_at = when the other side read it.
CREATE TABLE IF NOT EXISTS chat_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  thread     TEXT NOT NULL,
  sender     TEXT NOT NULL,
  body       TEXT NOT NULL,
  lang       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read_at    INTEGER
);
CREATE INDEX IF NOT EXISTS chat_messages_thread ON chat_messages(thread, id);
CREATE INDEX IF NOT EXISTS chat_messages_created ON chat_messages(created_at);

-- Table orders. request_id (one per Confirm) makes a repeated press return the same order.
CREATE TABLE IF NOT EXISTS orders (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL UNIQUE,
  table_no   TEXT NOT NULL,
  lines      TEXT NOT NULL,
  total      INTEGER NOT NULL,
  unpriced   INTEGER NOT NULL,
  lang       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  sms_status TEXT NOT NULL,
  sms_error  TEXT
);
CREATE INDEX IF NOT EXISTS orders_created ON orders(created_at);

-- The admin's devices that get alerts (new guests, orders, messages).
CREATE TABLE IF NOT EXISTS admin_push_subscriptions (
  endpoint   TEXT PRIMARY KEY,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  lang       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- A guest's push subscription linked to their chat thread (reply alerts).
CREATE TABLE IF NOT EXISTS chat_push (
  thread   TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  PRIMARY KEY (thread, endpoint)
);
`;

type GlobalWithDb = typeof globalThis & { __firdavsDb?: Database.Database };

// Re-applied once per module load, so tables added in an update also appear on
// a connection reused across dev hot reloads (every statement is IF NOT EXISTS).
let schemaApplied = false;

export function getDb(): Database.Database {
  const g = globalThis as GlobalWithDb;
  if (g.__firdavsDb) {
    if (!schemaApplied) {
      g.__firdavsDb.exec(SCHEMA);
      schemaApplied = true;
    }
    return g.__firdavsDb;
  }

  // A runtime location (env-configured), not a source file: keep it out of build tracing.
  const file = path.resolve(/*turbopackIgnore: true*/ process.env.DATABASE_PATH || ".data/firdavs.sqlite");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("busy_timeout = 3000");
  db.exec(SCHEMA);
  schemaApplied = true;

  g.__firdavsDb = db; // reuse across hot reloads / requests
  return db;
}
