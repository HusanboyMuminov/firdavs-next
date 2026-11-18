import type { Metadata } from "next";
import { lang } from "next/root-params";
import { AdminApp } from "@/components/admin/AdminApp";
import { restaurant } from "@/data/restaurant";
import { defaultLocale, isLocale } from "@/i18n/config";
import { ui } from "@/i18n/ui";

/**
 * Admin dashboard at /admin (any language prefix works, e.g. /ko/admin).
 * The page itself is a static shell; every number comes from /api/admin/*,
 * which requires the session cookie set by signing in with ADMIN_PASSWORD.
 */

async function locale() {
  const value = await lang();
  return isLocale(value) ? value : defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const l = await locale();
  return {
    title: { absolute: `${ui[l].admin.title} · ${restaurant.name}` },
    robots: { index: false, follow: false },
  };
}

/** Plain page load (no client-side navigation leads here). */
export const instant = false;

export default async function AdminPage() {
  return <AdminApp initialLang={await locale()} />;
}
