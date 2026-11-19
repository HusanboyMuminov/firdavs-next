import "server-only";
import { BlockList, isIP } from "node:net";
import type { NextRequest } from "next/server";

/**
 * Ordering is allowed only from the restaurant's Wi-Fi (browsing is never
 * restricted): the request's public IP must be listed in ORDER_ALLOWED_IPS —
 * default: the FIRDAVS Wi-Fi, 115.139.203.135. Comma-separated; CIDR ranges are
 * allowed (e.g. an IPv6 /64); "*" turns the check off for local development.
 *
 * The client IP comes only from a header that the hosting edge sets itself,
 * never from X-Forwarded-For (Render appends to it, so a browser can fake the
 * first entry). On Render (RENDER=true) every request passes Cloudflare, which
 * always overwrites CF-Connecting-IP with the real address. Behind another
 * reverse proxy, set ORDER_IP_HEADER to the header it sets (e.g. x-real-ip).
 * With no trusted header the IP is unknown and ordering stays closed.
 */
const DEFAULT_ALLOWED_IPS = "115.139.203.135";

function trustedHeaders(): string[] {
  const configured = process.env.ORDER_IP_HEADER?.trim().toLowerCase();
  if (configured) return [configured];
  return process.env.RENDER === "true" ? ["cf-connecting-ip"] : [];
}

/** The guest's public IP as reported by the trusted proxy, or null if it can't be known safely. */
export function trustedClientIp(request: NextRequest): string | null {
  for (const name of trustedHeaders()) {
    let ip = request.headers.get(name)?.split(",")[0]?.trim() ?? "";
    if (/^::ffff:/i.test(ip) && isIP(ip.slice(7)) === 4) ip = ip.slice(7); // IPv4-mapped IPv6
    if (isIP(ip)) return ip;
  }
  return null;
}

export function orderIpAllowed(request: NextRequest): boolean {
  const allowed = process.env.ORDER_ALLOWED_IPS?.trim() || DEFAULT_ALLOWED_IPS;
  if (allowed === "*") return true;
  const ip = trustedClientIp(request);
  if (!ip) return false;
  const list = new BlockList();
  for (const entry of allowed.split(",").map((s) => s.trim()).filter(Boolean)) {
    const [address, prefix] = entry.split("/");
    const family = isIP(address);
    if (!family) continue;
    const type = family === 6 ? "ipv6" : "ipv4";
    try {
      if (prefix === undefined) list.addAddress(address, type);
      else list.addSubnet(address, Number(prefix), type);
    } catch {
      // ignore a malformed entry
    }
  }
  return list.check(ip, isIP(ip) === 6 ? "ipv6" : "ipv4");
}
