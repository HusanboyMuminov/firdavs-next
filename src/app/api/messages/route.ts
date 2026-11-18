import { unstable_rethrow } from "next/navigation";
import { after, connection, type NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { clientIp, createRateLimiter, errorResponse, isSameOrigin, json, readJson } from "@/server/http";
import { addMessage, guestThread, guestUnread, isChatKey, MAX_MESSAGE, threadOf } from "@/server/messages";
import { notifyAdmins } from "@/server/notify";
import { isText } from "@/server/validate";

/**
 * A guest's private thread with the restaurant. The guest proves ownership with
 * the secret chat key in the `X-Chat-Key` header (never in the URL, so it can't
 * end up in access logs or browser history).
 */
const CHAT_KEY_HEADER = "x-chat-key";

const sendLimiter = createRateLimiter(30, 60_000); // per IP; many guests may share the restaurant Wi-Fi
const readLimiter = createRateLimiter(240, 60_000); // polling, possibly many guests on one Wi-Fi

/** GET → { messages } (marks replies as read) · GET ?unread → { unread } only. */
export async function GET(request: NextRequest) {
  await connection(); // per-request: never prerendered at build time
  try {
    if (!readLimiter.take(clientIp(request))) return errorResponse(429, "rate_limited");
    const key = request.headers.get(CHAT_KEY_HEADER);
    if (!isChatKey(key)) return errorResponse(400, "invalid_request");
    const thread = threadOf(key);
    if (request.nextUrl.searchParams.has("unread")) return json({ unread: guestUnread(thread) });
    return json({ messages: guestThread(thread) });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[api/messages GET]", error);
    return errorResponse(503, "unavailable");
  }
}

/** Send a message to the restaurant: { body, lang } → { messages }. Only the admin can read it. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  if (!sendLimiter.take(clientIp(request))) return errorResponse(429, "rate_limited");

  const key = request.headers.get(CHAT_KEY_HEADER);
  const data = await readJson(request, MAX_MESSAGE * 4 + 256);
  const body = typeof data?.body === "string" ? data.body.trim() : "";
  const lang = data?.lang;
  if (!isChatKey(key) || !isText(body, MAX_MESSAGE) || !isLocale(lang)) {
    return errorResponse(400, "invalid_request");
  }

  try {
    const thread = threadOf(key);
    addMessage(thread, "guest", body, lang);
    after(() => notifyAdmins({ kind: "message", guest: thread.slice(0, 6).toUpperCase(), preview: body }));
    return json({ messages: guestThread(thread) }, 201);
  } catch (error) {
    console.error("[api/messages POST]", error);
    return errorResponse(503, "unavailable");
  }
}
