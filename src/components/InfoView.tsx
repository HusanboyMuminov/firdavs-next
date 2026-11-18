"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import deliveryCard from "@/assets/delivery-card.png";
import { contactUrls, mapUrls, restaurant, type DayHours } from "@/data/restaurant";
import type { Locale } from "@/i18n/config";
import { fetchThread, linkChatPush, sendChatMessage, type ChatMessage } from "@/lib/chat-client";
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
  InstagramIcon,
  MessageIcon,
  PhoneIcon,
  PinIcon,
  ScooterIcon,
  SendIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "./icons";
import { OpenStatus } from "./OpenStatus";
import { StarMark } from "./Ornament";
import styles from "./InfoView.module.css";

const MAP_LABELS: Record<"naver" | "kakao" | "google", Record<Locale, string>> = {
  naver: { uz: "Naver Map", ko: "네이버 지도", ru: "Naver Map", en: "Naver Map" },
  kakao: { uz: "Kakao Map", ko: "카카오맵", ru: "Kakao Map", en: "Kakao Map" },
  google: { uz: "Google Maps", ko: "구글 지도", ru: "Google Maps", en: "Google Maps" },
};

function Card({ icon, title, media, children }: { icon: ReactNode; title: string; media?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.card}>
      {media}
      <h2 className={styles.cardTitle}>
        <span className={styles.cardIcon}>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Opening hours, evaluated in the restaurant's time zone. When every day is the
 * same, one clear line ("Ish vaqti - har kuni 10:00-23:00gacha"); otherwise the
 * full week with today highlighted.
 */
function HoursCard({ hours }: { hours: DayHours[] }) {
  const { t } = useApp();
  const now = useNow();
  const today = now === null ? -1 : getOpenStatus(now, hours, restaurant.timeZone).today;
  const first = hours[0];
  const uniform = first && hours.every((h) => h && h.open === first.open && h.close === first.close);
  return (
    <Card icon={<ClockIcon size={19} />} title={t.info.hours}>
      {uniform ? (
        <p className={styles.hoursEveryday}>{t.info.hoursEveryday(first.open, first.close)}</p>
      ) : (
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
      )}
      {restaurant.lastOrder && <p className={styles.note}>{t.info.lastOrder(restaurant.lastOrder)}</p>}
    </Card>
  );
}

function ContactCard() {
  const { t } = useApp();
  const links = contactUrls();
  const mainInstagram = links.instagram[0];
  const actions: { key: string; href: string; label: string; icon: ReactNode; external?: boolean }[] = [
    { key: "sms", href: links.sms, label: t.info.sms, icon: <MessageIcon size={21} /> },
  ];
  if (links.telegram) {
    actions.push({ key: "telegram", href: links.telegram, label: t.info.telegram, icon: <TelegramIcon size={21} />, external: true });
  }
  if (links.whatsapp) {
    actions.push({ key: "whatsapp", href: links.whatsapp, label: t.info.whatsapp, icon: <WhatsAppIcon size={21} />, external: true });
  }
  if (mainInstagram) {
    actions.push({ key: "instagram", href: mainInstagram.url, label: t.info.instagram, icon: <InstagramIcon size={21} />, external: true });
  }

  // Every account by name, slightly larger, so guests can find and follow them.
  const socials: { kind: string; icon: ReactNode; handle: string; href: string }[] = [];
  if (links.telegram && restaurant.telegram) {
    socials.push({ kind: "telegram", icon: <TelegramIcon size={19} />, handle: `@${restaurant.telegram}`, href: links.telegram });
  }
  for (const account of links.instagram) {
    socials.push({ kind: "instagram", icon: <InstagramIcon size={19} />, handle: `@${account.user}`, href: account.url });
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
      <ul className={styles.contactGrid} data-count={actions.length}>
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
      {socials.length > 0 && (
        <ul className={styles.social} aria-label={t.info.social}>
          {socials.map((s) => (
            <li key={s.handle}>
              <a href={s.href} className={styles.socialRow} data-kind={s.kind} target="_blank" rel="noopener noreferrer">
                <span className={styles.socialIcon}>{s.icon}</span>
                <span className={styles.socialText}>
                  <span className={styles.socialName}>{s.handle}</span>
                  <span className={styles.socialKind}>{s.kind === "telegram" ? t.info.telegram : t.info.instagram}</span>
                </span>
                <ExternalIcon size={16} className={styles.socialExternal} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const twoDigits = (n: number) => String(n).padStart(2, "0");

/** "14:05" today, "18.11 14:05" on earlier days (the guest's own clock). */
function messageTime(ms: number): string {
  const d = new Date(ms);
  const time = `${twoDigits(d.getHours())}:${twoDigits(d.getMinutes())}`;
  return d.toDateString() === new Date().toDateString()
    ? time
    : `${twoDigits(d.getDate())}.${twoDigits(d.getMonth() + 1)} ${time}`;
}

/** The guest's private conversation with the restaurant (only the admin sees it). */
function ChatCard() {
  const { t, lang } = useApp();
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [push, setPush] = useState<{ status: PushStatus | "loading"; key: string | null }>({ status: "loading", key: null });
  const [pushBusy, setPushBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Opened via "Message us" (…/info#chat): bring the chat into view.
  useEffect(() => {
    if (window.location.hash === "#chat") cardRef.current?.scrollIntoView({ block: "start" });
  }, []);

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

  // Load the conversation, then check for replies while the page is visible.
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (document.visibilityState !== "visible") return;
      fetchThread()
        .then((next) => {
          if (!cancelled) setMessages(next);
        })
        .catch(() => {
          if (!cancelled) setMessages((current) => current ?? []);
        });
    };
    load();
    const timer = setInterval(load, 5_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // Keep the newest message in view (only when one arrives, not on every poll).
  const count = messages?.length ?? 0;
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [count]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = draft.trim();
    if (busy || !body) return;
    setBusy(true);
    setFailed(false);
    try {
      setMessages(await sendChatMessage(body, lang));
      setDraft("");
      if (push.status === "on") linkChatPush(); // replies can alert this device
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  // Asked only after the guest has written (and only from a tap on the button).
  const enableReplyAlerts = async () => {
    if (pushBusy || !push.key) return;
    setPushBusy(true);
    try {
      const status = await enablePush(push.key, lang);
      setPush((p) => ({ ...p, status }));
      if (status === "on") await linkChatPush();
    } catch {
      // stays off; the Notifications card explains blocked/unsupported states
    } finally {
      setPushBusy(false);
    }
  };
  const wrote = messages?.some((m) => m.sender === "guest") ?? false;

  return (
    <div id="chat" ref={cardRef} className={styles.anchor}>
    <Card icon={<MessageIcon size={19} />} title={t.chat.title}>
      <div className={styles.chatLog} ref={logRef} aria-live="polite">
        {messages?.length === 0 && (
          <p className={styles.chatEmpty}>
            {t.chat.empty}
            <span>{t.chat.emptyHint}</span>
          </p>
        )}
        {messages?.map((m) => (
          <div key={m.id} className={styles.msg} data-from={m.sender}>
            <p className={styles.msgBody}>{m.body}</p>
            <span className={styles.msgMeta}>
              {m.sender === "admin" ? t.chat.staff : t.chat.you} · {messageTime(m.createdAt)}
            </span>
          </div>
        ))}
      </div>
      <form className={styles.chatForm} onSubmit={submit}>
        <textarea
          className={styles.chatInput}
          value={draft}
          rows={1}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Desktop: Enter sends, Shift+Enter adds a line (never mid-IME, e.g. Korean).
            if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
            if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }}
          placeholder={t.chat.placeholder}
          maxLength={1000}
          aria-label={t.chat.placeholder}
        />
        <button type="submit" className={styles.chatSend} disabled={busy || !draft.trim()} aria-label={t.chat.send}>
          <SendIcon size={19} />
        </button>
      </form>
      {failed && (
        <p className={styles.error} role="alert">
          {t.chat.error}
        </p>
      )}
      {wrote && push.status === "off" && (
        <div className={styles.chatNotify}>
          <span>{t.chat.notifyPrompt}</span>
          <button type="button" className={styles.chatNotifyBtn} onClick={enableReplyAlerts} disabled={pushBusy}>
            <BellIcon size={16} />
            {pushBusy ? t.notify.working : t.chat.notifyButton}
          </button>
        </div>
      )}
      {wrote && push.status === "on" && (
        <p className={styles.notifyOn}>
          <CheckIcon size={16} />
          {t.chat.notifyOn}
        </p>
      )}
    </Card>
    </div>
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
      if (status === "on") await linkChatPush(); // reply alerts for an existing conversation
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
  const { t, lang } = useApp();
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

      <ChatCard />

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
        <Card
          icon={<ScooterIcon size={19} />}
          title={t.info.delivery}
          media={
            <Image
              src={deliveryCard}
              alt={`${restaurant.name} · ${t.info.delivery} · ${restaurant.phoneDisplay}`}
              sizes="(max-width: 520px) 92vw, 480px"
              placeholder="blur"
              className={styles.deliveryCard}
            />
          }
        >
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
    </div>
  );
}
