import { after, type NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { formatPrice } from "@/lib/format";
import { clientIp, createRateLimiter, errorResponse, isSameOrigin, json, readJson } from "@/server/http";
import { notifyAdmins } from "@/server/notify";
import { createOrder, deliverOrder, isTableNumber, orderExists, orderText, parseItems } from "@/server/orders";

// Per IP (guests on the restaurant Wi-Fi share one); repeated presses of one order don't count twice.
const limiter = createRateLimiter(20, 10 * 60_000);
const REQUEST_ID = /^[A-Za-z0-9_-]{16,64}$/;

/**
 * Places a table order: { requestId, table, lang, items: [{ id, qty }] }.
 * Stored first, then sent to the kitchen by SMS. The response says honestly
 * whether the SMS went out: "sent" | "failed" | "not_configured".
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  const body = await readJson(request, 8192);
  const requestId = body?.requestId;
  const table = body?.table;
  const lang = body?.lang;
  const lines = parseItems(body?.items);
  if (typeof requestId !== "string" || !REQUEST_ID.test(requestId) || !isLocale(lang) || !lines) {
    return errorResponse(400, "invalid_request");
  }
  if (!isTableNumber(table)) return errorResponse(400, "invalid_table");

  try {
    if (!orderExists(requestId) && !limiter.take(clientIp(request))) return errorResponse(429, "rate_limited");
    const { order, duplicate } = createOrder({ requestId, table, lines, lang });
    let sms = order.smsStatus;
    if (!duplicate || sms === "failed") {
      sms = await deliverOrder(order);
      if (!duplicate) {
        const items = order.lines.reduce((n, l) => n + l.qty, 0);
        after(() => notifyAdmins({ kind: "order", id: order.id, table: order.table, items, total: formatPrice(order.total) }));
      }
    }
    return json(
      {
        order: { id: order.id, table: order.table, total: order.total, unpriced: order.unpriced, createdAt: order.createdAt },
        sms,
        text: orderText(order),
      },
      duplicate ? 200 : 201,
    );
  } catch (error) {
    console.error("[api/orders]", error);
    return errorResponse(503, "unavailable");
  }
}
