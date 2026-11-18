"use client";

import type { ReactNode } from "react";
import { restaurant } from "@/data/restaurant";
import type { View } from "@/lib/routes";
import { isPlainClick, useApp } from "./AppContext";
import { HeartIcon, HomeIcon, InfoIcon, MenuIcon } from "./icons";
import styles from "./BottomNav.module.css";

export function BottomNav({ view }: { view: View }) {
  const { t, href, goTo, favorites } = useApp();

  const items: { id: View; label: string; icon: (active: boolean) => ReactNode; badge?: number }[] = [
    { id: "home", label: t.nav.home, icon: () => <HomeIcon size={23} /> },
    { id: "menu", label: t.nav.menu, icon: () => <MenuIcon size={23} /> },
    {
      id: "favorites",
      label: t.nav.favorites,
      icon: (active) => <HeartIcon size={23} filled={active} />,
      badge: favorites.length,
    },
    { id: "info", label: t.nav.info, icon: () => <InfoIcon size={23} /> },
  ];

  return (
    <nav className={styles.nav} aria-label={restaurant.name}>
      <ul className={styles.list}>
        {items.map((item) => {
          const active = view === item.id;
          return (
            <li key={item.id}>
              <a
                href={href(item.id)}
                className={styles.item}
                aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  if (!isPlainClick(e)) return;
                  e.preventDefault();
                  goTo(item.id);
                }}
              >
                <span className={styles.icon}>
                  {item.icon(active)}
                  {item.badge ? (
                    <span className={styles.badge} aria-hidden="true">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </span>
                <span className={styles.label}>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
