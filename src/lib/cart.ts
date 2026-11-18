import { useCallback, useSyncExternalStore } from "react";
import { dishById, type Dish } from "@/data/menu";
import { unitPrice } from "./format";

/**
 * The guest's order basket, saved in this browser (localStorage) and shared
 * live between every component and open tab — same pattern as favorites.
 * Only dishes still on the menu are kept; quantities are clamped to 1…99.
 */

export type CartLine = { id: string; qty: number };
export type CartItem = { dish: Dish; qty: number };

const KEY = "firdavs:cart";
const MAX_QTY = 99;
const EMPTY: readonly CartLine[] = [];
const listeners = new Set<() => void>();
let cache: readonly CartLine[] | null = null;

const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(n)));

function clean(value: unknown): readonly CartLine[] {
  if (!Array.isArray(value)) return EMPTY;
  const byId = new Map<string, number>();
  for (const line of value) {
    if (!line || typeof line !== "object") continue;
    const { id, qty } = line as Partial<CartLine>;
    if (typeof id === "string" && dishById.has(id) && typeof qty === "number" && qty > 0) {
      byId.set(id, clampQty((byId.get(id) ?? 0) + qty));
    }
  }
  return byId.size ? [...byId].map(([id, qty]) => ({ id, qty })) : EMPTY;
}

function read(): readonly CartLine[] {
  if (cache) return cache;
  try {
    cache = clean(JSON.parse(window.localStorage.getItem(KEY) ?? "[]"));
  } catch {
    cache = EMPTY; // storage disabled (private mode) or corrupted — start empty
  }
  return cache;
}

function write(next: readonly CartLine[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: keep the cart for this visit only.
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

function setQty(id: string, qty: number) {
  if (!dishById.has(id)) return;
  const current = read();
  if (qty <= 0) {
    write(current.filter((l) => l.id !== id));
    return;
  }
  const next = clampQty(qty);
  write(
    current.some((l) => l.id === id)
      ? current.map((l) => (l.id === id ? { id, qty: next } : l))
      : [...current, { id, qty: next }],
  );
}

export type OrderTotal = {
  /** Sum of the items that have a price. */
  amount: number;
  /** Items (lines) without a price yet — the total is then incomplete. */
  unpriced: number;
};

export function orderTotal(items: readonly CartItem[]): OrderTotal {
  let amount = 0;
  let unpriced = 0;
  for (const { dish, qty } of items) {
    const unit = unitPrice(dish); // null: not set yet, or depends on the size
    if (unit === null) unpriced += 1;
    else amount += unit * qty;
  }
  return { amount, unpriced };
}

/** `ready` is false during SSR/hydration, while the saved cart isn't known yet. */
export function useCart() {
  const lines = useSyncExternalStore<readonly CartLine[] | null>(subscribe, read, () => null);

  const add = useCallback((id: string) => {
    setQty(id, (read().find((l) => l.id === id)?.qty ?? 0) + 1);
  }, []);
  const changeQty = useCallback((id: string, qty: number) => setQty(id, qty), []);
  const clear = useCallback(() => write(EMPTY), []);

  const items: CartItem[] = [];
  for (const line of lines ?? EMPTY) {
    const dish = dishById.get(line.id);
    if (dish) items.push({ dish, qty: line.qty });
  }
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const qtyOf = (id: string) => items.find((item) => item.dish.id === id)?.qty ?? 0;

  return { items, count, qtyOf, ready: lines !== null, add, changeQty, clear };
}
