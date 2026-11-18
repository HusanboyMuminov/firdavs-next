"use client";

import { dishes } from "@/data/menu";
import { isPlainClick, useApp } from "./AppContext";
import { DishCard } from "./DishCard";
import { HeartIcon } from "./icons";
import { MenuFooter } from "./Sections";
import styles from "./FavoritesView.module.css";

export function FavoritesView() {
  const { t, favorites, favoritesReady, href, goTo } = useApp();

  // Saved favorites live in this browser only — render nothing until they're read.
  if (!favoritesReady) return <div className={styles.favs} aria-busy="true" />;

  // Menu order reads naturally when showing the list to a server.
  const saved = dishes.filter((d) => favorites.includes(d.id));

  if (saved.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <HeartIcon size={30} />
        </span>
        <p className={styles.emptyTitle}>{t.favoritesEmpty}</p>
        <p className={styles.emptyHint}>{t.favoritesEmptyHint}</p>
        <a
          href={href("menu")}
          className={styles.cta}
          onClick={(e) => {
            if (!isPlainClick(e)) return;
            e.preventDefault();
            goTo("menu");
          }}
        >
          {t.browseMenu}
        </a>
      </div>
    );
  }

  return (
    <div className={styles.favs}>
      <p className={styles.subtitle}>{t.favoritesSubtitle}</p>
      <ul className={styles.list}>
        {saved.map((dish, i) => (
          <li key={dish.id}>
            <DishCard dish={dish} eager={i < 3} />
          </li>
        ))}
      </ul>
      <MenuFooter />
    </div>
  );
}
