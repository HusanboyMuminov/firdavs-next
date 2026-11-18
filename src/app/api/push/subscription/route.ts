import type { NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { clientIp, createRateLimiter, errorResponse, isSameOrigin, noContent, readJson } from "@/server/http";
import { parseSubscription, removeSubscription, saveSubscription, vapidPublicKey } from "@/server/push";

const limiter = createRateLimiter(20, 60_000);

/** Stores a subscription — called only after the guest granted notification permission. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  if (!limiter.take(clientIp(request))) return errorResponse(429, "rate_limited");
  if (!vapidPublicKey()) return errorResponse(503, "push_not_configured");

  const body = await readJson(request, 2048);
  const subscription = parseSubscription(body?.subscription);
  const lang = body?.lang;
  if (!subscription || !isLocale(lang)) return errorResponse(400, "invalid_request");

  try {
    saveSubscription(subscription, lang);
  } catch (error) {
    console.error("[api/push/subscription]", error);
    return errorResponse(503, "unavailable");
  }
  return noContent();
}

/** Removes a subscription when the guest turns notifications off. */
export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  if (!limiter.take(clientIp(request))) return errorResponse(429, "rate_limited");

  const body = await readJson(request, 2048);
  const endpoint = body?.endpoint;
  if (typeof endpoint !== "string" || endpoint.length === 0 || endpoint.length > 1024) {
    return errorResponse(400, "invalid_request");
  }
  try {
    removeSubscription(endpoint);
  } catch (error) {
    console.error("[api/push/subscription]", error);
    return errorResponse(503, "unavailable");
  }
  return noContent();
}
