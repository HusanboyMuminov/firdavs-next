import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { lang } from "next/root-params";
import { restaurant } from "@/data/restaurant";
import { defaultLocale, isLocale, locales } from "@/i18n/config";
import { ui } from "@/i18n/ui";
import "../globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/** Public URL used for social previews. Set SITE_URL in production (Vercel sets its own). */
const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * Every page must be fully static (the build fails otherwise), so a QR scan
 * is always answered from prerendered HTML. Also makes unknown URLs return a
 * real 404 on the first request instead of a streamed fallback.
 */
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4a0d18",
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const value = await lang();
  const locale = isLocale(value) ? value : defaultLocale;
  return {
    metadataBase: new URL(siteUrl),
    applicationName: restaurant.name,
    description: ui[locale].metaDescription,
    formatDetection: { telephone: false, address: false, email: false },
    appleWebApp: { capable: true, title: "FIRDAVS", statusBarStyle: "black-translucent" },
    openGraph: {
      type: "website",
      siteName: restaurant.name,
      title: ui[locale].metaTitle,
      description: ui[locale].metaDescription,
      locale: { uz: "uz_UZ", ko: "ko_KR", ru: "ru_RU", en: "en_US" }[locale],
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const value = await lang();
  return (
    <html lang={isLocale(value) ? value : defaultLocale} className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
