"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { dishes } from "@/data/menu";
import type { PhotoCredit } from "@/data/photos";
import { contactUrls, mapUrls, restaurant, type DayHours } from "@/data/restaurant";
import type { Locale } from "@/i18n/config";
import { getOpenStatus, useNow } from "@/lib/hours";
import {
  disablePush,
  enablePush,
  readPushStatus,
  updatePushLanguage,
  type PushStatus,
} from "@/lib/push-client";
import { useApp } from "./AppContext";
import { HalalSeal } from "./Headers";
import {
  BellIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  ExternalIcon,
  MessageIcon,
  PhoneIcon,
  PinIcon,
  ScooterIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "./icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { OpenStatus } from "./OpenStatus";
import { StarMark } from "./Ornament";
import styles from "./InfoView.module.css";

const MAP_LABELS: Record<"naver" | "kakao" | "google", Record<Locale, string>> = {
  naver: { uz: "Naver Map", ko: "네이버 지도", ru: "Naver Map", en: "Naver Map" },
  kakao: { uz: "Kakao Map", ko: "카카오맵", ru: "Kakao Map", en: "Kakao Map" },
  google: { uz: "Google Maps", ko: "구글 지도", ru: "Google Maps", en: "Google Maps" },
};

/** Unique photo credits for the dishes currently on the menu. */
const credits = (() => {
  const seen = new Map<string, { credit: PhotoCredit; dish: string }>();
  for (const d of dishes) {
    const c = d.photo?.credit;
    if (c && !seen.has(c.source)) seen.set(c.source, { credit: c, dish: d.name.uz });
  }
  return [...seen.values()];
})();

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>
        <span className={styles.cardIcon}>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Weekly hours with today highlighted (evaluated in the restaurant's time zone). */
function HoursCard({ hours }: { hours: DayHours[] }) {
  const { t } = useApp();
  const now = useNow();
  const today = now === null ? -1 : getOpenStatus(now, hours, restaurant.timeZone).today;
  return (
    <Card icon={<ClockIcon size={19} />} title={t.info.hours}>
      <ul className={styles.hours}>
        {hours.map((h, i) => (
          <li key={t.weekdays[i]} className={styles.hoursRow} data-today={i === today || undefined}>
            <span>
              {t.weekdays[i]}
              {i === today && <span className={styles.todayChip}>{t.info.today}</span>}
            </span>
            <span className={styles.hoursValue}>{h ? `${h.open} – ${h.close}` : t.info.closedDay}</span>
          </li>
        ))}
      </ul>
      {restaurant.lastOrder && <p className={styles.note}>{t.info.lastOrder(restaurant.lastOrder)}</p>}
    </Card>
  );
}

function ContactCard() {
  const { t } = useApp();
  const links = contactUrls();
  const actions: { key: string; href: string; label: string; icon: ReactNode; external?: boolean }[] = [
    { key: "sms", href: links.sms, label: t.info.sms, icon: <MessageIcon size={21} /> },
  ];
  if (links.telegram) {
    actions.push({ key: "telegram", href: links.telegram, label: t.info.telegram, icon: <TelegramIcon size={21} />, external: true });
  }
  if (links.whatsapp) {
    actions.push({ key: "whatsapp", href: links.whatsapp, label: t.info.whatsapp, icon: <WhatsAppIcon size={21} />, external: true });
  }

  return (
    <Card icon={<PhoneIcon size={19} />} title={t.info.contact}>
      <a href={links.call} className={styles.phone}>
        <span className={styles.phoneNumber}>{restaurant.phoneDisplay}</span>
        <span className={styles.callChip}>
          <PhoneIcon size={16} />
          {t.info.call}
        </span>
      </a>
      <ul className={styles.contactGrid}>
        {actions.map((a) => (
          <li key={a.key}>
            <a
              href={a.href}
              className={styles.contactBtn}
              data-kind={a.key}
              {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <span className={styles.contactIcon}>{a.icon}</span>
              <span className={styles.contactLabel}>{a.label}</span>
            </a>
          </li>
        ))}
      </ul>
      {restaurant.telegram && <p className={styles.note}>Telegram: @{restaurant.telegram}</p>}
    </Card>
  );
}

/** Web Push opt-in. Permission is requested only from the button tap. */
function NotificationsCard() {
  const { t, lang } = useApp();
  const [push, setPush] = useState<{ status: PushStatus | "loading"; key: string | null }>({
    status: "loading",
    key: null,
  });
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    readPushStatus()
      .then((result) => {
        if (!cancelled) setPush(result);
      })
      .catch(() => {
        if (!cancelled) setPush({ status: "unavailable", key: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Notifications can be sent per language: keep the server in sync when it changes.
  const subscribed = push.status === "on";
  useEffect(() => {
    if (subscribed) updatePushLanguage(lang).catch(() => {});
  }, [subscribed, lang]);

  if (push.status === "unavailable") return null; // not configured on the server

  const toggle = async () => {
    if (busy || !push.key) return;
    setBusy(true);
    setFailed(false);
    try {
      const status = push.status === "on" ? await disablePush() : await enablePush(push.key, lang);
      setPush((p) => ({ ...p, status }));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const note =
    push.status === "unsupported"
      ? t.notify.unsupported
      : push.status === "install"
        ? t.notify.install
        : push.status === "denied"
          ? t.notify.denied
          : null;
  const canToggle = push.status === "on" || push.status === "off" || push.status === "loading";

  return (
    <Card icon={<BellIcon size={19} />} title={t.notify.title}>
      <p className={styles.text}>{t.notify.about}</p>
      {push.status === "on" && (
        <p className={styles.notifyOn}>
          <CheckIcon size={17} />
          {t.notify.on}
        </p>
      )}
      {note && <p className={styles.notifyNote}>{note}</p>}
      {canToggle && (
        <button
          type="button"
          className={push.status === "on" ? styles.secondaryBtn : styles.primaryBtn}
          onClick={toggle}
          disabled={busy || push.status === "loading"}
          aria-busy={busy || undefined}
        >
          <BellIcon size={18} />
          {busy || push.status === "loading"
            ? t.notify.working
            : push.status === "on"
              ? t.notify.disable
              : t.notify.enable}
        </button>
      )}
      {failed && (
        <p className={styles.error} role="alert">
          {t.notify.error}
        </p>
      )}
    </Card>
  );
}

export function InfoView() {
  const { t, lang, setLang } = useApp();
  const maps = mapUrls();
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const copyAddress = async () => {
    try {
      // The Korean address is what map and taxi apps in Korea understand.
      await navigator.clipboard.writeText(restaurant.address.ko);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (e.g. insecure context) — the address stays selectable.
    }
  };

  return (
    <div className={styles.info}>
      <section className={styles.intro}>
        <HalalSeal size="sm" />
        <div>
          <p className={styles.introName}>{restaurant.name}</p>
          <p className={styles.introTag}>Halal Uzbek Cuisine</p>
        </div>
        <p className={styles.about}>{t.info.about}</p>
        <OpenStatus tone="light" />
      </section>

      <ContactCard />

      <Card icon={<PinIcon size={19} />} title={t.info.address}>
        <p className={styles.address}>{restaurant.address[lang]}</p>
        {lang !== "ko" && (
          <p className={styles.addressLocal} lang="ko">
            {restaurant.address.ko}
          </p>
        )}
        <button type="button" className={styles.linkBtn} onClick={copyAddress} aria-live="polite">
          {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          {copied ? t.info.copied : t.info.copyAddress}
        </button>
        <div className={styles.maps}>
          {(["naver", "kakao", "google"] as const).map((key) => (
            <a key={key} href={maps[key]} target="_blank" rel="noopener noreferrer" className={styles.mapBtn}>
              <span className={`${styles.mapDot} ${styles[key]}`} aria-hidden="true" />
              {MAP_LABELS[key][lang]}
            </a>
          ))}
        </div>
      </Card>

      {restaurant.hours ? (
        <HoursCard hours={restaurant.hours} />
      ) : (
        <Card icon={<ClockIcon size={19} />} title={t.info.hours}>
          <p className={styles.text}>{t.info.hoursUnknown}</p>
        </Card>
      )}

      {restaurant.delivery && (
        <Card icon={<ScooterIcon size={19} />} title={t.info.delivery}>
          <p className={styles.deliveryNote}>{t.info.deliveryNote}</p>
          {restaurant.deliveryApps.length > 0 && (
            <ul className={styles.chips}>
              {restaurant.deliveryApps.map((app) => (
                <li key={app.id} className={styles.chip}>
                  {app.label[lang]}
                </li>
              ))}
            </ul>
          )}
          <a href={contactUrls().call} className={styles.secondaryBtn}>
            <PhoneIcon size={18} />
            {t.info.deliveryCta}
          </a>
        </Card>
      )}

      <NotificationsCard />

      <Card icon={<StarMark size={19} />} title={t.info.halal}>
        <ul className={styles.points}>
          {t.info.halalPoints.map((point) => (
            <li key={point}>
              <CheckIcon size={18} className={styles.pointIcon} />
              {point}
            </li>
          ))}
        </ul>
      </Card>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>{t.info.language}</h2>
        <LanguageSwitcher lang={lang} onChange={setLang} label={t.info.language} />
      </section>

      {credits.length > 0 && (
        <details className={styles.credits}>
          <summary>{t.info.photoCredits}</summary>
          <p className={styles.note}>{t.info.photoCreditsNote}</p>
          <ul className={styles.creditList}>
            {credits.map(({ credit, dish }) => (
              <li key={credit.source}>
                <a href={credit.source} target="_blank" rel="noopener noreferrer">
                  <span lang="uz">{dish}</span> — {credit.author}, {credit.license}
                  <ExternalIcon size={13} />
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
