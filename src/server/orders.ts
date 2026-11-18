import "server-only";
import { dishById } from "@/data/menu";
import { formatPrice, priceLabel, unitPrice } from "@/lib/format";
import { getDb } from "./db";
import { kitchenNumber, sendSms, smsProvider } from "./sms";

/**
 * Table orders: stored first, then sent to the kitchen phone by SMS. Prices are
 * always taken from the menu on the server, never from the browser.
 */

export type OrderLine = { id: string; name: string; qty: number; unit: number | null; label: string | null };
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
  smsStatus: SmsStatus | "pending";
};

export const MAX_LINES = 50;
export const MAX_QTY = 99;
const TABLE_RE = /^[1-9]\d{0,2}$/;

/** "7" … "999"; with TABLE_COUNT set (e.g. 20), at most that number. */
export function isTableNumber(value: unknown): value is string {
  if (typeof value !== "string" || !TABLE_RE.test(value)) return false;
  const max = Number(process.env.TABLE_COUNT);
  return !(Number.isInteger(max) && max > 0 && Number(value) > max);
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
  sms_status: Order["smsStatus"];
};

const toOrder = (r: Row): Order => ({
  id: r.id,
  table: r.table_no,
  lines: JSON.parse(r.lines) as OrderLine[],
  total: r.total,
  unpriced: r.unpriced,
  lang: r.lang,
  createdAt: r.created_at,
  smsStatus: r.sms_status,
});

const SELECT = "SELECT id, table_no, lines, total, unpriced, lang, created_at, sms_status FROM orders";

export function orderExists(requestId: string): boolean {
  return Boolean(getDb().prepare("SELECT 1 FROM orders WHERE request_id = ?").get(requestId));
}

/** Stores the order once per request id; a repeated request returns the existing one. */
export function createOrder(input: { requestId: string; table: string; lines: OrderLine[]; lang: string }) {
  const db = getDb();
  const existing = db.prepare(`${SELECT} WHERE request_id = ?`).get(input.requestId) as Row | undefined;
  if (existing) return { order: toOrder(existing), duplicate: true };
  const total = input.lines.reduce((sum, l) => sum + (l.unit ?? 0) * l.qty, 0);
  const unpriced = input.lines.filter((l) => l.unit === null).length;
  const info = db
    .prepare(
      `INSERT INTO orders (request_id, table_no, lines, total, unpriced, lang, created_at, sms_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    )
    .run(input.requestId, input.table, JSON.stringify(input.lines), total, unpriced, input.lang, Date.now());
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

function setSmsStatus(id: number, status: SmsStatus, error: string | null) {
  getDb().prepare("UPDATE orders SET sms_status = ?, sms_error = ? WHERE id = ?").run(status, error, id);
}

/** Sends the order to the kitchen phone and records the result. */
export async function deliverOrder(order: Order): Promise<SmsStatus> {
  if (!smsProvider()) {
    setSmsStatus(order.id, "not_configured", null);
    return "not_configured";
  }
  try {
    await sendSms(kitchenNumber(), orderText(order));
    setSmsStatus(order.id, "sent", null);
    return "sent";
  } catch (error) {
    console.error(`[orders] SMS for order #${order.id} failed:`, error);
    setSmsStatus(order.id, "failed", String(error).slice(0, 300));
    return "failed";
  }
}

/** Latest orders for the admin dashboard. */
export function listOrders(limit = 30): Order[] {
  return (getDb().prepare(`${SELECT} ORDER BY id DESC LIMIT ?`).all(limit) as Row[]).map(toOrder);
}
