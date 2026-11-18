import { unstable_rethrow } from "next/navigation";
import { connection, type NextRequest } from "next/server";
import { isAdminRequest } from "@/server/admin-auth";
import { getStats } from "@/server/analytics";
import { errorResponse, json } from "@/server/http";
import { vapidPublicKey } from "@/server/push";

export async function GET(request: NextRequest) {
  await connection(); // per-request: never prerendered at build time
  try {
    if (!isAdminRequest(request)) return errorResponse(401, "unauthorized");
    return json({ ...getStats(), pushEnabled: vapidPublicKey() !== null });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[api/admin/stats]", error);
    return errorResponse(503, "unavailable");
  }
}
