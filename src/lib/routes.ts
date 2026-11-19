import { categories, dishById, type CategoryId } from "@/data/menu";
import { isLocale } from "@/i18n/config";

/**
 * URL scheme (each path is prerendered for every language):
 *   /                  Home
 *   /menu              Full menu
 *   /menu/<category>   Menu filtered to one category, e.g. /menu/plov
 *   /favorites         Saved dishes
 *   /info              Address, hours, delivery, halal info
 *   /gallery           Photos and videos of the restaurant
 *   …?dish=<id>        Opens the dish sheet on top of any screen
 * Paths may carry a language prefix (/ko/menu); without it the proxy picks one.
 */

export type View = "home" | "menu" | "favorites" | "info" | "gallery";
export type CategoryFilter = CategoryId | "all";

export type RouteState = {
  view: View;
  category: CategoryFilter;
  dishId: string | null;
  /** "/ko" when the URL carries an explicit language, otherwise "". */
  prefix: string;
};

const categoryIds = new Set<string>(categories.map((c) => c.id));

export function isCategoryId(value: string | undefined): value is CategoryId {
  return value !== undefined && categoryIds.has(value);
}

/** Path segments (after the language) that are valid screens. */
export function isKnownSlug(slug: string[] | undefined): boolean {
  if (!slug || slug.length === 0) return true;
  const [first, second, ...rest] = slug;
  if (rest.length) return false;
  if (first === "menu") return second === undefined || isCategoryId(second);
  return second === undefined && (first === "favorites" || first === "info" || first === "gallery");
}

/** Every screen path, for static prerendering. */
export const staticSlugs: string[][] = [
  [],
  ["menu"],
  ...categories.map((c) => ["menu", c.id]),
  ["favorites"],
  ["info"],
  ["gallery"],
];

/** Parses "pathname?search" (with or without a language prefix). */
export function parseRoute(location: string): RouteState {
  const [pathname, search = ""] = location.split("?");
  const segments = pathname.split("/").filter(Boolean);
  let prefix = "";
  if (isLocale(segments[0])) prefix = `/${segments.shift()}`;

  const [first, second] = segments;
  let view: View = "home";
  let category: CategoryFilter = "all";
  if (first === "menu") {
    view = "menu";
    if (isCategoryId(second)) category = second;
  } else if (first === "favorites" || first === "info" || first === "gallery") {
    view = first;
  }

  const dish = new URLSearchParams(search).get("dish");
  return { view, category, dishId: dish && dishById.has(dish) ? dish : null, prefix };
}

export function routeHref(
  prefix: string,
  view: View,
  category: CategoryFilter = "all",
  dishId: string | null = null,
): string {
  let path = "/";
  if (view === "menu") path = category === "all" ? "/menu" : `/menu/${category}`;
  else if (view !== "home") path = `/${view}`;
  if (prefix) path = path === "/" ? prefix : prefix + path;
  return dishId ? `${path}?dish=${encodeURIComponent(dishId)}` : path;
}
