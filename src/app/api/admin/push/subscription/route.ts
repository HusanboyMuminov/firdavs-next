import type { NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { isAdminRequest } from "@/server/admin-auth";
import { errorResponse, isSameOrigin, noContent, readJson } from "@/server/http";
import { parseSubscription, removeAdminSubscription, saveAdminSubscription, vapidPublicKey } from "@/server/push";

/** Admin: this device gets alerts (new guests, orders, messages). Called only after permission was granted. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  if (!isAdminRequest(request)) return errorResponse(401, "unauthorized");
  if (!vapidPublicKey()) return errorResponse(503, "push_not_configured");
  const body = await readJson(request, 2048);
  const subscription = parseSubscription(body?.subscription);
  const lang = body?.lang;
  if (!subscription || !isLocale(lang)) return errorResponse(400, "invalid_request");
  try {
    saveAdminSubscription(subscription, lang);
  } catch (error) {
    console.error("[api/admin/push/subscription]", error);
    return errorResponse(503, "unavailable");
  }
  return noContent();
}

/** Admin: stop alerts on this device. */
export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  if (!isAdminRequest(request)) return errorResponse(401, "unauthorized");
  const body = await readJson(request, 2048);
  const endpoint = body?.endpoint;
  if (typeof endpoint !== "string" || endpoint.length === 0 || endpoint.length > 1024) {
    return errorResponse(400, "invalid_request");
  }
  try {
    removeAdminSubscription(endpoint);
  } catch (error) {
    console.error("[api/admin/push/subscription]", error);
    return errorResponse(503, "unavailable");
  }
  return noContent();
}
