import "server-only";
import { createHash } from "node:crypto";
import { getDb } from "./db";

/**
 * Private messages between a guest and the restaurant admin.
 *
 * A guest is known only by a random secret "chat key" that their browser
 * creates and keeps (localStorage). The server stores just the key's SHA-256
 * hash as the thread id, so a thread can be read only with the key itself or
 * by the signed-in admin — never by another guest, and the stored ids can't be
 * turned back into keys. No names, phone numbers or IP addresses are stored.
 * Messages older than RETENTION_DAYS are deleted automatically.
 */

export type Sender = "guest" | "admin";

export type Message = { id: number; sender: Sender; body: string; createdAt: number };

export type ThreadSummary = {
  id: string;
  /** Language of the guest's latest message (to reply in it). */
  lang: string;
  lastBody: string;
  lastSender: Sender;
  lastAt: number;
  total: number;
  /** Guest messages the admin hasn't opened yet. */
  unread: number;
};

export const MAX_MESSAGE = 1000;
const RETENTION_DAYS = 180;

const KEY_RE = /^[A-Za-z0-9_-]{32,128}$/;
const THREAD_RE = /^[a-f0-9]{64}$/;

export const isChatKey = (value: unknown): value is string => typeof value === "string" && KEY_RE.test(value);
export const isThreadId = (value: unknown): value is string => typeof value === "string" && THREAD_RE.test(value);

/** Thread id for a guest's chat key. */
export const threadOf = (key: string): string => createHash("sha256").update(key).digest("hex");

export function addMessage(thread: string, sender: Sender, body: string, lang: string): void {
  const db = getDb();
  const now = Date.now();
  db.prepare("INSERT INTO chat_messages (thread, sender, body, lang, created_at) VALUES (?, ?, ?, ?, ?)").run(
    thread,
    sender,
    body,
    lang,
    now,
  );
  db.prepare("DELETE FROM chat_messages WHERE created_at < ?").run(now - RETENTION_DAYS * 86_400_000);
}

function readThread(thread: string): Message[] {
  return getDb()
    .prepare(
      "SELECT id, sender, body, created_at AS createdAt FROM chat_messages WHERE thread = ? ORDER BY id LIMIT 500",
    )
    .all(thread) as Message[];
}

/** The guest's own thread, oldest first; marks the admin's replies as read. */
export function guestThread(thread: string): Message[] {
  getDb()
    .prepare("UPDATE chat_messages SET read_at = ? WHERE thread = ? AND sender = 'admin' AND read_at IS NULL")
    .run(Date.now(), thread);
  return readThread(thread);
}

/** Admin replies the guest hasn't seen yet. */
export function guestUnread(thread: string): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM chat_messages WHERE thread = ? AND sender = 'admin' AND read_at IS NULL")
    .get(thread) as { n: number };
  return row.n;
}

/** Every thread for the admin, most recently active first. */
export function listThreads(): ThreadSummary[] {
  return getDb()
    .prepare(
      `WITH t AS (
         SELECT thread,
                COUNT(*) AS total,
                SUM(sender = 'guest' AND read_at IS NULL) AS unread,
                MAX(id) AS last_id,
                MAX(CASE WHEN sender = 'guest' THEN id END) AS last_guest_id
           FROM chat_messages
          GROUP BY thread
       )
       SELECT t.thread AS id, t.total, t.unread,
              m.body AS lastBody, m.sender AS lastSender, m.created_at AS lastAt,
              COALESCE(g.lang, m.lang) AS lang
         FROM t
         JOIN chat_messages m ON m.id = t.last_id
         LEFT JOIN chat_messages g ON g.id = t.last_guest_id
        ORDER BY t.last_id DESC
        LIMIT 200`,
    )
    .all() as ThreadSummary[];
}

/** One thread for the admin (marks the guest's messages as read); null if it doesn't exist. */
export function adminThread(thread: string): Message[] | null {
  const messages = readThread(thread);
  if (messages.length === 0) return null;
  getDb()
    .prepare("UPDATE chat_messages SET read_at = ? WHERE thread = ? AND sender = 'guest' AND read_at IS NULL")
    .run(Date.now(), thread);
  return messages;
}

/** Language of the guest's latest message in a thread (replies are stored with it). */
export function threadLang(thread: string): string | null {
  const row = getDb()
    .prepare("SELECT lang FROM chat_messages WHERE thread = ? AND sender = 'guest' ORDER BY id DESC LIMIT 1")
    .get(thread) as { lang: string } | undefined;
  return row?.lang ?? null;
}

/** Unread guest messages across all threads (dashboard badge). */
export function adminUnread(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM chat_messages WHERE sender = 'guest' AND read_at IS NULL")
    .get() as { n: number };
  return row.n;
}
