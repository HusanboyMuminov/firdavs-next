"use client";

import { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { categories, dishes } from "@/data/menu";
import type { CategoryFilter } from "@/lib/routes";
import { searchDishes } from "@/lib/search";
import { isPlainClick, useApp } from "./AppContext";
import { DishCard } from "./DishCard";
import { SearchIcon } from "./icons";
import { StarMark } from "./Ornament";
import { MenuFooter, SectionHeading } from "./Sections";
import styles from "./MenuView.module.css";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function CategoryTabs({ active, onSearch }: { active: CategoryFilter; onSearch: () => void }) {
  const { t, lang, href, goTo } = useApp();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  // Keep the selected tab centred in the strip.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const tab = scroller?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!scroller || !tab) return;
    const left = tab.offsetLeft - (scroller.clientWidth - tab.offsetWidth) / 2;
    scroller.scrollTo({
      left: Math.max(0, left),
      behavior: firstRun.current || prefersReducedMotion() ? "auto" : "smooth",
    });
    firstRun.current = false;
  }, [active]);

  const items: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: t.all },
    ...categories.map((c) => ({ id: c.id, label: c.label[lang] })),
  ];

  return (
    <nav className={styles.tabsBar} aria-label={t.nav.menu}>
      <button type="button" className={styles.searchBtn} aria-label={t.searchLabel} onClick={onSearch}>
        <SearchIcon size={19} />
      </button>
      <div className={styles.tabs} ref={scrollerRef}>
        {items.map((item) => (
          <a
            key={item.id}
            href={href("menu", item.id)}
            className={styles.tab}
            aria-current={active === item.id ? "page" : undefined}
            onClick={(e) => {
              if (!isPlainClick(e)) return;
              e.preventDefault();
              goTo("menu", item.id);
            }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function MenuView({
  category,
  query,
  onSearchShortcut,
}: {
  category: CategoryFilter;
  query: string;
  onSearchShortcut: () => void;
}) {
  const { t, lang } = useApp();
  // Typing stays instant; results follow a moment later on slow phones.
  const trimmed = useDeferredValue(query.trim());
  const results = useMemo(() => (trimmed ? searchDishes(trimmed) : null), [trimmed]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const shownCategory = useRef(category);

  // Switching category while scrolled down: jump so the list starts under the pinned tabs.
  useLayoutEffect(() => {
    if (shownCategory.current === category) return;
    shownCategory.current = category;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const top = sentinel.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > top) window.scrollTo({ top });
  }, [category]);

  if (results) {
    return (
      <div className={styles.menu}>
        <p className={styles.resultsHead} role="status">
          {t.results(results.length, trimmed)}
        </p>
        {results.length > 0 ? (
          <ul className={styles.list}>
            {results.map((dish, i) => (
              <li key={dish.id}>
                <DishCard dish={dish} eager={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <StarMark size={40} className={styles.emptyStar} />
            <p className={styles.emptyTitle}>{t.noResults}</p>
            <p className={styles.emptyHint}>{t.noResultsHint}</p>
          </div>
        )}
        <MenuFooter />
      </div>
    );
  }

  const groups = categories
    .filter((c) => category === "all" || c.id === category)
    .map((c) => ({ category: c, items: dishes.filter((d) => d.category === c.id) }));

  return (
    <div className={styles.menu}>
      <div ref={sentinelRef} aria-hidden="true" />
      <CategoryTabs active={category} onSearch={onSearchShortcut} />
      {groups.map(({ category: c, items }, groupIndex) => (
        <section key={c.id} className={styles.group} aria-labelledby={`cat-${c.id}`}>
          <SectionHeading id={`cat-${c.id}`} title={c.label[lang]} meta={t.dishCount(items.length)} />
          <ul className={styles.list}>
            {items.map((dish, i) => (
              <li key={dish.id}>
                <DishCard dish={dish} eager={groupIndex === 0 && i < 3} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <MenuFooter />
    </div>
  );
}
