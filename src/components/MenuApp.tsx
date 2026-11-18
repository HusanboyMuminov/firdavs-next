"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { dishById } from "@/data/menu";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { ui } from "@/i18n/ui";
import { useFavorites } from "@/lib/favorites";
import { back, navigate, useLocation } from "@/lib/history";
import { usePresence } from "@/lib/presence";
import { parseRoute, routeHref, type CategoryFilter, type View } from "@/lib/routes";
import { documentTitle } from "@/lib/titles";
import { AppContext, type AppApi } from "./AppContext";
import { BottomNav } from "./BottomNav";
import { DishSheet } from "./DishSheet";
import { FavoritesView } from "./FavoritesView";
import { AppBar, BrandHeader } from "./Headers";
import { HomeView } from "./HomeView";
import { InfoView } from "./InfoView";
import { MenuView } from "./MenuView";
import { SearchBar } from "./SearchBar";
import styles from "./MenuApp.module.css";

type Props = {
  initialLang: Locale;
  /** Screen path the server rendered, without language prefix, e.g. "/menu/plov". */
  initialPath: string;
};

export function MenuApp({ initialLang, initialPath }: Props) {
  const [lang, setLangState] = useState<Locale>(initialLang);
  const [query, setQuery] = useState("");
  const location = useLocation(initialPath);
  const { view, category, dishId, prefix } = useMemo(() => parseRoute(location), [location]);
  const { ids: favorites, ready: favoritesReady, toggle: toggleFavorite } = useFavorites();
  const searchRef = useRef<HTMLInputElement>(null);
  const t = ui[lang];

  /* ── Scroll position per screen ─────────────────────────────────────── */
  const screenKey = `${view}:${category}`;
  const scrollMemory = useRef(new Map<string, number>());
  const pendingScroll = useRef<number | null>(null);
  const shown = useRef({ view, key: screenKey });

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    const save = () => scrollMemory.current.set(shown.current.key, window.scrollY);
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, []);

  useLayoutEffect(() => {
    const previousView = shown.current.view;
    shown.current = { view, key: screenKey };
    if (previousView === view) return; // category switches are handled inside MenuView
    if (view === "home") searchRef.current?.blur();
    const target = pendingScroll.current ?? scrollMemory.current.get(screenKey) ?? 0;
    pendingScroll.current = null;
    window.scrollTo(0, target);
  }, [view, screenKey]);

  useEffect(() => {
    document.title = documentTitle(lang, view, category);
  }, [lang, view, category]);

  // Anonymous live counter + screen views for the admin dashboard.
  usePresence(routeHref("", view, category), dishId, lang);

  /* ── Navigation ─────────────────────────────────────────────────────── */
  const href = useCallback(
    (v: View, c: CategoryFilter = "all", d: string | null = null) => routeHref(prefix, v, c, d),
    [prefix],
  );

  const dishHref = useCallback(
    (id: string) => routeHref(prefix, view, category, id),
    [prefix, view, category],
  );

  const goTo = useCallback(
    (next: View, nextCategory: CategoryFilter = "all") => {
      const target = routeHref(prefix, next, nextCategory);
      if (next === view) {
        if (next === "menu" && query) setQuery("");
        if (next === "menu" && nextCategory !== category) navigate(target);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (next === "menu" && nextCategory !== "all") pendingScroll.current = 0;
      if (next === "home") {
        setQuery("");
        back("view", target); // pop back to Home instead of stacking history
      } else {
        navigate(target, view === "home" ? "view" : undefined);
      }
    },
    [prefix, view, category, query],
  );

  const openDish = useCallback(
    (id: string) => navigate(routeHref(prefix, view, category, id), "dish"),
    [prefix, view, category],
  );

  const closeDish = useCallback(
    () => back("dish", routeHref(prefix, view, category)),
    [prefix, view, category],
  );

  /* ── Search ─────────────────────────────────────────────────────────── */
  // Focusing search on Home opens the Menu screen; the input stays mounted
  // (same position in the tree), so focus and the keyboard are preserved.
  const onSearchFocus = useCallback(() => {
    if (view !== "home") return;
    pendingScroll.current = 0;
    navigate(routeHref(prefix, "menu"), "view");
  }, [view, prefix]);

  const focusSearch = useCallback(() => {
    window.scrollTo({ top: 0 });
    searchRef.current?.focus({ preventScroll: true });
  }, []);

  /* ── Language ───────────────────────────────────────────────────────── */
  const setLang = useCallback(
    (next: Locale) => {
      setLangState(next);
      document.documentElement.lang = next;
      const secure = window.location.protocol === "https:" ? "; secure" : "";
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax${secure}`;
      if (prefix) {
        // The URL names a language explicitly (/en/menu) — keep it truthful.
        const { pathname, search } = window.location;
        navigate(`/${next}${pathname.slice(prefix.length)}${search}`);
      }
    },
    [prefix],
  );

  const api = useMemo<AppApi>(
    () => ({
      lang,
      t,
      setLang,
      favorites,
      favoritesReady,
      toggleFavorite,
      href,
      dishHref,
      goTo,
      openDish,
    }),
    [lang, t, setLang, favorites, favoritesReady, toggleFavorite, href, dishHref, goTo, openDish],
  );

  const selectedDish = dishId ? (dishById.get(dishId) ?? null) : null;
  const barTitle = view === "favorites" ? t.favoritesTitle : view === "info" ? t.info.title : t.nav.menu;

  return (
    <AppContext.Provider value={api}>
      <div className={styles.app}>
        <div className={styles.top} data-tone={view === "home" ? "dark" : "light"}>
          {view === "home" ? <BrandHeader /> : <AppBar title={barTitle} />}
          {(view === "home" || view === "menu") && (
            <div className={styles.searchSlot}>
              <SearchBar
                value={query}
                onChange={setQuery}
                onFocus={onSearchFocus}
                inputRef={searchRef}
                tone={view === "home" ? "dark" : "light"}
              />
            </div>
          )}
        </div>

        <main className={styles.main}>
          {view === "home" && <HomeView />}
          {view === "menu" && (
            <MenuView category={category} query={query} onSearchShortcut={focusSearch} />
          )}
          {view === "favorites" && <FavoritesView />}
          {view === "info" && <InfoView />}
        </main>

        <BottomNav view={view} />
        <DishSheet dish={selectedDish} onClose={closeDish} />
      </div>
    </AppContext.Provider>
  );
}
