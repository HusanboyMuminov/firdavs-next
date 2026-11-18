"use client";

import type { ReactNode } from "react";
import { hasPrices } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { useApp } from "./AppContext";
import { StarMark } from "./Ornament";
import styles from "./Sections.module.css";

export function SectionHeading({
  id,
  title,
  meta,
  action,
}: {
  id?: string;
  title: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.heading}>
      <StarMark size={14} filled className={styles.star} />
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      <span className={styles.rule} aria-hidden="true" />
      {meta && <span className={styles.meta}>{meta}</span>}
      {action}
    </div>
  );
}

export function MenuFooter() {
  const { t } = useApp();
  return (
    <footer className={styles.footer}>
      <StarMark size={18} className={styles.footerStar} />
      <p className={styles.claim}>{restaurant.halalClaim}</p>
      {hasPrices && <p>{t.vatIncluded}</p>}
      <p className={styles.copy}>© {restaurant.name}</p>
    </footer>
  );
}
