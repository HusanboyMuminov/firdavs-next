import type { NextConfig } from "next";
import path from "node:path";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Development only: lets a phone on the same Wi-Fi use the dev server
  // (http://192.168.x.x:3000). Without this, Next.js blocks the page's scripts
  // for non-localhost visitors, so nothing on the page responds to taps.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  // A parent directory has its own package.json + lockfile, so pin the
  // project root instead of letting Next.js infer the wrong workspace.
  turbopack: {
    root: path.join(__dirname),
  },
  // Native / Node-only server libraries (better-sqlite3 is external by default).
  serverExternalPackages: ["web-push"],
  images: {
    qualities: [75],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The service worker must never be served stale.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
