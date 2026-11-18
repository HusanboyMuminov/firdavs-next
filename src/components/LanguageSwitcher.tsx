"use client";

import { isLocale, localeLabels, localeNames, locales, type Locale } from "@/i18n/config";
import { ChevronDownIcon, GlobeIcon } from "./icons";
import styles from "./LanguageSwitcher.module.css";

type Props = {
  lang: Locale;
  onChange: (lang: Locale) => void;
  /** Accessible name, e.g. "Change language". */
  label: string;
};

/**
 * Compact picker for the headers: a chip showing the current language over a
 * native <select>, so phones open their own language list (accessible, and
 * fits any header width).
 */
export function LanguagePicker({ lang, onChange, label }: Props) {
  return (
    <div className={styles.picker}>
      <GlobeIcon size={16} />
      <span className={styles.pickerValue} lang={lang} aria-hidden="true">
        {localeLabels[lang]}
      </span>
      <ChevronDownIcon size={14} className={styles.chevron} />
      <select
        className={styles.select}
        value={lang}
        aria-label={label}
        onChange={(e) => {
          if (isLocale(e.target.value)) onChange(e.target.value);
        }}
      >
        {locales.map((l) => (
          <option key={l} value={l} lang={l}>
            {localeNames[l]}
          </option>
        ))}
      </select>
    </div>
  );
}

/** All four languages side by side (Info screen). */
export function LanguageSwitcher({ lang, onChange, label }: Props) {
  return (
    <div className={styles.switcher} role="group" aria-label={label}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          className={styles.option}
          aria-pressed={l === lang}
          onClick={() => onChange(l)}
        >
          {localeNames[l]}
        </button>
      ))}
    </div>
  );
}
