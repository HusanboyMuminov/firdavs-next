"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { categories, dishById } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { LOCALE_COOKIE, isLocale, localeLabels, localeNames, locales, type Locale } from "@/i18n/config";
import { ui, type UI } from "@/i18n/ui";
import { formatAgo } from "@/lib/intl";
import type { Stats } from "@/server/analytics";
import { ActivityIcon, ArrowIcon, BellIcon, LogoutIcon, MessageIcon, SendIcon } from "../icons";
import { LanguagePicker } from "../LanguageSwitcher";
import { StarMark } from "../Ornament";
import { DailyChart, RankedBars } from "./AdminCharts";
import styles from "./AdminApp.module.css";

type AdminStats = Stats & { pushEnabled: boolean };
type Phase = "loading" | "unconfigured" | "login" | "dashboard" | "error";

const POLL_MS = 5_000;

/* ── Page visibility (polling pauses while the tab is hidden) ───────────── */
function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
const isVisible = () => document.visibilityState === "visible";

/* ── Labels ─────────────────────────────────────────────────────────────── */
const SCREEN_PATHS = ["/", "/menu", ...categories.map((c) => `/menu/${c.id}`), "/favorites", "/info"];

function screenLabel(path: string, t: UI, lang: Locale): string {
  if (path === "/") return t.nav.home;
  if (path === "/menu") return t.nav.menu;
  if (path === "/favorites") return t.nav.favorites;
  if (path === "/info") return t.nav.info;
  const category = categories.find((c) => path === `/menu/${c.id}`);
  return category ? `${t.nav.menu} · ${category.label[lang]}` : path;
}

function languageLabel(code: string): string {
  return isLocale(code) ? localeNames[code] : code;
}

async function postJson(url: string, body?: unknown): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function AdminApp({ initialLang }: { initialLang: Locale }) {
  const [lang, setLangState] = useState<Locale>(initialLang);
  const [phase, setPhase] = useState<Phase>("loading");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const visible = useSyncExternalStore(subscribeVisibility, isVisible, () => true);
  const t = ui[lang];

  const setLang = (next: Locale) => {
    setLangState(next);
    document.documentElement.lang = next;
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax${secure}`;
    const { pathname } = window.location;
    const [, first, ...rest] = pathname.split("/");
    if (isLocale(first)) window.history.replaceState(window.history.state, "", `/${[next, ...rest].join("/")}`);
  };

  useEffect(() => {
    document.title = `${t.admin.title} · ${restaurant.name}`;
  }, [t]);

  // Who is this? (The session cookie is HttpOnly; only the server can tell.)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ configured: boolean; authenticated: boolean }>) : Promise.reject(r)))
      .then((s) => {
        if (!cancelled) setPhase(!s.configured ? "unconfigured" : s.authenticated ? "dashboard" : "login");
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Live statistics: poll while the dashboard is open and the tab is visible.
  useEffect(() => {
    if (phase !== "dashboard" || !visible) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const response = await fetch("/api/admin/stats", { cache: "no-store" });
        if (cancelled) return;
        if (response.status === 401) {
          setStats(null);
          setPhase("login"); // session expired
          return;
        }
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as AdminStats;
        if (cancelled) return;
        setStats(data);
        setLoadFailed(false);
      } catch {
        if (!cancelled) setLoadFailed(true);
      }
      if (!cancelled) timer = setTimeout(load, POLL_MS);
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase, visible]);

  const signOut = async () => {
    await postJson("/api/admin/logout").catch(() => {});
    setStats(null);
    setPhase("login");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href={`/${lang}`} className={styles.brand} aria-label={t.admin.openMenu}>
            <StarMark size={26} />
            <span className={styles.brandText}>
              <span className={styles.brandName}>{restaurant.name}</span>
              <span className={styles.brandTitle}>{t.admin.title}</span>
            </span>
          </a>
          <div className={styles.headerActions}>
            <LanguagePicker lang={lang} onChange={setLang} label={t.changeLanguage} />
            {phase === "dashboard" && (
              <button type="button" className={styles.iconBtn} onClick={signOut} aria-label={t.admin.signOut} title={t.admin.signOut}>
                <LogoutIcon size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {phase === "loading" && <div className={styles.loading} aria-busy="true" />}
        {phase === "error" && <Notice>{t.admin.loadError}</Notice>}
        {phase === "unconfigured" && <Notice>{t.admin.notConfigured}</Notice>}
        {phase === "login" && <LoginForm t={t} onSuccess={() => setPhase("dashboard")} onUnconfigured={() => setPhase("unconfigured")} />}
        {phase === "dashboard" &&
          (stats ? (
            <Dashboard stats={stats} lang={lang} t={t} live={visible} failed={loadFailed} />
          ) : loadFailed ? (
            <Notice>{t.admin.loadError}</Notice>
          ) : (
            <div className={styles.loading} aria-busy="true" />
          ))}
      </main>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <p className={styles.notice} role="status">
      {children}
    </p>
  );
}

function LoginForm({ t, onSuccess, onUnconfigured }: { t: UI; onSuccess: () => void; onUnconfigured: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError(null);
    try {
      const response = await postJson("/api/admin/login", { password });
      if (response.ok) {
        setPassword("");
        onSuccess();
        return;
      }
      if (response.status === 503) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        if (body?.error === "not_configured") {
          onUnconfigured();
          return;
        }
      }
      setError(response.status === 401 ? t.admin.wrongPassword : response.status === 429 ? t.admin.tooMany : t.notify.error);
    } catch {
      setError(t.notify.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.login} onSubmit={submit}>
      <StarMark size={40} className={styles.loginStar} />
      <h1 className={styles.loginTitle}>{t.admin.title}</h1>
      <p className={styles.loginSub}>{t.admin.subtitle}</p>
      {/* Single shared admin account: lets password managers file the password under a name. */}
      <input type="text" name="username" autoComplete="username" value="admin" readOnly hidden />
      <label className={styles.field}>
        <span>{t.admin.password}</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          maxLength={200}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "login-error" : undefined}
        />
      </label>
      {error && (
        <p id="login-error" className={styles.formError} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={styles.primaryBtn} disabled={busy || !password}>
        {busy ? t.admin.signingIn : t.admin.signIn}
      </button>
    </form>
  );
}

function Card({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`${styles.card} ${wide ? styles.wide : ""}`}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Dashboard({ stats, lang, t, live, failed }: { stats: AdminStats; lang: Locale; t: UI; live: boolean; failed: boolean }) {
  const formats = useMemo(
    () => ({
      number: new Intl.NumberFormat(lang),
      compact: new Intl.NumberFormat(lang, { notation: "compact", maximumFractionDigits: 1 }),
      percent: new Intl.NumberFormat(lang, { style: "percent", maximumFractionDigits: 0 }),
      time: new Intl.DateTimeFormat(lang, { timeStyle: "medium", timeZone: restaurant.timeZone }),
    }),
    [lang],
  );
  const figure = (n: number) => (n >= 10_000 ? formats.compact.format(n) : formats.number.format(n));

  const tiles = [
    { label: t.admin.visitsToday, value: stats.visits.today },
    { label: t.admin.visits7d, value: stats.visits.week },
    { label: t.admin.visitsTotal, value: stats.visits.total },
    { label: t.admin.viewsToday, value: stats.views.today },
    { label: t.admin.views7d, value: stats.views.week },
    { label: t.admin.subscribersTile, value: stats.subscribers },
  ];
  const languageTotal = stats.languages.reduce((sum, l) => sum + l.n, 0);

  return (
    <div className={styles.dashboard} data-stale={failed || undefined}>
      <div className={styles.statusRow}>
        <span className={styles.live} data-live={live && !failed}>
          <span className={styles.liveDot} aria-hidden="true" />
          {live ? t.admin.live : t.admin.paused}
        </span>
        <span className={styles.updated}>{t.admin.updatedAt(formats.time.format(stats.generatedAt))}</span>
      </div>
      {failed && <Notice>{t.admin.loadError}</Notice>}

      <section className={`${styles.card} ${styles.hero}`} aria-live="polite">
        <div className={styles.heroHead}>
          <span className={styles.heroIcon}>
            <ActivityIcon size={20} />
          </span>
          <h2 className={styles.heroLabel}>{t.admin.activeNow}</h2>
        </div>
        <p className={styles.heroValue}>{figure(stats.activeNow)}</p>
        <p className={styles.heroHint}>{t.admin.activeHint(stats.activeTimeoutSeconds)}</p>
        <h3 className={styles.subhead}>{t.admin.whereNow}</h3>
        <RankedBars
          lang={lang}
          empty={t.admin.nobodyNow}
          rows={stats.activeByScreen.map((s) => ({ key: s.path, label: screenLabel(s.path, t, lang), value: s.n }))}
        />
      </section>

      <ul className={styles.tiles}>
        {tiles.map((tile) => (
          <li key={tile.label} className={styles.tile}>
            <span className={styles.tileLabel}>{tile.label}</span>
            <span className={styles.tileValue}>{figure(tile.value)}</span>
          </li>
        ))}
      </ul>

      <MessagesPanel t={t} lang={lang} live={live} now={stats.generatedAt} />

      <Card title={t.admin.daily} wide>
        <DailyChart days={stats.daily} lang={lang} t={t} />
      </Card>

      <Card title={t.admin.topDishes}>
        <RankedBars
          lang={lang}
          empty={t.admin.noData}
          rows={stats.topDishes.map((d) => ({ key: d.dish, label: dishById.get(d.dish)?.name[lang] ?? d.dish, value: d.n }))}
        />
      </Card>

      <Card title={t.admin.languages}>
        <RankedBars
          lang={lang}
          empty={t.admin.noData}
          rows={stats.languages.map((l) => ({
            key: l.lang,
            label: languageLabel(l.lang),
            lang: isLocale(l.lang) ? l.lang : undefined,
            value: l.n,
            note: languageTotal ? formats.percent.format(l.n / languageTotal) : undefined,
          }))}
        />
      </Card>

      <Card title={t.admin.topScreens}>
        <RankedBars
          lang={lang}
          empty={t.admin.noData}
          rows={stats.topScreens.map((s) => ({ key: s.path, label: screenLabel(s.path, t, lang), value: s.n }))}
        />
      </Card>

      <Card title={t.admin.recent}>
        {stats.recent.length === 0 ? (
          <p className={styles.muted}>{t.admin.noData}</p>
        ) : (
          <ul className={styles.recent}>
            {stats.recent.map((r, i) => (
              <li key={`${r.ts}-${i}`} className={styles.recentRow}>
                <span className={styles.recentWhat}>
                  {r.dish ? (dishById.get(r.dish)?.name[lang] ?? r.dish) : screenLabel(r.path, t, lang)}
                </span>
                <span className={styles.recentMeta}>
                  <span className={styles.langChip}>{isLocale(r.lang) ? localeLabels[r.lang] : r.lang}</span>
                  {formatAgo(stats.generatedAt - r.ts, lang)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <PushComposer stats={stats} lang={lang} t={t} />

      <p className={styles.privacy}>{t.admin.privacy}</p>
      <a href={`/${lang}`} className={styles.menuLink}>
        {t.admin.openMenu}
        <ArrowIcon size={16} />
      </a>
    </div>
  );
}

type ThreadSummary = {
  id: string;
  lang: string;
  lastBody: string;
  lastSender: "guest" | "admin";
  lastAt: number;
  total: number;
  unread: number;
};
type ThreadMessage = { id: number; sender: "guest" | "admin"; body: string; createdAt: number };

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(String(response.status));
  return (await response.json()) as T;
}

/** Short, stable label for an anonymous conversation, e.g. "3FA2C1". */
const guestCode = (threadId: string) => threadId.slice(0, 6).toUpperCase();

/**
 * Private guest ↔ restaurant messages. Guests are anonymous; a conversation is
 * visible only to that guest and to the signed-in admin, who can reply.
 */
function MessagesPanel({ t, lang, live, now }: { t: UI; lang: Locale; live: boolean; now: number }) {
  const [threads, setThreads] = useState<ThreadSummary[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Conversation list: refresh while the dashboard is visible.
  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    const load = () =>
      getJson<{ threads: ThreadSummary[] }>("/api/admin/messages")
        .then((data) => {
          if (!cancelled) setThreads(data.threads);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [live]);

  // The open conversation: refresh while visible (this also marks it as read).
  useEffect(() => {
    if (!openId || !live) return;
    let cancelled = false;
    const load = () =>
      getJson<{ messages: ThreadMessage[] }>(`/api/admin/messages/${openId}`)
        .then((data) => {
          if (!cancelled) setMessages(data.messages);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [openId, live]);

  // Keep the newest message in view when one arrives.
  const count = messages.length;
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [count, openId]);

  const openThread = (id: string) => {
    setMessages([]);
    setDraft("");
    setFailed(false);
    setOpenId(id);
    setThreads((list) => list?.map((th) => (th.id === id ? { ...th, unread: 0 } : th)) ?? list);
  };

  const reply = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = draft.trim();
    if (busy || !body || !openId) return;
    setBusy(true);
    setFailed(false);
    try {
      const response = await postJson(`/api/admin/messages/${openId}`, { body });
      if (!response.ok) throw new Error(String(response.status));
      setMessages(((await response.json()) as { messages: ThreadMessage[] }).messages);
      setDraft("");
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const open = threads?.find((th) => th.id === openId);
  const totalUnread = threads?.reduce((sum, th) => sum + th.unread, 0) ?? 0;
  const langChip = (code: string) => (
    <span className={styles.langChip} title={languageLabel(code)}>
      {isLocale(code) ? localeLabels[code] : code}
    </span>
  );

  return (
    <section className={`${styles.card} ${styles.wide}`} aria-labelledby="admin-messages">
      <h2 id="admin-messages" className={styles.cardTitle}>
        <MessageIcon size={19} />
        {t.admin.messages.title}
        {totalUnread > 0 && <span className={styles.unreadPill}>{t.admin.messages.unread(totalUnread)}</span>}
      </h2>

      {openId === null ? (
        threads === null ? (
          <div className={styles.loadingSmall} aria-busy="true" />
        ) : threads.length === 0 ? (
          <p className={styles.muted}>{t.admin.messages.noThreads}</p>
        ) : (
          <ul className={styles.threadList}>
            {threads.map((th) => (
              <li key={th.id}>
                <button
                  type="button"
                  className={styles.threadRow}
                  data-unread={th.unread > 0 || undefined}
                  onClick={() => openThread(th.id)}
                >
                  <span className={styles.threadTop}>
                    <span className={styles.threadName}>{t.admin.messages.guest(guestCode(th.id))}</span>
                    {langChip(th.lang)}
                    <span className={styles.threadTime}>{formatAgo(Math.max(0, now - th.lastAt), lang)}</span>
                    {th.unread > 0 && (
                      <span className={styles.threadBadge} aria-label={t.admin.messages.unread(th.unread)}>
                        {t.admin.messages.newBadge(th.unread)}
                      </span>
                    )}
                  </span>
                  <span className={styles.threadPreview}>
                    {th.lastSender === "admin" ? `${t.admin.messages.you}: ` : ""}
                    {th.lastBody}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className={styles.thread}>
          <div className={styles.threadHead}>
            <button type="button" className={styles.threadBack} onClick={() => setOpenId(null)}>
              ← {t.admin.messages.back}
            </button>
            <span className={styles.threadName}>{t.admin.messages.guest(guestCode(openId))}</span>
            {open && langChip(open.lang)}
          </div>
          <div className={styles.threadLog} ref={logRef} aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={styles.threadMsg} data-from={m.sender}>
                <p className={styles.threadMsgBody}>{m.body}</p>
                <span className={styles.threadMsgMeta}>
                  {m.sender === "admin" ? t.admin.messages.you : t.admin.messages.guestLabel} ·{" "}
                  {formatAgo(Math.max(0, now - m.createdAt), lang)}
                </span>
              </div>
            ))}
          </div>
          <form className={styles.replyForm} onSubmit={reply}>
            <textarea
              className={styles.replyInput}
              value={draft}
              rows={1}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter sends, Shift+Enter adds a line (never mid-IME, e.g. Korean input).
                if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
                if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }}
              placeholder={t.admin.messages.replyPlaceholder}
              maxLength={1000}
              aria-label={t.admin.messages.reply}
            />
            <button type="submit" className={styles.replySend} disabled={busy || !draft.trim()} aria-label={t.admin.messages.send}>
              <SendIcon size={18} />
            </button>
          </form>
          {failed && (
            <p className={styles.formError} role="alert">
              {t.admin.messages.failed}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function PushComposer({ stats, lang, t }: { stats: AdminStats; lang: Locale; t: UI }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [audience, setAudience] = useState<"all" | Locale>("all");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const disabledReason = !stats.pushEnabled
    ? t.admin.push.notConfigured
    : stats.subscribers === 0
      ? t.admin.push.noSubscribers
      : null;

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || disabledReason) return;
    setBusy(true);
    setResult(null);
    try {
      const response = await postJson("/api/admin/push", { title, body, url, lang: audience });
      if (!response.ok) throw new Error(String(response.status));
      const data = (await response.json()) as { total: number; sent: number };
      setResult({ ok: true, text: t.admin.push.sent(data.sent, data.total) });
      setTitle("");
      setBody("");
    } catch {
      setResult({ ok: false, text: t.admin.push.failed });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${styles.card} ${styles.wide}`}>
      <h2 className={styles.cardTitle}>
        <BellIcon size={19} />
        {t.admin.push.title}
        <span className={styles.cardMeta}>{t.admin.push.subscribers(stats.subscribers)}</span>
      </h2>
      {disabledReason && <p className={styles.muted}>{disabledReason}</p>}
      <form className={styles.pushForm} onSubmit={send}>
        <label className={styles.field}>
          <span>{t.admin.push.heading}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required disabled={!!disabledReason} />
        </label>
        <label className={styles.field}>
          <span>{t.admin.push.message}</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={240} rows={3} required disabled={!!disabledReason} />
        </label>
        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span>{t.admin.push.opens}</span>
            <select value={url} onChange={(e) => setUrl(e.target.value)} disabled={!!disabledReason}>
              {SCREEN_PATHS.map((path) => (
                <option key={path} value={path}>
                  {screenLabel(path, t, lang)}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>{t.admin.push.audience}</span>
            <select
              value={audience}
              onChange={(e) => setAudience(isLocale(e.target.value) ? e.target.value : "all")}
              disabled={!!disabledReason}
            >
              <option value="all">{t.admin.push.everyone}</option>
              {locales.map((l) => (
                <option key={l} value={l}>
                  {localeNames[l]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className={styles.primaryBtn} disabled={busy || !!disabledReason || !title.trim() || !body.trim()}>
          <SendIcon size={18} />
          {busy ? t.admin.push.sending : t.admin.push.send}
        </button>
        {result && (
          <p className={result.ok ? styles.formOk : styles.formError} role="status">
            {result.text}
          </p>
        )}
      </form>
    </section>
  );
}
