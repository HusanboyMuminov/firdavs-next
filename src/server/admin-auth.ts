import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { getDb } from "./db";

export const ADMIN_COOKIE = "firdavs_admin";
const SESSION_TTL_S = 12 * 60 * 60;

const sha256 = (value: string) => createHash("sha256").update(value).digest();

/** The admin area is only enabled when ADMIN_PASSWORD (8+ chars) is configured. */
export function adminConfigured(): boolean {
  const password = process.env.ADMIN_PASSWORD;
  return typeof password === "string" && password.length >= 8;
}

export function passwordMatches(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) return false;
  // Hash both sides so the comparison is constant-time regardless of length.
  return timingSafeEqual(sha256(input), sha256(password));
}

/** Creates a session; only the token's hash is stored, so a DB leak can't be replayed. */
export function createSession(): { token: string; maxAge: number } {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const db = getDb();
  db.prepare(`DELETE FROM admin_sessions WHERE expires_at < ?`).run(now);
  db.prepare(`INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)`).run(
    sha256(token).toString("hex"),
    now + SESSION_TTL_S * 1000,
  );
  return { token, maxAge: SESSION_TTL_S };
}

export function isAdminRequest(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token || token.length > 128 || !adminConfigured()) return false;
  const row = getDb()
    .prepare(`SELECT expires_at FROM admin_sessions WHERE token_hash = ?`)
    .get(sha256(token).toString("hex")) as { expires_at: number } | undefined;
  return row !== undefined && row.expires_at > Date.now();
}

export function destroySession(request: NextRequest): void {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (token && token.length <= 128) {
    getDb().prepare(`DELETE FROM admin_sessions WHERE token_hash = ?`).run(sha256(token).toString("hex"));
  }
}

function isHttps(request: NextRequest): boolean {
  return request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
}

export function setSessionCookie(response: NextResponse, request: NextRequest, token: string, maxAge: number) {
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isHttps(request),
    path: "/",
    maxAge,
  });
}

export function clearSessionCookie(response: NextResponse, request: NextRequest) {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: isHttps(request),
    path: "/",
    maxAge: 0,
  });
}
