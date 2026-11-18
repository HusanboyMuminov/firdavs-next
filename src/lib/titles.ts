import { categories } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import type { Locale } from "@/i18n/config";
import { ui } from "@/i18n/ui";
import type { CategoryFilter, View } from "./routes";

/** Heading for a screen (null on Home, which shows the brand instead). */
export function screenTitle(lang: Locale, view: View, category: CategoryFilter = "all"): string | null {
  const t = ui[lang];
  switch (view) {
    case "home":
      return null;
    case "menu":
      return category === "all"
        ? t.nav.menu
        : (categories.find((c) => c.id === category)?.label[lang] ?? t.nav.menu);
    case "favorites":
      return t.favoritesTitle;
    case "info":
      return t.info.title;
  }
}

export function documentTitle(lang: Locale, view: View, category: CategoryFilter = "all"): string {
  const title = screenTitle(lang, view, category);
  return title ? `${title} · ${restaurant.name}` : ui[lang].metaTitle;
}
