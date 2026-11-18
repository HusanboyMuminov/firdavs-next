"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent,
} from "react";
import type { Dish } from "@/data/menu";
import { priceLabel } from "@/lib/format";
import { useApp } from "./AppContext";
import { AddToCartButton } from "./Cart";
import { iconTags, otherNames, popHeart, type IconTag } from "./DishCard";
import { DishImage } from "./DishImage";
import { CloseIcon, FlameIcon, HeartIcon, LeafIcon, UsersIcon } from "./icons";
import styles from "./DishSheet.module.css";

const CLOSE_DISTANCE = 110; // px dragged down
const CLOSE_VELOCITY = 0.65; // px per ms (a quick flick)

const TAG_ICON: Record<IconTag, typeof FlameIcon> = {
  spicy: FlameIcon,
  vegetarian: LeafIcon,
  sharing: UsersIcon,
};

export function DishSheet({ dish, onClose }: { dish: Dish | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ startY: number; startT: number; dy: number } | null>(null);

  // Keep showing the last dish while the sheet animates closed.
  const [shown, setShown] = useState<Dish | null>(dish);
  if (dish !== null && dish !== shown) setShown(dish);

  const open = dish !== null;
  const requestClose = useEffectEvent(() => onClose());

  // The URL decides whether the sheet is open; mirror it onto the <dialog>.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.style.removeProperty("transform");
      el.style.removeProperty("transition");
      el.showModal();
      el.scrollTop = 0;
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Escape: close through the URL so history stays in sync.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      requestClose();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, []);

  /* ── Drag down to dismiss (on the photo / grab bar) ── */
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { startY: e.clientY, startT: e.timeStamp, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    dialogRef.current?.style.setProperty("transition", "none");
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = dialogRef.current;
    if (!d || !el) return;
    d.dy = Math.max(0, e.clientY - d.startY);
    el.style.transform = `translateY(${d.dy}px)`;
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current;
    const el = dialogRef.current;
    drag.current = null;
    if (!d || !el) return;
    const velocity = d.dy / Math.max(1, e.timeStamp - d.startT);
    if (!cancelled && d.dy > 8 && (d.dy > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY)) {
      el.style.transition =
        "transform 0.22s ease-in, overlay 0.22s allow-discrete, display 0.22s allow-discrete";
      el.style.transform = "translateY(100%)";
      onClose();
    } else {
      el.style.removeProperty("transition");
      el.style.removeProperty("transform");
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      aria-labelledby="sheet-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // tap on the backdrop
      }}
    >
      {shown && (
        <SheetContent
          dish={shown}
          onClose={onClose}
          dragHandlers={{
            onPointerDown,
            onPointerMove,
            onPointerUp: (e) => endDrag(e, false),
            onPointerCancel: (e) => endDrag(e, true),
          }}
        />
      )}
    </dialog>
  );
}

function SheetContent({
  dish,
  onClose,
  dragHandlers,
}: {
  dish: Dish;
  onClose: () => void;
  dragHandlers: Pick<
    HTMLAttributes<HTMLDivElement>,
    "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
  >;
}) {
  const { t, lang, favorites, toggleFavorite } = useApp();
  const [second, third] = otherNames(lang);
  const saved = favorites.includes(dish.id);
  const tags = iconTags(dish.tags);

  return (
    <div className={styles.panel}>
      <div className={styles.dragZone} {...dragHandlers}>
        <div className={styles.grabber} aria-hidden="true">
          <span />
        </div>
        <DishImage
          photo={dish.photo}
          alt=""
          sizes="(max-width: 520px) 100vw, 520px"
          eager
          className={styles.image}
        />
        <button type="button" className={styles.close} aria-label={t.close} onClick={onClose}>
          <CloseIcon size={22} />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <div className={styles.names}>
            <h2 id="sheet-title" className={styles.name} lang="uz">
              {dish.name.uz}
            </h2>
            <p className={styles.alt} lang={second}>
              {dish.name[second]}
            </p>
            <p className={styles.alt3} lang={third}>
              {dish.name[third]}
            </p>
          </div>
          {dish.price !== null && <p className={styles.price}>{priceLabel(dish)}</p>}
        </div>

        {(tags.length > 0 || dish.portion) && (
          <ul className={styles.chips}>
            {tags.map((tag) => {
              const Icon = TAG_ICON[tag];
              return (
                <li key={tag} className={`${styles.chip} ${styles[tag]}`}>
                  <Icon size={15} />
                  {t.tags[tag]}
                </li>
              );
            })}
            {dish.portion && (
              <li className={styles.chip}>
                {t.portion}: {dish.portion[lang]}
              </li>
            )}
          </ul>
        )}

        <p className={styles.description}>{dish.description[lang]}</p>

        <h3 className={styles.subhead}>{t.ingredients}</h3>
        <p className={styles.ingredients}>{dish.ingredients[lang]}</p>
      </div>

      <div className={styles.actions}>
        <div className={styles.actionRow}>
          <AddToCartButton dishId={dish.id} />
          <button
            type="button"
            className={styles.favSquare}
            data-active={saved}
            aria-pressed={saved}
            aria-label={saved ? t.removeFavorite : t.addFavorite}
            onClick={(e) => {
              toggleFavorite(dish.id);
              popHeart(e.currentTarget, !saved);
            }}
          >
            <HeartIcon size={22} filled={saved} />
          </button>
        </div>
      </div>
    </div>
  );
}
