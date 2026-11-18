import "server-only";
import type { NextRequest } from "next/server";

export function json(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export const noContent = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export const errorResponse = (status: number, error: string) => json({ error }, status);

/** Reads a small JSON body (works for fetch and navigator.sendBeacon). */
export async function readJson(request: Request, maxBytes = 4096): Promise<Record<string, unknown> | null> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    const value: unknown = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Browsers always send Origin on cross-site POSTs: reject those (CSRF).
 * Requests without Origin (same-origin navigations, server tools) pass.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  } catch {
    return false;
  }
}

/** Best-effort client IP for in-memory rate limiting only (never stored). */
export function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

/** Tiny fixed-window rate limiter kept in memory. */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return {
    /** Returns false when `key` is over the limit. */
    take(key: string): boolean {
      const now = Date.now();
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        if (hits.size > 5000) hits.clear(); // bound memory
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      entry.count += 1;
      return entry.count <= limit;
    },
    reset(key: string) {
      hits.delete(key);
    },
  };
}
