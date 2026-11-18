# FIRDAVS RESTAURANT — digital menu

Mobile-first QR menu for a halal Uzbek restaurant in Jeonju (전주시 덕진구 백제대로 608 1층).
Four languages (Oʻzbekcha, 한국어, Русский, English), category tabs, search, dish details,
favorites, a cart with table orders sent by SMS, private guest ↔ restaurant messages, contact
buttons, opt-in notifications, and a password-protected admin dashboard with live visitor
statistics and the guest inbox.

Next.js 16 (App Router, TypeScript) · CSS Modules · SQLite (`better-sqlite3`) · Web Push (`web-push`).
No UI, icon or chart libraries.

```bash
npm install
cp .env.example .env.local   # then fill it in (see "Configuration")
npm run dev                  # http://localhost:3000  ·  admin: http://localhost:3000/admin
npm run build && npm start
npm run lint
```

## Configuration

All secrets and settings come from environment variables — `.env.local` in development, your
host's environment in production. `.env*` files are gitignored (only `.env.example` is committed).

| Variable | Needed for | Notes |
| --- | --- | --- |
| `ADMIN_PASSWORD` | `/admin` | At least 8 characters; long and unique. Without it the dashboard stays locked. |
| `DATABASE_PATH` | analytics, admin sessions, push, guest messages | SQLite file, default `.data/firdavs.sqlite`. Must be on a **persistent disk**. |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | notifications | Generate once: `npx web-push generate-vapid-keys`. Without them the Notifications card is hidden. |
| `VAPID_SUBJECT` | notifications | `mailto:` address or `https://` URL push services can contact. |
| `SITE_URL` | link previews | e.g. `https://menu.example.com` (not needed on Vercel). |
| `SOLAPI_API_KEY`, `SOLAPI_API_SECRET` *or* `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | kitchen SMS | One SMS provider. Solapi suits Korean numbers. |
| `SMS_FROM` | kitchen SMS | Sender number registered with the provider (Korea requires pre-registration). |
| `ORDER_SMS_TO` | kitchen SMS | Kitchen phone; default 010-3238-2555. |
| `TABLE_COUNT` | orders | Optional: highest table number (default 999). |

The private VAPID key and the admin password are only read on the server; the browser only ever
gets the public VAPID key (`/api/push/key`).

## What's filled in, and what's still yours to add

Real details in `src/data/restaurant.ts`: name, address, phone (010-3238-2555), SMS, Telegram
(@Firdavs_restaurant1), WhatsApp, Instagram (@firdavs_restaurant_1, @firdavs_market), opening
hours (every day 10:00–23:00, shown as "Ish vaqti - har kuni 10:00-23:00gacha"), delivery
available, the number table orders go to (`orderPhone`), and the halal claim
(`100% HALAL · NO PORK · NO ALCOHOL`). Nothing below was invented — until you fill it in, guests
see a neutral fallback or nothing:

| What | Where | Until it's set |
| --- | --- | --- |
| Prices (₩, VAT included) | `price` on each dish in `src/data/menu.ts` | No price is shown; the cart and the order SMS say the total is confirmed by staff |
| Last order time | `lastOrder` in `src/data/restaurant.ts` | Not shown |
| WhatsApp number | `whatsapp` in `src/data/restaurant.ts` | Uses the restaurant phone — change it if WhatsApp runs on another number (`null` hides the button) |
| Delivery apps (Baemin, …) | `deliveryApps` in `src/data/restaurant.ts` | "Delivery service available" + a call button |
| Exact map pins | `mapLinks` in `src/data/restaurant.ts` | Map buttons search the address |
| Serving sizes, spicy / vegetarian / for-sharing icons | `portion`, `tags` on each dish | Not shown |

Every dish has its name, ingredients and description in all four languages (`menu.ts` —
TypeScript reports any missing translation). Descriptions describe each dish in general terms;
check them against your kitchen (e.g. lamb vs beef). `tags: ["featured"]` picks the Home carousel.
Interface text lives in `src/i18n/ui.ts`.

**Photos.** The images are openly licensed photos from Wikimedia Commons and Flickr (cropped to
4:3 and resized), not photos of your own dishes — a few show a close relative (tortellini in broth
for chuchvara, a generic glass for branded drinks; Non (yarimta) is a whole non digitally cut in half).
Their credits are recorded in `photos.ts` but no longer shown in the app — CC BY / CC BY-SA licenses
ask for a credit where the photo is used, so replacing them with your own photos is the clean fix.
**Xonim** has no photo yet (no openly licensed one exists), so it shows the menu's
ornament until you add yours. To use your own photo, overwrite the file in `src/assets/menu/` with the same
name (4:3, at least 1200×900 looks best) and delete its `credit` in `photos.ts`. Next.js serves
them as AVIF/WebP in the size each screen needs, lazy-loads them, and a missing image file fails
the build instead of shipping a broken image.

## Ordering from the table

Guests tap **+** on any dish or drink (or "Add to cart" in its detail sheet), adjust quantities in
the cart (line subtotals and the total update instantly), press **Order**, enter their **table
number** and press **Confirm**. The order is validated and saved on the server (prices always come
from `menu.ts`, never from the browser; one order per Confirm, so double taps can't order twice),
then sent to the kitchen phone by **SMS through the configured provider**:

```
FIRDAVS RESTAURANT
Order #12 · Table 7
2026-11-19 14:05 (KST)

1. Manti × 2 — ₩12,000 = ₩24,000
2. Choy × 1 — ₩1,000

Total: ₩25,000
```

The guest sees "Sent to the kitchen" **only after the provider accepted the SMS**. If no provider
is configured (or it fails), they're told so honestly and can send the same text from their own
phone with one tap (or show the screen to a waiter), or press **Cancel** (Bekor qilish): the order
is then marked cancelled on the server, can never be sent afterwards, the admin gets an alert, and the
dishes stay in the cart. Every order — with its SMS status — is listed
under **Orders** in the admin dashboard. Items whose price depends on the size (Gazli ichimliklar
₩2,500 / ₩3,500) or isn't set yet are marked "priced by staff" and kept out of the total.

## Messages from guests

On the Info screen (or "Message us" on Home) guests can write to the restaurant. Each phone gets a random
secret key (kept in its browser); the server stores only a hash of it, so a conversation can be
read only on that phone and by the admin — never by other guests. Replies appear in the guest's
chat (it refreshes every few seconds), the Info tab shows a badge until they're read, and after
writing, guests can turn on a notification for replies. No names or phone numbers are collected;
messages are deleted after 6 months.

## Admin dashboard — `/admin`

Sign in with `ADMIN_PASSWORD` (any language prefix works: `/ko/admin`, `/ru/admin`, …).

- **Active now** — devices with the menu open, updated live. Every open menu sends a small
  heartbeat every 15 s; a device that stops (tab closed or hidden) drops out at once, or after
  45 s at the latest. The dashboard refreshes every 5 s while it's visible.
- Visits (today / 7 days / all time), page views, a 14-day chart (with a table view), languages,
  most opened dishes and screens, and recent activity.
- **Orders** — every table order with its items, total and whether the kitchen SMS went out.
- **Guest messages** — every conversation (newest first, with its language and unread count);
  open one to read it and reply.
- **Alerts on this device** — push notifications to the admin's phone/computer for a new guest's
  first visit (once per device), every new order and every new message.
- **Send a notification** to guests who turned notifications on — to everyone or one language,
  opening a chosen screen.

Privacy: statistics are anonymous. The browser keeps a random id (no name, phone, e-mail, IP
address or device details are stored); the server keeps screens, dish ids and languages. Login
attempts are rate-limited; sessions are HttpOnly, SameSite=Strict cookies that expire after 12 h.

## Notifications (Web Push)

Guests opt in on the Info screen; permission is requested only when they tap the button, and they
can turn it off there at any time. Works in Chrome, Edge, Firefox and Samsung Internet on Android
and desktop, and in Safari on macOS. **On iPhone/iPad (iOS 16.4+), Apple allows web notifications
only after "Share → Add to Home Screen"** — the card explains this. Expired subscriptions are
removed automatically when a send fails with 404/410.

## Links for QR codes

Every screen is a prerendered page, so any of these opens instantly:

| URL | Opens |
| --- | --- |
| `/` | Home — categories, featured dishes, address & call |
| `/menu` | Full menu |
| `/menu/plov` | One category (`soups`, `mains`, `plov`, `salads`, `bread`, `desserts`, `drinks`) |
| `/menu?dish=toy-oshi` | A dish's detail sheet (ids are in `menu.ts`) |
| `/info` | Contact, messages, address, hours, delivery, notifications |
| `/ko/menu`, `/ru/…`, `/uz/…`, `/en/…` | Force a language (e.g. a Korean-only table card) |

Without a language prefix, the guest gets the language they picked before, else their phone's
language, else English (`src/proxy.ts`).

## Testing on a phone

`npm run dev` and open `http://<your computer's Wi-Fi IP>:3000` on the phone. `next.config.ts`
allows private network addresses (`allowedDevOrigins`) — without that, Next.js blocks its
development scripts for anything but `localhost` and the page doesn't respond to taps.

## Deploying

- Needs a **Node.js server with a persistent disk** for the SQLite file (a VPS, Railway/Render/Fly
  with a volume, …): `npm run build && npm start`. Serverless hosts such as Vercel have no
  persistent filesystem — the menu would work there, but statistics, admin sessions, push
  subscriptions and guest messages would not survive.
- Run a **single** server process (SQLite and the in-memory login rate limit are per process).
- Serve it over **HTTPS** (required for notifications and secure cookies).
- Set `SITE_URL` so link previews in KakaoTalk / Telegram / Instagram point to the right domain.
- If you put a CDN in front, don't cache `/` and other unprefixed paths by URL alone — their
  language depends on the visitor (the `/<lang>/…` paths are safe to cache), and never cache
  `/api/*` or `/sw.js`.
