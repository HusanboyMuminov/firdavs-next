"use client";

import type { RefObject } from "react";
import { useApp } from "./AppContext";
import { CloseIcon, SearchIcon } from "./icons";
import styles from "./SearchBar.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  tone: "dark" | "light";
};

export function SearchBar({ value, onChange, onFocus, inputRef, tone }: Props) {
  const { t } = useApp();
  return (
    <form
      role="search"
      className={`${styles.form} ${tone === "dark" ? styles.dark : styles.light}`}
      onSubmit={(e) => {
        e.preventDefault();
        inputRef.current?.blur(); // hide the keyboard to reveal results
      }}
    >
      <label htmlFor="dish-search" className="visually-hidden">
        {t.searchLabel}
      </label>
      <SearchIcon size={20} className={styles.icon} />
      <input
        ref={inputRef}
        id="dish-search"
        className={styles.input}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={t.searchPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
      />
      {value && (
        <button
          type="button"
          className={styles.clear}
          aria-label={t.clearSearch}
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
        >
          <CloseIcon size={18} />
        </button>
      )}
    </form>
  );
}
