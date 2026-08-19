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

- **🗺 Seller map** — interactive Leaflet map (OpenStreetMap / Google tiles / Carto dark & light / custom vector Iran map) with pins for the sellers, live filtering
  (search, household/industrial, voltage class, production type, catalog only),
  a sorted results table, and a "add to lead bank" workflow.
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
  | `GET /api/sellers?q=&type=&city=&catalog=` | Search/filter the seller dataset (JSON) |
  | `GET /api/catalog` | Aggregated catalog as CSV (UTF-8 BOM, Excel-friendly) |
  | `GET /api/catalog/html` | Standalone, printable HTML version of the catalog |
  | `GET /api/health` | Health check (no database required) |
  | `GET/POST /api/telegram` | Telegram messaging center (see below) |

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

## Telegram messaging center

Notifications are delivered by the bot **[@Pars_sell_bot](https://t.me/Pars_sell_bot)**.

Configuration (environment variables on the Cloudflare Pages project — never
commit the real token):

| Variable | Purpose |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Bot token from [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | Chat that receives notifications (see below) |

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
│   ├── Dashboard.tsx         # Main UI (map / HTI / catalog views)
│   ├── data.ts               # Static demo dataset
│   ├── globals.css           # Tailwind + base styles
│   └── api/
│       ├── health/route.ts   # Health check (edge, no DB)
│       ├── sellers/route.ts  # Seller search/filter API (edge)
│       └── catalog/          # CSV + standalone HTML catalog exports (edge)
└── db/
    ├── index.ts              # Lazy Drizzle client (no DB required to boot)
    └── schema.ts             # PostgreSQL tables (sellers, catalog_models)
```

## License

[GPL-3.0](LICENSE)
