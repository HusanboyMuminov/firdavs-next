import { useCallback, useSyncExternalStore } from "react";
import { dishById } from "@/data/menu";

/**
 * Favorites, saved in this browser (localStorage) and shared live between
 * every component and open tab. Only ids of dishes that are still on the menu
 * are kept, each once — so the badge count always matches the list.
 */

const KEY = "firdavs:favorites";
const EMPTY: readonly string[] = [];
const listeners = new Set<() => void>();
let cache: readonly string[] | null = null;

function clean(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return EMPTY;
  const ids = new Set<string>();
  for (const id of value) {
    if (typeof id === "string" && dishById.has(id)) ids.add(id);
  }
  return ids.size ? [...ids] : EMPTY;
}

function read(): readonly string[] {
  if (cache) return cache;
  try {
    cache = clean(JSON.parse(window.localStorage.getItem(KEY) ?? "[]"));
  } catch {
    cache = EMPTY; // storage disabled (private mode) or corrupted — start empty
  }
  return cache;
}

function write(next: readonly string[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: keep favorites for this session only.
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) {
      cache = null; // changed in another tab
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** `ready` is false during SSR/hydration, when saved favorites aren't known yet. */
export function useFavorites() {
  const ids = useSyncExternalStore<readonly string[] | null>(subscribe, read, () => null);
  const toggle = useCallback((id: string) => {
    if (!dishById.has(id)) return;
    const current = read();
    write(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }, []);
  return { ids: ids ?? EMPTY, ready: ids !== null, toggle };
}
