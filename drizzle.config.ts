import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Connection string comes from the DATABASE_URL environment variable.
// The fallback below is a local-development default matching .env.example —
// set DATABASE_URL in your environment to override it.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
