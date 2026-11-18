import Link from "next/link";
import { StarMark } from "@/components/Ornament";
import { restaurant } from "@/data/restaurant";
import { ui } from "@/i18n/ui";

/** Shown for unknown paths. In all four languages, since the language may be unknown here. */
export default function NotFound() {
  return (
    <main className="nf-page">
      <StarMark size={48} className="nf-star" />
      <h1 className="nf-title">{ui.en.notFoundTitle}</h1>
      <p lang="uz">{ui.uz.notFoundTitle}</p>
      <p lang="ko">{ui.ko.notFoundTitle}</p>
      <p lang="ru">{ui.ru.notFoundTitle}</p>
      <Link href="/" className="nf-cta">
        {restaurant.name} →
      </Link>
    </main>
  );
}
