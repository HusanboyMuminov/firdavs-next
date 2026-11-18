import { unstable_rethrow } from "next/navigation";
import { connection, type NextRequest } from "next/server";
import { isAdminRequest } from "@/server/admin-auth";
import { errorResponse, json } from "@/server/http";
import { adminUnread, listThreads } from "@/server/messages";

/** Admin: every guest conversation, most recently active first. */
export async function GET(request: NextRequest) {
  await connection(); // per-request: never prerendered at build time
  try {
    if (!isAdminRequest(request)) return errorResponse(401, "unauthorized");
    return json({ threads: listThreads(), unread: adminUnread() });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[api/admin/messages]", error);
    return errorResponse(503, "unavailable");
  }
}
