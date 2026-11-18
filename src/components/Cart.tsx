"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { restaurant } from "@/data/restaurant";
import { orderTotal, useCart, type CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useApp } from "./AppContext";
import { BagIcon, CheckIcon, CloseIcon, CopyIcon, MessageIcon, MinusIcon, PlusIcon, TrashIcon } from "./icons";
import styles from "./Cart.module.css";

/**
 * Ordering: dishes go into the cart → "Order" → table number → "Confirm" opens
 * the guest's own SMS app with the order written out, addressed to the
 * restaurant. A web page cannot send an SMS by itself: the guest reviews the
 * message and presses Send in their SMS app.
 */

type Phase = "cart" | "table" | "sent";

/**
 * The SMS the restaurant receives. Fixed format for the staff (Uzbek dish
 * names, whatever language the guest uses).
 */
export function orderMessage(items: readonly CartItem[], table: string): string {
  const { amount, unpriced } = orderTotal(items);
  const total =
    unpriced === 0
      ? formatPrice(amount)
      : amount > 0
        ? `${formatPrice(amount)} + items without a price`
        : "to be confirmed by staff";
  return [
    "FIRDAVS order",
    `Table: ${table}`,
    "",
    ...items.map(({ dish, qty }, i) => {
      const price = dish.price === null ? "" : ` — ${formatPrice(dish.price * qty)}`;
      return `${i + 1}. ${dish.name.uz} × ${qty}${price}`;
    }),
    "",
    `Total: ${total}`,
  ].join("\n");
}

/** sms: link with the text filled in (iOS expects "&body=", everyone else "?body="). */
function smsLink(body: string): string {
  const ios =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));
  return `sms:${restaurant.orderPhone}${ios ? "&" : "?"}body=${encodeURIComponent(body)}`;
}

/** Floating cart button (hidden while the cart is empty). */
export function CartButton({ onOpen }: { onOpen: () => void }) {
  const { t } = useApp();
  const { count, ready } = useCart();
  if (!ready || count === 0) return null;
  return (
    <button type="button" className={styles.fab} onClick={onOpen} aria-label={t.cart.open(count)}>
      <BagIcon size={21} />
      <span className={styles.fabLabel}>{t.cart.button}</span>
      <span className={styles.fabCount}>{count > 99 ? "99+" : count}</span>
    </button>
  );
}

function TotalRow({ items }: { items: readonly CartItem[] }) {
  const { t } = useApp();
  const { amount, unpriced } = orderTotal(items);
  return (
    <div className={styles.total}>
      <div className={styles.totalRow}>
        <span>{t.cart.total}</span>
        <span className={styles.totalValue}>
          {unpriced === items.length ? t.cart.totalByStaff : formatPrice(amount)}
        </span>
      </div>
      {unpriced > 0 && unpriced < items.length && <p className={styles.totalNote}>{t.cart.partialTotal}</p>}
    </div>
  );
}

export function CartSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useApp();
  const { items, changeQty, clear } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLAnchorElement>(null);
  const [phase, setPhase] = useState<Phase>("cart");
  const [table, setTable] = useState("");
  const [copied, setCopied] = useState(false);

  // Start over at the item list every time the sheet opens (adjusted during render).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPhase("cart");
      setCopied(false);
    }
  }
  if (items.length === 0 && phase === "table") setPhase("cart");

  // Mirror `open` onto the native <dialog>.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      el.scrollTop = 0;
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Escape closes through the parent so state stays in sync.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [onClose]);

  const tableNo = table.trim();
  const message = orderMessage(items, tableNo);

  const toTable = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPhase("table");
  };

  // The link itself opens the SMS app; a moment later the sheet shows what to do next.
  const sentTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(sentTimer.current), []);
  const confirm = () => {
    clearTimeout(sentTimer.current);
    sentTimer.current = setTimeout(() => setPhase("sent"), 300);
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      // Clipboard blocked — the text stays visible and selectable.
    }
  };

  const finish = () => {
    clear();
    setTable("");
    onClose();
  };

  const title = phase === "table" ? t.cart.tableTitle : phase === "sent" ? t.cart.sentTitle : t.cart.title;

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      aria-labelledby="cart-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // tap on the backdrop
      }}
    >
      <div className={styles.panel}>
        <header className={styles.head}>
          <h2 id="cart-title" className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} aria-label={t.close} onClick={onClose}>
            <CloseIcon size={22} />
          </button>
        </header>

        {phase === "sent" ? (
          <div className={styles.flow}>
            <div className={styles.sentIcon} aria-hidden="true">
              <MessageIcon size={30} />
            </div>
            <p className={styles.sentHint}>{t.cart.sentHint}</p>
            <div className={styles.fallback}>
              <p className={styles.fallbackLabel}>{t.cart.fallback(restaurant.phoneDisplay)}</p>
              <pre className={styles.message}>{message}</pre>
              <button type="button" className={styles.copyBtn} onClick={copyMessage} aria-live="polite">
                {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                {copied ? t.cart.copied : t.cart.copy}
              </button>
            </div>
            <div className={styles.footer}>
              <button type="button" className={styles.primary} onClick={finish}>
                <CheckIcon size={19} />
                {t.cart.done}
              </button>
              <a href={smsLink(message)} className={styles.ghost}>
                <MessageIcon size={17} />
                {t.cart.openAgain}
              </a>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <BagIcon size={34} />
            <p className={styles.emptyTitle}>{t.cart.empty}</p>
            <p className={styles.emptyHint}>{t.cart.emptyHint}</p>
          </div>
        ) : phase === "cart" ? (
          <form onSubmit={toTable}>
            <ul className={styles.lines}>
              {items.map(({ dish, qty }) => (
                <li key={dish.id} className={styles.line}>
                  <div className={styles.lineText}>
                    <span className={styles.lineName} lang="uz">
                      {dish.name.uz}
                    </span>
                    {lang !== "uz" && (
                      <span className={styles.lineAlt} lang={lang}>
                        {dish.name[lang]}
                      </span>
                    )}
                    {dish.price !== null && <span className={styles.linePrice}>{formatPrice(dish.price * qty)}</span>}
                  </div>
                  <div className={styles.qty}>
                    <button
                      type="button"
                      aria-label={qty === 1 ? t.cart.remove : t.cart.decrease}
                      onClick={() => changeQty(dish.id, qty - 1)}
                    >
                      {qty === 1 ? <TrashIcon size={16} /> : <MinusIcon size={16} />}
                    </button>
                    <span className={styles.qtyValue} aria-live="polite">
                      {qty}
                    </span>
                    <button type="button" aria-label={t.cart.increase} onClick={() => changeQty(dish.id, qty + 1)}>
                      <PlusIcon size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.footer}>
              <TotalRow items={items} />
              <button type="submit" className={styles.primary}>
                {t.cart.order}
              </button>
              <button type="button" className={styles.ghost} onClick={clear}>
                <TrashIcon size={16} />
                {t.cart.clear}
              </button>
            </div>
          </form>
        ) : (
          <form
            className={styles.flow}
            onSubmit={(e) => {
              // "Done"/Enter on the number pad = Confirm.
              e.preventDefault();
              confirmRef.current?.click();
            }}
          >
            <label className={styles.tableField}>
              <span className={styles.flowHint}>{t.cart.tableHint}</span>
              <input
                className={styles.tableInput}
                value={table}
                onChange={(e) => setTable(e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder={t.cart.tablePlaceholder}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                enterKeyHint="send"
                autoFocus
                aria-label={t.cart.tableTitle}
              />
            </label>
            <div className={styles.review}>
              <ul className={styles.reviewList}>
                {items.map(({ dish, qty }) => (
                  <li key={dish.id}>
                    <span lang="uz">{dish.name.uz}</span>
                    <span className={styles.reviewQty}>× {qty}</span>
                  </li>
                ))}
              </ul>
              <TotalRow items={items} />
            </div>
            <div className={styles.footer}>
              {tableNo ? (
                <a ref={confirmRef} href={smsLink(message)} className={styles.primary} onClick={confirm}>
                  <MessageIcon size={19} />
                  {t.cart.confirm}
                </a>
              ) : (
                <button type="button" className={styles.primary} disabled>
                  <MessageIcon size={19} />
                  {t.cart.confirm}
                </button>
              )}
              <p className={styles.confirmNote}>{t.cart.confirmNote}</p>
              <button type="button" className={styles.ghost} onClick={() => setPhase("cart")}>
                {t.cart.back}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}

/** "Add to cart" — a round "+" on dish cards, a full-width button in the dish sheet. */
export function AddToCartButton({
  dishId,
  variant = "full",
  className,
}: {
  dishId: string;
  variant?: "full" | "icon";
  className?: string;
}) {
  const { t } = useApp();
  const { add, qtyOf, ready } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const qty = ready ? qtyOf(dishId) : 0;

  const onAdd = () => {
    add(dishId);
    setJustAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 1100);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        className={`${styles.quickAdd} ${className ?? ""}`}
        data-added={justAdded || undefined}
        aria-label={qty > 0 ? t.cart.addOneMore(qty) : t.cart.add}
        onClick={onAdd}
      >
        {justAdded ? <CheckIcon size={18} /> : <PlusIcon size={18} />}
        {qty > 0 && (
          <span className={styles.quickCount} aria-hidden="true">
            {qty > 99 ? "99+" : qty}
          </span>
        )}
      </button>
    );
  }

  return (
    <button type="button" className={`${styles.addBtn} ${className ?? ""}`} data-added={justAdded || undefined} onClick={onAdd}>
      {justAdded ? <CheckIcon size={20} /> : <BagIcon size={20} />}
      {justAdded ? t.cart.added : t.cart.add}
      {qty > 0 && !justAdded && <span className={styles.addCount}>{t.cart.inCart(qty)}</span>}
    </button>
  );
}
