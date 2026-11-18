import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, createSession, passwordMatches, setSessionCookie } from "@/server/admin-auth";
import { clientIp, createRateLimiter, errorResponse, isSameOrigin, readJson } from "@/server/http";

// 8 wrong passwords per 15 minutes per client.
const failures = createRateLimiter(8, 15 * 60_000);

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return errorResponse(403, "forbidden");
  if (!adminConfigured()) return errorResponse(503, "not_configured");

  const ip = clientIp(request);
  const body = await readJson(request, 512);
  const password = body?.password;
  if (typeof password !== "string" || password.length === 0 || password.length > 200) {
    return errorResponse(400, "invalid_request");
  }

  if (!passwordMatches(password)) {
    const allowed = failures.take(ip);
    await new Promise((resolve) => setTimeout(resolve, 400)); // slow down guessing
    return errorResponse(allowed ? 401 : 429, allowed ? "invalid_password" : "too_many_attempts");
  }

  try {
    failures.reset(ip);
    const { token, maxAge } = createSession();
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    setSessionCookie(response, request, token, maxAge);
    return response;
  } catch (error) {
    console.error("[api/admin/login]", error);
    return errorResponse(503, "unavailable");
  }
}
