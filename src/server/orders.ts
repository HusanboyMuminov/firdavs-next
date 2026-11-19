import "server-only";
import { dishById } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { formatPrice, priceLabel, unitPrice } from "@/lib/format";
import { getDb } from "./db";
import { kitchenNumber, sendSms, smsProvider } from "./sms";
import { sendTelegram, telegramReady } from "./telegram";

/**
 * Table orders: stored first, then sent to the kitchen — by SMS or through the
 * restaurant's Telegram bot, whichever the guest chose. Prices are always taken
 * from the menu on the server, never from the browser.
 */

export type OrderLine = { id: string; name: string; qty: number; unit: number | null; label: string | null };
export type OrderChannel = "sms" | "telegram";
/** Delivery status of the chosen channel (the name predates the Telegram option). */
export type SmsStatus = "sent" | "failed" | "not_configured";
export type Order = {
  id: number;
  table: string;
  lines: OrderLine[];
  total: number;
  /** Lines without a fixed price (staff adds them). */
  unpriced: number;
  lang: string;
  createdAt: number;
  channel: OrderChannel;
  smsStatus: SmsStatus | "pending" | "cancelled";
  /** Why the last send failed (admin only, e.g. "Telegram 400: Bad Request: chat not found"). */
  error: string | null;
};

export const MAX_LINES = 50;
export const MAX_QTY = 99;
/** "1" … "14" only (no 0, signs, decimals, letters or leading zeros). */
export function isTableNumber(value: unknown): value is string {
  return typeof value === "string" && /^[1-9]\d?$/.test(value) && Number(value) <= restaurant.tables;
}

/** Validates [{ id, qty }] against the menu; null if anything is off. */
export function parseItems(value: unknown): OrderLine[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_LINES) return null;
  const lines: OrderLine[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    const { id, qty } = (item ?? {}) as { id?: unknown; qty?: unknown };
    const dish = typeof id === "string" ? dishById.get(id) : undefined;
    if (!dish || seen.has(dish.id) || typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return null;
    }
    seen.add(dish.id);
    lines.push({ id: dish.id, name: dish.name.uz, qty, unit: unitPrice(dish), label: priceLabel(dish) });
  }
  return lines;
}

type Row = {
  id: number;
  table_no: string;
  lines: string;
  total: number;
  unpriced: number;
  lang: string;
  created_at: number;
  channel: OrderChannel;
  sms_status: Order["smsStatus"];
  sms_error: string | null;
};

const toOrder = (r: Row): Order => ({
  id: r.id,
  table: r.table_no,
  lines: JSON.parse(r.lines) as OrderLine[],
  total: r.total,
  unpriced: r.unpriced,
  lang: r.lang,
  createdAt: r.created_at,
  channel: r.channel,
  smsStatus: r.sms_status,
  error: r.sms_error,
});

const SELECT = "SELECT id, table_no, lines, total, unpriced, lang, created_at, channel, sms_status, sms_error FROM orders";

export function orderExists(requestId: string): boolean {
  return Boolean(getDb().prepare("SELECT 1 FROM orders WHERE request_id = ?").get(requestId));
}

/** Stores the order once per request id; a repeated request returns the existing one. */
export function createOrder(input: {
  requestId: string;
  table: string;
  lines: OrderLine[];
  lang: string;
  channel: OrderChannel;
}) {
  const db = getDb();
  const existing = db.prepare(`${SELECT} WHERE request_id = ?`).get(input.requestId) as Row | undefined;
  if (existing) return { order: toOrder(existing), duplicate: true };
  const total = input.lines.reduce((sum, l) => sum + (l.unit ?? 0) * l.qty, 0);
  const unpriced = input.lines.filter((l) => l.unit === null).length;
  const info = db
    .prepare(
      `INSERT INTO orders (request_id, table_no, lines, total, unpriced, lang, created_at, channel, sms_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    )
    .run(input.requestId, input.table, JSON.stringify(input.lines), total, unpriced, input.lang, Date.now(), input.channel);
  const row = db.prepare(`${SELECT} WHERE id = ?`).get(Number(info.lastInsertRowid)) as Row;
  return { order: toOrder(row), duplicate: false };
}

const kst = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** The kitchen SMS (fixed format for the staff, Uzbek dish names). */
export function orderText(order: Order): string {
  const lines = order.lines.map((l, i) => {
    const price =
      l.unit !== null
        ? ` — ${formatPrice(l.unit)}${l.qty > 1 ? ` = ${formatPrice(l.unit * l.qty)}` : ""}`
        : l.label
          ? ` — ${l.label}`
          : " — price by staff";
    return `${i + 1}. ${l.name} × ${l.qty}${price}`;
  });
  const total =
    order.unpriced === 0
      ? formatPrice(order.total)
      : order.total > 0
        ? `${formatPrice(order.total)} + ${order.unpriced} item(s) priced by staff`
        : "to be confirmed by staff";
  return [
    "FIRDAVS RESTAURANT",
    `Order #${order.id} · Table ${order.table}`,
    `${kst.format(new Date(order.createdAt))} (KST)`,
    "",
    ...lines,
    "",
    `Total: ${total}`,
  ].join("\n");
}

function setSmsStatus(id: number, status: Order["smsStatus"], error: string | null) {
  getDb().prepare("UPDATE orders SET sms_status = ?, sms_error = ? WHERE id = ?").run(status, error, id);
}

/** Sends the order to the kitchen (SMS or Telegram bot, as chosen) and records the result. */
export async function deliverOrder(order: Order): Promise<SmsStatus> {
  const telegram = order.channel === "telegram";
  if (telegram ? !telegramReady() : !smsProvider()) {
    setSmsStatus(order.id, "not_configured", null);
    return "not_configured";
  }
  setSmsStatus(order.id, "pending", null); // while it's on its way the order can't be cancelled
  try {
    if (telegram) await sendTelegram(orderText(order));
    else await sendSms(kitchenNumber(), orderText(order));
    setSmsStatus(order.id, "sent", null);
    return "sent";
  } catch (error) {
    console.error(`[orders] ${telegram ? "Telegram" : "SMS"} for order #${order.id} failed:`, error);
    setSmsStatus(order.id, "failed", (error instanceof Error ? error.message : String(error)).slice(0, 300));
    return "failed";
  }
}

/**
 * The guest cancels an order whose SMS never reached the kitchen. It stays on
 * the admin list as "cancelled" and is never sent afterwards. Sent orders (or
 * one being sent right now) can't be cancelled here.
 */
export function cancelOrder(requestId: string): { order: Order; changed: boolean } | "not_found" | "not_cancellable" {
  const db = getDb();
  const row = db.prepare(`${SELECT} WHERE request_id = ?`).get(requestId) as Row | undefined;
  if (!row) return "not_found";
  if (row.sms_status === "cancelled") return { order: toOrder(row), changed: false };
  const { changes } = db
    .prepare("UPDATE orders SET sms_status = 'cancelled' WHERE id = ? AND sms_status IN ('not_configured', 'failed')")
    .run(row.id);
  if (changes === 0) return "not_cancellable";
  return { order: toOrder({ ...row, sms_status: "cancelled" }), changed: true };
}

/** Latest orders for the admin dashboard. */
export function listOrders(limit = 30): Order[] {
  return (getDb().prepare(`${SELECT} ORDER BY id DESC LIMIT ?`).all(limit) as Row[]).map(toOrder);
}
