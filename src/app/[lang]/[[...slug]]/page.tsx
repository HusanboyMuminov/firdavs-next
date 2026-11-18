import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { MenuApp } from "@/components/MenuApp";
import { isLocale, locales } from "@/i18n/config";
import { isKnownSlug, parseRoute, staticSlugs } from "@/lib/routes";
import { documentTitle } from "@/lib/titles";

/** Every screen × every language is prerendered (see lib/routes.ts for the URL scheme). */
export function generateStaticParams() {
  return staticSlugs.map((slug) => ({ slug }));
}

async function resolveScreen(params: PageProps<"/[lang]/[[...slug]]">["params"]) {
  const [{ slug }, locale] = await Promise.all([params, lang()]);
  if (!isLocale(locale) || !isKnownSlug(slug)) notFound();
  return { locale, path: `/${(slug ?? []).join("/")}` };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[[...slug]]">): Promise<Metadata> {
  const { locale, path } = await resolveScreen(params);
  const { view, category } = parseRoute(path);
  const suffix = path === "/" ? "" : path;
  return {
    title: { absolute: documentTitle(locale, view, category) },
    alternates: {
      canonical: `/${locale}${suffix}`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `/${l}${suffix}`])),
        "x-default": path,
      },
    },
  };
}

/**
 * Screens switch on the client through the History API inside this one route,
 * so Next's <Link>-navigation "instant" check doesn't apply here. Reading the
 * params directly keeps the whole menu inline in the prerendered HTML; the
 * layout's `ensureStatic = "navigation"` still guarantees fully static pages.
 */
export const instant = false;

export default async function Page({ params }: PageProps<"/[lang]/[[...slug]]">) {
  const { locale, path } = await resolveScreen(params);
  return <MenuApp initialLang={locale} initialPath={path} />;
}
