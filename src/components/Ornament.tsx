/** Eight-point star (khatam) — the geometric motif of Uzbek tilework. */
const STAR_POINTS =
  "12,2 13.99,7.2 19.07,4.93 16.8,10.01 22,12 16.8,13.99 19.07,19.07 13.99,16.8 12,22 10.01,16.8 4.93,19.07 7.2,13.99 2,12 7.2,10.01 4.93,4.93 10.01,7.2";

export function StarMark({
  size = 24,
  className,
  filled = false,
}: {
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <polygon
        points={STAR_POINTS}
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.3}
        strokeLinejoin="round"
      />
      {!filled && <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth={1.1} />}
    </svg>
  );
}
