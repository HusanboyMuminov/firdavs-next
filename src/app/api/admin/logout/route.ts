import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie, destroySession } from "@/server/admin-auth";
import { errorResponse, isSameOrigin } from "@/server/http";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  try {
    destroySession(request);
  } catch (error) {
    console.error("[api/admin/logout]", error);
  }
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  clearSessionCookie(response, request);
  return response;
}
