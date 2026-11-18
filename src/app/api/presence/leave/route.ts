import type { NextRequest } from "next/server";
import { removePresence } from "@/server/analytics";
import { errorResponse, isSameOrigin, noContent, readJson } from "@/server/http";
import { isClientId } from "@/server/validate";

/** Sent with navigator.sendBeacon when a tab is hidden or closed. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  const body = await readJson(request, 256);
  if (!isClientId(body?.sid)) return errorResponse(400, "invalid_request");
  try {
    removePresence(body.sid);
  } catch (error) {
    console.error("[api/presence/leave]", error);
    return errorResponse(503, "unavailable");
  }
  return noContent();
}
