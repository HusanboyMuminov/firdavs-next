import type { NextRequest } from "next/server";
import { dishById } from "@/data/menu";
import { isLocale } from "@/i18n/config";
import { recordHeartbeat } from "@/server/analytics";
import { clientIp, createRateLimiter, errorResponse, isSameOrigin, noContent, readJson } from "@/server/http";
import { isClientId, isScreenPath } from "@/server/validate";

// Per IP address. Guests on the restaurant Wi-Fi share one public IP: a tab sends
// ~4–8 requests a minute, so this leaves room for well over 100 guests at once.
const limiter = createRateLimiter(1200, 60_000);

/** Heartbeat from an open menu tab (anonymous; no personal data). */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  if (!limiter.take(clientIp(request))) return errorResponse(429, "rate_limited");

  const body = await readJson(request, 1024);
  const sid = body?.sid;
  const visitor = body?.visitor;
  const path = body?.path;
  const lang = body?.lang;
  const dish = body?.dish ?? null;
  const view = body?.view;
  if (
    !isClientId(sid) ||
    !isClientId(visitor) ||
    !isScreenPath(path) ||
    !isLocale(lang) ||
    typeof view !== "boolean" ||
    (dish !== null && (typeof dish !== "string" || !dishById.has(dish)))
  ) {
    return errorResponse(400, "invalid_request");
  }

  try {
    recordHeartbeat({ sid, visitor, path, lang, dish, view });
  } catch (error) {
    console.error("[api/presence]", error);
    return errorResponse(503, "unavailable");
  }
  return noContent();
}
