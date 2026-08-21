# BLDC Map Signal · MOTORLEAD OS

مرکز عملیات فارسی (RTL) برای یافتن و ارزیابی فروشندگان، مونتاژکنندگان و سازندگان
موتورهای **BLDC** در ایران — شامل نقشه فروشندگان، مدل Snapshot صنعتی HTI و کاتالوگ
تجمیع‌شده محصولات.

A Persian (RTL) operations dashboard for finding and vetting BLDC motor sellers,
assemblers and manufacturers in Iran: a seller map, an HTI industrial snapshot
model, and an aggregated product catalog.

> ⚠️ The dataset shipped with this repo is **demo/public-approximation data**.
> All specs, scores and contacts must be verified with the seller before any
> purchase. See the disclaimer in-app and in the API responses.

## Live

- **Production:** <https://parscell-rohani.pages.dev>
- **Custom domain:** <https://parscell.exhibition2world.ir>

Deployed on **Cloudflare Pages**, connected to this GitHub repository
(`main` branch auto-deploys on push).

## Features

- **🗺 Seller map** — interactive Leaflet map (OpenStreetMap / Google tiles / Carto dark & light / custom vector Iran map) with **۲۳ Iranian + ۱۰۰ international** (China-focused, with Chinese names 中文) sellers, an Iran/World scope toggle, country filter, live filtering (search, household/industrial, voltage class, production type, catalog only), P1–P3 lead-priority scoring, a sorted results table, and a "add to lead bank" workflow.
- **📨 مرکز پیام‌رسانی (Messaging center)** — multi-channel panel inspired by the Clinic Signal workflow: **Telegram (@Pars_sell_bot) and Bale/@power_sell_bot are live** (WhatsApp/Email/SMS marked "به‌زودی"), channel selector, topic selector, message composer with **human-approval checkbox and Dry Run mode**, bot status panels, and a compliance checklist (no-contact list, opt-out, server-side keys).
- **🤖 RAG آنالیز کاتالوگ** — semantic catalog analysis view: knowledge-source
  index (PDF catalogs, datasheets, site audits), featured specs, vector-chunk
  status and a query panel (demo data).
- **⚡ HTI Snap Model** — one-page industrial snapshot: audit signals, AI proposal
  package, KPI suggestions and a 30/60/90-day advisory plan (print-friendly).
- **📄 Catalog view** — aggregated BLDC motor specs for household and industrial
  segments, with CSV and standalone HTML/PDF-ready exports.
- **API layer** (all routes run on the edge runtime)

  | Route | Description |
  |---|---|
  | `GET /api/sellers?q=&type=&city=&catalog=&scope=&country=&format=` | Search/filter the seller dataset (JSON or `format=csv`) — `scope=world` includes the 100 international sellers |
  | `GET /api/catalog` | Aggregated catalog as CSV (UTF-8 BOM, Excel-friendly) |
  | `GET /api/catalog/html` | Standalone, printable HTML version of the catalog |
  | `GET /api/health` | Health check (no database required) |
  | `GET/POST /api/telegram` | Telegram messaging center: status + send notifications (supports `dryRun`) |
  | `GET/POST /api/telegram/webhook` | Telegram bot webhook — answers `/start /help /map /catalog /leads /rag /contact /register /users /clinic` |
  | `GET/POST /api/bale` | Bale (بل) messaging center: status + send notifications (supports `dryRun`) |
  | `GET/POST /api/bale/webhook` | Bale bot webhook — same command set as Telegram, on `tapi.bale.ai` |
  | `POST /api/bale/setup` | One-time Bale webhook bootstrap / chat-id capture, run from the Cloudflare edge |

- **📨 Telegram integration** — the dashboard notifies the operator's Telegram
  chat through the [@Pars_sell_bot](https://t.me/Pars_sell_bot) bot:
  adding a lead to the lead bank and pressing the HTI "send to messaging"
  buttons push a formatted message to Telegram.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) **15.5.2** (App Router) + React 19 |
| Styling | [Tailwind CSS](https://tailwindcss.com) 4 |
| Icons | [lucide-react](https://lucide.dev) |
| Maps | [Leaflet](https://leafletjs.com) with multi-provider tiles |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) via [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages) |
| Database (optional) | PostgreSQL via [Drizzle ORM](https://orm.drizzle.team) + `pg` |
| Language | TypeScript, UI text in Persian (RTL) |

- **👤 Role-based accounts (demo)** — **all modules require login**. Visitors see a
  main page (module hub) with locked module cards; login at `/login` (phone +
  password) and self-registration at `/register` (name, phone, company, city,
  role: buyer/seller/customer). Separate dashboards per role (**admin** users
  table & stats, **seller** company profile + pricing + inbound leads,
  **buyer/customer** saved leads with prices and inquiry actions), demo role
  switcher to preview every user's dashboard. Demo database seed in
  `src/data/accounts.ts` + browser registry in `src/lib/session.ts`;
  production schema in `db/d1-schema.sql` (Cloudflare D1: users, sellers,
  leads, messages, telegram_users).
- **💰 Cost analysis** — every seller has a sample price per watt, unit cost
  estimate and bulk-saving % (heuristic demo pricing in `src/app/pricing.ts`),
  shown in the map detail panel, results table, a **regional big-company
  analysis** card, and the sellers API.

## Demo accounts (password for all: `demo123`)

| Role | Name | Phone | Dashboard |
|---|---|---|---|
| ادمین | مدیر سامانه | 09120000001 | users table, seller approvals, reports |
| خریدار | رضا کریمی | 09121111111 | saved leads + prices, inquiries |
| فروشنده | نیان موتور | 09123333333 | company profile, pricing, inbound leads |
| فروشنده | توسعه حرکت HTI | 09124444444 | company profile, pricing, inbound leads |
| مشتری | مهدی رضایی | 09125555555 | followed companies, sample orders |
| مشتری | سارا احمدی | 09126666666 | followed companies, sample orders |
| بازاریاب | زهرا موسوی | 09128888888 | lead hunting, referral commission, reports |

## Telegram & Bale messaging centers

Notifications are delivered by two bots, both with a full command menu
(`/start /help /map /catalog /leads /rag /contact /register /users /clinic`)
and webhooks at `/api/telegram/webhook` and `/api/bale/webhook` that answer
each command with Persian text and inline buttons:

| Channel | Bot | Link | API |
|---|---|---|---|
| تلگرام | @Pars_sell_bot | t.me/Pars_sell_bot | api.telegram.org |
| بله (Bale) | @power_sell_bot | ble.ir/power_sell_bot | tapi.bale.ai (Telegram-compatible) |

**User registration by phone:** send `/register`, then send your phone number
(any demo number from the table above, or a clinic demo number from `/clinic`).
The bot matches it against the demo database and registers the chat — in
production this maps to the `telegram_users` table in D1.

**Data is served in both sources (site + chat):** `/map` lists the top
Iranian and Chinese companies with sample prices, `/catalog` prints the full
catalog table inside the chat, and `/leads` shows live P1/P2 stats and
average bulk savings — the same data the site shows on the map and catalog
views.

Configuration (environment variables on the Cloudflare Pages project — never
commit the real tokens):

| Variable | Purpose |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Bot token from [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | Chat that receives notifications (see below) |
| `TELEGRAM_WEBHOOK_SECRET` | Random string used as `secret_token` in `setWebhook` (shared by both channels) |
| `BALE_BOT_TOKEN` | Bale bot token (from Bale BotFather) |
| `BALE_CHAT_ID` | Operator chat id for Bale — captured automatically on first `/start` and relayed to your Telegram; set it manually for stability |

One-time setup commands (after the env vars are deployed):

```bash
# Command menu + description
curl -X POST "https://api.telegram.org/bot<TOKEN>/setMyCommands" -H 'Content-Type: application/json' \
  -d '{"commands":[{"command":"start","description":"شروع و راهنمای سریع"},{"command":"help","description":"راهنمای کامل"},{"command":"map","description":"نقشه فروشندگان ایران و جهانی"},{"command":"catalog","description":"کاتالوگ محصولات"},{"command":"leads","description":"بانک لیدها"},{"command":"rag","description":"آنالیز RAG کاتالوگ"},{"command":"contact","description":"راه‌های ارتباط"}]}'

# Register the webhook (secret must match TELEGRAM_WEBHOOK_SECRET)
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" -H 'Content-Type: application/json' \
  -d '{"url":"https://parscell.exhibition2world.ir/api/telegram/webhook","secret_token":"<SECRET>"}'

# Bale webhook — run from the Cloudflare edge (tapi.bale.ai may be blocked from dev machines):
curl -X POST "https://parscell-rohani.pages.dev/api/bale/setup" \
  -H "x-admin-secret: <SECRET>" -H 'Content-Type: application/json' -d '{"action":"register"}'

# Capture the Bale operator chat id (pause webhook -> getUpdates -> re-register):
curl -X POST "https://parscell-rohani.pages.dev/api/bale/setup" \
  -H "x-admin-secret: <SECRET>" -H 'Content-Type: application/json' -d '{"action":"capture_chat"}'
```

**Bale chat id**: when anyone messages @power_sell_bot, the webhook relays the
captured chat id to your Telegram chat (`BALE_CHAT_ID`). Set that number as
the `BALE_CHAT_ID` env var on Pages and redeploy for persistent delivery.

To obtain `TELEGRAM_CHAT_ID`:

1. Open <https://t.me/Pars_sell_bot> and press **START** once.
2. Visit `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy the `id`
   inside the `chat` object.
3. Set it on the Pages project (dashboard → Settings → Environment variables)
   or pass it during setup.

Until `TELEGRAM_CHAT_ID` is set, `/api/telegram` responds `503` with a
helpful hint and the dashboard shows a toast when a send fails.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

**No database is required** — the dashboard works entirely off the static
dataset in `src/app/data.ts`.

## Cloudflare Pages deployment

The Pages project `parscell-rohani` builds automatically from `main` with:

| Setting | Value |
|---|---|
| Build command | `npx @cloudflare/next-on-pages@1` |
| Output directory | `.vercel/output/static` |
| Root directory | (repo root) |
| Node version | 22 (build image) |

> ⚠️ **Version constraint:** `@cloudflare/next-on-pages@1.13.16` supports
> `next >= 14.3.0 && <= 15.5.2`. Next.js is therefore **pinned to 15.5.2** —
> do not bump `next` (or `eslint-config-next`) without first upgrading
> `next-on-pages` to a version that supports the new Next.js major.

Test the full Pages build locally before pushing:

```bash
npm run pages:build    # runs npx @cloudflare/next-on-pages
```

### Optional: enable PostgreSQL (local dev only)

1. Copy the env template and fill in your connection string:

   ```bash
   cp .env.example .env
   ```

2. Start a local Postgres (example with Docker):

   ```bash
   docker run --name bldc-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
   ```

3. Create the tables defined in `src/db/schema.ts`:

   ```bash
   npx drizzle-kit push
   ```

> The schema mirrors the static dataset shapes in `src/app/data.ts`, so the
> API routes can be switched to the database without reshaping the UI.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run pages:build` | Build for Cloudflare Pages (`@cloudflare/next-on-pages`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npx drizzle-kit push` | Create/update tables from `src/db/schema.ts` |
| `npx drizzle-kit generate` | Generate SQL migrations into `./drizzle` |

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Entry page
│   ├── Dashboard.tsx         # Main UI (map / HTI / RAG / messaging / catalog views)
│   ├── data.ts               # Static Iranian dataset (۲۳ sellers)
│   ├── data-global.ts        # 100 international sellers (China-focused, 中文 names)
│   ├── components/           # MultiMapViewer, RAGCatalogAnalyzer, MessagingView
│   ├── globals.css           # Tailwind + base styles
│   └── api/
│       ├── health/route.ts   # Health check (edge, no DB)
│       ├── sellers/route.ts  # Seller search/filter API + CSV (edge)
│       ├── catalog/          # CSV + standalone HTML catalog exports (edge)
│       └── telegram/         # Messaging center + bot webhook (edge)
└── db/
    ├── index.ts              # Lazy Drizzle client (no DB required to boot)
    └── schema.ts             # PostgreSQL tables (sellers, catalog_models)
```

## License

[GPL-3.0](LICENSE)
