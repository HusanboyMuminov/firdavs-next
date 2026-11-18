"use client";

import { createContext, useContext, type MouseEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { UI } from "@/i18n/ui";
import type { CategoryFilter, View } from "@/lib/routes";

export type AppApi = {
  lang: Locale;
  t: UI;
  setLang: (lang: Locale) => void;
  favorites: readonly string[];
  /** False until saved favorites have been read on the client. */
  favoritesReady: boolean;
  toggleFavorite: (id: string) => void;
  /** Builds a link for a screen, keeping the current language prefix. */
  href: (view: View, category?: CategoryFilter, dishId?: string | null) => string;
  /** Link that opens a dish on top of the current screen. */
  dishHref: (id: string) => string;
  goTo: (view: View, category?: CategoryFilter) => void;
  openDish: (id: string) => void;
};

export const AppContext = createContext<AppApi | null>(null);

export function useApp(): AppApi {
  const api = useContext(AppContext);
  if (!api) throw new Error("useApp must be used inside <MenuApp>");
  return api;
}

/** Let the browser handle new-tab/window clicks; intercept plain clicks. */
export function isPlainClick(e: MouseEvent) {
  return !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
}
