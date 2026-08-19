import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

/**
 * Whether a database connection is configured. The app is designed to run
 * without one — the dashboard and all API routes work off static data.
 */
export function hasDatabase(): boolean {
  return Boolean(databaseUrl);
}

function getPool(): Pool {
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env to enable the database layer."
    );
  }
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: databaseUrl,
    });
  }
  return globalForDb.__arenaNextJsPostgresqlPool;
}

let dbInstance: NodePgDatabase<Record<string, never>> | null = null;

/**
 * Lazily creates the Drizzle client on first use, so importing this module
 * never fails when DATABASE_URL is missing.
 */
export function getDb(): NodePgDatabase<Record<string, never>> {
  if (!dbInstance) {
    dbInstance = drizzle(getPool());
  }
  return dbInstance;
}
