"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { restaurant } from "@/data/restaurant";
import { orderTotal, useCart, type CartItem } from "@/lib/cart";
import { formatPrice, priceLabel, unitPrice } from "@/lib/format";
import { useApp } from "./AppContext";
import { BagIcon, CheckIcon, CloseIcon, CopyIcon, MessageIcon, MinusIcon, PlusIcon, TrashIcon } from "./icons";
import styles from "./Cart.module.css";

/**
 * Ordering: dishes go into the cart → "Order" → table number → "Confirm".
 * The order is saved on the server and sent to the kitchen phone by SMS (via
 * the SMS provider configured on the server). If that SMS can't go out, the
 * guest is told so and can send the same text from their own phone.
 */

type Phase = "cart" | "table" | "done";
type Result = {
  order: { id: number; table: string; total: number; unpriced: number; createdAt: number };
  sms: "sent" | "failed" | "not_configured" | "pending";
  text: string;
};

const TABLE_RE = /^[1-9]\d{0,2}$/;

function newRequestId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
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

/** "₩12,000 × 2 = ₩24,000", "₩2,500 / ₩3,500" (size-dependent) or nothing (no price yet). */
function LinePrice({ item }: { item: CartItem }) {
  const unit = unitPrice(item.dish);
  if (unit !== null) {
    return (
      <span className={styles.linePrice}>
        {formatPrice(unit)} × {item.qty} = <strong>{formatPrice(unit * item.qty)}</strong>
      </span>
    );
  }
  const label = priceLabel(item.dish);
  return label ? <span className={styles.linePrice}>{label}</span> : null;
}

export function CartSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useApp();
  const { items, changeQty, clear } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [phase, setPhase] = useState<Phase>("cart");
  const [table, setTable] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelledId, setCancelledId] = useState<number | null>(null); // "Order #n was cancelled" notice
  const sending = useRef(false); // blocks a second Confirm (or Cancel) while one is on its way
  const requestId = useRef<string | null>(null); // one per order: a retried Confirm can't order twice

  // Start over at the item list every time the sheet opens (adjusted during render).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && phase !== "done") {
      setPhase("cart");
      setError(null);
      setCancelledId(null);
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

  const toTable = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    requestId.current = newRequestId(); // a new order (the cart may have changed)
    setError(null);
    setCancelledId(null);
    setPhase("table");
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending.current) return;
    if (!TABLE_RE.test(tableNo)) {
      setError(t.cart.tableInvalid);
      return;
    }
    sending.current = true;
    setBusy(true);
    setError(null);
    requestId.current ??= newRequestId();
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.current,
          table: tableNo,
          lang,
          items: items.map(({ dish, qty }) => ({ id: dish.id, qty })),
        }),
      });
      if (!response.ok) {
        const code = ((await response.json().catch(() => ({}))) as { error?: string }).error;
        setError(code === "invalid_table" ? t.cart.tableUnknown : code === "rate_limited" ? t.cart.tooMany : t.cart.failed);
        return;
      }
      const data = (await response.json()) as Result;
      setResult(data);
      setCopied(false);
      setPhase("done");
      if (data.sms === "sent") clear(); // delivered: the cart is done
    } catch {
      setError(t.cart.offline);
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };

  const copyText = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
    } catch {
      // Clipboard blocked — the text stays visible and selectable.
    }
  };

  // Cancels the saved order (its SMS never went out): the server marks it
  // cancelled so it can't be sent later. The dishes stay in the cart.
  const cancelOrder = async () => {
    if (!result || !requestId.current || sending.current) return;
    sending.current = true;
    setCancelling(true);
    setError(null);
    try {
      const response = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: requestId.current }),
      });
      // 404: the server has no such order, so there is nothing left to send either.
      if (!response.ok && response.status !== 404) {
        setError(t.cart.cancelFailed);
        return;
      }
      setCancelledId(result.order.id);
      setResult(null);
      requestId.current = null;
      setPhase("cart");
    } catch {
      setError(t.cart.offline);
    } finally {
      sending.current = false;
      setCancelling(false);
    }
  };

  const finish = () => {
    clear();
    setTable("");
    setResult(null);
    requestId.current = null;
    setPhase("cart");
    onClose();
  };

  const title =
    phase === "table"
      ? t.cart.tableTitle
      : phase === "done" && result
        ? t.cart.orderNumber(result.order.id)
        : t.cart.title;

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

        {phase === "cart" && cancelledId !== null && (
          <p className={styles.notice} role="status">
            <CheckIcon size={17} />
            {t.cart.cancelled(cancelledId)}
          </p>
        )}

        {phase === "done" && result ? (
          <div className={styles.flow} role="status">
            {result.sms === "sent" ? (
              <>
                <div className={styles.sentIcon} aria-hidden="true">
                  <CheckIcon size={30} />
                </div>
                <p className={styles.resultTitle}>{t.cart.sentTitle}</p>
                <p className={styles.sentHint}>{t.cart.sentHint(result.order.table)}</p>
              </>
            ) : (
              <>
                <div className={`${styles.sentIcon} ${styles.warnIcon}`} aria-hidden="true">
                  <MessageIcon size={28} />
                </div>
                <p className={styles.resultTitle}>{t.cart.savedTitle}</p>
                <p className={styles.sentHint}>{t.cart.savedHint(restaurant.phoneDisplay)}</p>
              </>
            )}
            <div className={styles.fallback}>
              <pre className={styles.message}>{result.text}</pre>
              {result.sms !== "sent" && (
                <button type="button" className={styles.copyBtn} onClick={copyText} aria-live="polite">
                  {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                  {copied ? t.cart.copied : t.cart.copy}
                </button>
              )}
            </div>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <div className={styles.footer}>
              {result.sms !== "sent" && (
                <div className={styles.actions}>
                  <a href={smsLink(result.text)} className={styles.primary}>
                    <MessageIcon size={19} />
                    {t.cart.sendSms}
                  </a>
                  <button
                    type="button"
                    className={styles.cancel}
                    onClick={cancelOrder}
                    disabled={cancelling}
                    aria-busy={cancelling || undefined}
                  >
                    {cancelling ? t.cart.cancelling : t.cart.cancelOrder}
                  </button>
                </div>
              )}
              <button
                type="button"
                className={result.sms === "sent" ? styles.primary : styles.ghost}
                onClick={finish}
                disabled={cancelling}
              >
                <CheckIcon size={18} />
                {t.cart.done}
              </button>
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
              {items.map((item) => {
                const { dish, qty } = item;
                return (
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
                      <LinePrice item={item} />
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
                );
              })}
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
          <form className={styles.flow} onSubmit={submit} noValidate>
            <label className={styles.tableField}>
              <span className={styles.flowHint}>{t.cart.tableHint}</span>
              <input
                className={styles.tableInput}
                value={table}
                onChange={(e) => {
                  setTable(e.target.value.replace(/\D/g, "").slice(0, 3));
                  setError(null);
                }}
                placeholder={t.cart.tablePlaceholder}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                enterKeyHint="send"
                autoFocus
                aria-label={t.cart.tableTitle}
                aria-invalid={error === t.cart.tableInvalid || error === t.cart.tableUnknown || undefined}
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
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <div className={styles.footer}>
              <button type="submit" className={styles.primary} disabled={busy || !tableNo} aria-busy={busy || undefined}>
                <CheckIcon size={19} />
                {busy ? t.cart.sending : t.cart.confirm}
              </button>
              <p className={styles.confirmNote}>{t.cart.confirmNote}</p>
              <button type="button" className={styles.ghost} onClick={() => setPhase("cart")} disabled={busy}>
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
