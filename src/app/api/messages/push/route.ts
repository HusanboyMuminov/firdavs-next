import type { NextRequest } from "next/server";
import { clientIp, createRateLimiter, errorResponse, isSameOrigin, noContent, readJson } from "@/server/http";
import { isChatKey, threadOf } from "@/server/messages";
import { linkChatSubscription } from "@/server/push";

const limiter = createRateLimiter(30, 60_000);

/**
 * Links this device's (already granted) notification subscription to the
 * guest's conversation, so a reply from the restaurant can alert them.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  if (!limiter.take(clientIp(request))) return errorResponse(429, "rate_limited");
  const key = request.headers.get("x-chat-key");
  const body = await readJson(request, 2048);
  const endpoint = body?.endpoint;
  if (!isChatKey(key) || typeof endpoint !== "string" || endpoint.length === 0 || endpoint.length > 1024) {
    return errorResponse(400, "invalid_request");
  }
  try {
    return linkChatSubscription(threadOf(key), endpoint) ? noContent() : errorResponse(404, "not_subscribed");
  } catch (error) {
    console.error("[api/messages/push]", error);
    return errorResponse(503, "unavailable");
  }
}
