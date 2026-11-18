import { unstable_rethrow } from "next/navigation";
import { after, connection, type NextRequest } from "next/server";
import { isAdminRequest } from "@/server/admin-auth";
import { errorResponse, isSameOrigin, json, readJson } from "@/server/http";
import { addMessage, adminThread, isThreadId, MAX_MESSAGE, threadLang } from "@/server/messages";
import { notifyGuestReply } from "@/server/notify";
import { isText } from "@/server/validate";

type Ctx = { params: Promise<{ thread: string }> };

/** Admin: read one conversation (marks the guest's messages as read). */
export async function GET(request: NextRequest, { params }: Ctx) {
  await connection(); // per-request: never prerendered at build time
  try {
    if (!isAdminRequest(request)) return errorResponse(401, "unauthorized");
    const { thread } = await params;
    if (!isThreadId(thread)) return errorResponse(400, "invalid_request");
    const messages = adminThread(thread);
    if (!messages) return errorResponse(404, "not_found");
    return json({ messages });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[api/admin/messages/[thread] GET]", error);
    return errorResponse(503, "unavailable");
  }
}

/** Admin: reply to a guest ({ body }). Only existing conversations can be answered. */
export async function POST(request: NextRequest, { params }: Ctx) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  if (!isAdminRequest(request)) return errorResponse(401, "unauthorized");
  const { thread } = await params;
  if (!isThreadId(thread)) return errorResponse(400, "invalid_request");

  const data = await readJson(request, MAX_MESSAGE * 4 + 256);
  const body = typeof data?.body === "string" ? data.body.trim() : "";
  if (!isText(body, MAX_MESSAGE)) return errorResponse(400, "invalid_request");

  try {
    const lang = threadLang(thread);
    if (!lang) return errorResponse(404, "not_found");
    addMessage(thread, "admin", body, lang);
    after(() => notifyGuestReply(thread, lang, body));
    return json({ messages: adminThread(thread) ?? [] }, 201);
  } catch (error) {
    console.error("[api/admin/messages/[thread] POST]", error);
    return errorResponse(503, "unavailable");
  }
}
