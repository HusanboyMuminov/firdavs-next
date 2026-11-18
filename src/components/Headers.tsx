"use client";

import { restaurant } from "@/data/restaurant";
import { isPlainClick, useApp } from "./AppContext";
import { ScooterIcon } from "./icons";
import { LanguagePicker } from "./LanguageSwitcher";
import { StarMark } from "./Ornament";
import styles from "./Headers.module.css";

function HeaderLanguage() {
  const { lang, setLang, t } = useApp();
  return <LanguagePicker lang={lang} onChange={setLang} label={t.changeLanguage} />;
}

export function HalalSeal({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <div className={`${styles.seal} ${size === "sm" ? styles.sealSm : styles.sealLg}`} role="img" aria-label="100% Halal">
      <span className={styles.sealPct} aria-hidden="true">
        100%
      </span>
      <span className={styles.sealWord} aria-hidden="true">
        Halal
      </span>
    </div>
  );
}

/** Full brand header for the Home screen. */
export function BrandHeader() {
  const { t } = useApp();
  return (
    <header className={styles.brand}>
      <div className={styles.utility}>
        {restaurant.delivery && (
          <span className={styles.delivery}>
            <ScooterIcon size={16} />
            <span className={styles.deliveryText}>{t.deliveryAvailable}</span>
          </span>
        )}
        <HeaderLanguage />
      </div>
      <div className={styles.lockup}>
        <StarMark size={46} className={styles.mark} />
        <h1 className={styles.wordmark}>
          <span className={styles.name}>Firdavs</span>{" "}
          <span className={styles.restaurant}>Restaurant</span>
        </h1>
        <HalalSeal />
      </div>
      <p className={styles.tagline}>
        <span>Halal Uzbek Cuisine</span>
      </p>
    </header>
  );
}

/** Compact bar for Menu / Favorites / Info. */
export function AppBar({ title }: { title: string }) {
  const { href, goTo } = useApp();
  return (
    <header className={styles.bar}>
      <a
        href={href("home")}
        className={styles.barHome}
        aria-label={restaurant.name}
        onClick={(e) => {
          if (!isPlainClick(e)) return;
          e.preventDefault();
          goTo("home");
        }}
      >
        <StarMark size={28} />
      </a>
      <h1 className={styles.barTitle}>{title}</h1>
      <HeaderLanguage />
    </header>
  );
}
