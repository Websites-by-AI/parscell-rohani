import { pgTable, text, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";

/**
 * BLDC Map Signal — database schema.
 *
 * Mirrors the shapes used by the static dataset in `src/app/data.ts`, so the
 * API layer can be moved to the database without reshaping the UI data.
 * Run `npx drizzle-kit push` against a configured DATABASE_URL to create the
 * tables (see README).
 */

export const sellers = pgTable("sellers", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  city: text("city").notNull(),
  zone: text("zone").notNull(),
  type: text("type").notNull(), // "household" | "industrial" | "both"
  production: text("production").notNull(), // "تولید محلی" | "مونتاژ" | "واردات + مونتاژ"
  products: text("products").array().notNull(),
  power: text("power").notNull(),
  powerMax: integer("power_max").notNull(),
  voltage: text("voltage").notNull(),
  voltageClass: text("voltage_class").notNull(), // "low" | "high"
  score: integer("score").notNull(),
  catalog: boolean("catalog").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  mapX: integer("map_x").notNull(),
  mapY: integer("map_y").notNull(),
  contact: text("contact").notNull(),
  updated: text("updated").notNull(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const catalogModels = pgTable("catalog_models", {
  model: text("model").primaryKey(),
  power: text("power").notNull(),
  voltage: text("voltage").notNull(),
  rpm: text("rpm").notNull(),
  torque: text("torque").notNull(),
  app: text("app").notNull(), // "خانگی" | "صنعتی"
  use: text("use").notNull(),
  source: text("source").notNull(),
  notes: text("notes").notNull(),
});
