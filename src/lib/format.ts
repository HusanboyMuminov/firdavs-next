const won = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

/** 15000 → "₩15,000" (identical output on server and client). */
export function formatPrice(amount: number): string {
  return `₩${won.format(amount)}`;
}

type Priced = { price: number | null; priceTo?: number };

/** "₩10,000", "₩2,500 / ₩3,500" when it depends on the size, or null while no price is set. */
export function priceLabel(dish: Priced): string | null {
  if (dish.price === null) return null;
  return dish.priceTo ? `${formatPrice(dish.price)} / ${formatPrice(dish.priceTo)}` : formatPrice(dish.price);
}

/** The fixed unit price, or null when it isn't set or depends on the size (staff confirms it). */
export function unitPrice(dish: Priced): number | null {
  return dish.price !== null && !dish.priceTo ? dish.price : null;
}
