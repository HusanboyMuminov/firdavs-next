"use client";

import type { Dish, Tag } from "@/data/menu";
import type { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/format";
import { isPlainClick, useApp } from "./AppContext";
import { DishImage } from "./DishImage";
import { FlameIcon, HeartIcon, LeafIcon, UsersIcon } from "./icons";
import styles from "./DishCard.module.css";

/**
 * Uzbek is always the title; below it the guest's language, then Korean
 * (what staff read) — or English for Korean guests.
 */
export function otherNames(lang: Locale): [Locale, Locale] {
  if (lang === "ko") return ["ko", "en"];
  if (lang === "ru") return ["ru", "ko"];
  return ["en", "ko"];
}

/** A short "pop" on the heart when a dish is added to favorites. */
export function popHeart(button: HTMLElement, adding: boolean) {
  const icon = button.querySelector("svg");
  if (!adding || !icon || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  icon.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.38)", offset: 0.35 },
      { transform: "scale(0.9)", offset: 0.7 },
      { transform: "scale(1)" },
    ],
    { duration: 420, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  );
}

/** Tags shown to guests (`featured` only picks the Home carousel). */
export type IconTag = Exclude<Tag, "featured">;

export function iconTags(tags?: Tag[]): IconTag[] {
  return (tags ?? []).filter((tag): tag is IconTag => tag !== "featured");
}

const TAG_ICONS: Record<IconTag, typeof FlameIcon> = {
  spicy: FlameIcon,
  vegetarian: LeafIcon,
  sharing: UsersIcon,
};

export function TagIcons({ tags }: { tags: IconTag[] }) {
  const { t } = useApp();
  if (tags.length === 0) return null;
  return (
    <span className={styles.tags}>
      {tags.map((tag) => {
        const Icon = TAG_ICONS[tag];
        return (
          <span key={tag} className={`${styles.tag} ${styles[tag]}`} title={t.tags[tag]}>
            <Icon size={15} />
            <span className="visually-hidden">{t.tags[tag]}</span>
          </span>
        );
      })}
    </span>
  );
}

export function FavoriteButton({ dishId, className }: { dishId: string; className?: string }) {
  const { favorites, toggleFavorite, t } = useApp();
  const active = favorites.includes(dishId);
  return (
    <button
      type="button"
      className={`${styles.fav} ${className ?? ""}`}
      data-active={active}
      aria-label={active ? t.removeFavorite : t.addFavorite}
      onClick={(e) => {
        popHeart(e.currentTarget, !active);
        toggleFavorite(dishId);
      }}
    >
      <HeartIcon filled={active} size={18} />
    </button>
  );
}

export function DishCard({ dish, eager = false }: { dish: Dish; eager?: boolean }) {
  const { lang, dishHref, openDish } = useApp();
  const [second, third] = otherNames(lang);
  const tags = iconTags(dish.tags);
  const hasMeta = dish.price !== null || dish.portion !== undefined || tags.length > 0;

  return (
    <article className={styles.card}>
      <div className={styles.text}>
        <h3 className={styles.name} lang="uz">
          <a
            href={dishHref(dish.id)}
            className={styles.link}
            onClick={(e) => {
              if (!isPlainClick(e)) return;
              e.preventDefault();
              openDish(dish.id);
            }}
          >
            {dish.name.uz}
          </a>
        </h3>
        <p className={styles.alt} lang={second}>
          {dish.name[second]}
        </p>
        <p className={`${styles.alt} ${styles.alt3}`} lang={third}>
          {dish.name[third]}
        </p>
        <p className={styles.ingredients}>{dish.ingredients[lang]}</p>
        {hasMeta && (
          <div className={styles.meta}>
            {dish.price !== null && <span className={styles.price}>{formatPrice(dish.price)}</span>}
            {dish.portion && <span className={styles.portion}>{dish.portion[lang]}</span>}
            <TagIcons tags={tags} />
          </div>
        )}
      </div>
      <div className={styles.media}>
        <DishImage photo={dish.photo} alt="" sizes="112px" eager={eager} className={styles.image} />
        <FavoriteButton dishId={dish.id} className={styles.cardFav} />
      </div>
    </article>
  );
}
