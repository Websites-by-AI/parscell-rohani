-- BLDC Map Signal — production database schema (Cloudflare D1 / SQLite).
-- This is the real-DB counterpart of the demo seed in src/data/accounts.ts.
-- Import this file in the D1 dashboard (or `wrangler d1 execute DB --file=db/d1-schema.sql`).

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin','buyer','seller','customer','marketer')),
  phone         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  company       TEXT,
  city          TEXT,
  note          TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sellers (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  short_name   TEXT NOT NULL,
  city         TEXT NOT NULL,
  zone         TEXT,
  country      TEXT NOT NULL DEFAULT 'ایران',
  type         TEXT NOT NULL,
  production   TEXT NOT NULL,
  products     TEXT NOT NULL,          -- JSON array
  power        TEXT NOT NULL,
  power_max_w  INTEGER NOT NULL,
  voltage      TEXT NOT NULL,
  voltage_class TEXT NOT NULL,
  score        INTEGER NOT NULL DEFAULT 0,
  catalog      INTEGER NOT NULL DEFAULT 0,
  verified     INTEGER NOT NULL DEFAULT 0,
  lat          REAL NOT NULL,
  lng          REAL NOT NULL,
  contact      TEXT,
  source       TEXT,
  sample_price_per_w TEXT,             -- demo heuristic price (USD)
  cost_saving_pct   INTEGER,
  owner_user_id TEXT REFERENCES users(id),  -- seller account link
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT REFERENCES users(id),      -- who saved the lead
  seller_id   INTEGER REFERENCES sellers(id),
  priority    TEXT NOT NULL DEFAULT 'P3',      -- P1/P2/P3
  status      TEXT NOT NULL DEFAULT 'new',     -- new/quoted/contacted/closed
  note        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user   TEXT NOT NULL,
  channel     TEXT NOT NULL DEFAULT 'telegram',
  topic       TEXT NOT NULL,
  title       TEXT,
  details     TEXT,
  dry_run     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS telegram_users (
  chat_id     INTEGER PRIMARY KEY,
  phone       TEXT,
  user_id     TEXT REFERENCES users(id),
  registered_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_user    ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_seller  ON leads(seller_id);
CREATE INDEX IF NOT EXISTS idx_sellers_country ON sellers(country);
