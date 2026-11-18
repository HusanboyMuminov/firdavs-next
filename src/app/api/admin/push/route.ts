import type { NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { isAdminRequest } from "@/server/admin-auth";
import { errorResponse, isSameOrigin, json, readJson } from "@/server/http";
import { sendToSubscribers, vapidPublicKey } from "@/server/push";
import { isScreenPath, isText } from "@/server/validate";

/** Sends a notification to guests who opted in. Admin only. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  try {
    if (!isAdminRequest(request)) return errorResponse(401, "unauthorized");
  } catch (error) {
    console.error("[api/admin/push]", error);
    return errorResponse(503, "unavailable");
  }
  if (!vapidPublicKey()) return errorResponse(503, "push_not_configured");

  const body = await readJson(request, 2048);
  const title = body?.title;
  const text = body?.body;
  const url = body?.url ?? "/";
  const lang = body?.lang ?? "all";
  if (!isText(title, 80) || !isText(text, 240) || !isScreenPath(url) || !(lang === "all" || isLocale(lang))) {
    return errorResponse(400, "invalid_request");
  }

  try {
    const result = await sendToSubscribers({
      title: title.trim(),
      body: text.trim(),
      url,
      lang: lang === "all" ? null : lang,
    });
    return json(result);
  } catch (error) {
    console.error("[api/admin/push]", error);
    return errorResponse(502, "send_failed");
  }
}
