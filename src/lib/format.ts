const won = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

/** 15000 → "₩15,000" (identical output on server and client). */
export function formatPrice(amount: number): string {
  return `₩${won.format(amount)}`;
}
