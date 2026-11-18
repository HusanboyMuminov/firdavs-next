import { unstable_rethrow } from "next/navigation";
import { connection, type NextRequest } from "next/server";
import { adminConfigured, isAdminRequest } from "@/server/admin-auth";
import { errorResponse, json } from "@/server/http";

export async function GET(request: NextRequest) {
  await connection(); // per-request: never prerendered at build time
  try {
    return json({ configured: adminConfigured(), authenticated: isAdminRequest(request) });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[api/admin/session]", error);
    return errorResponse(503, "unavailable");
  }
}
