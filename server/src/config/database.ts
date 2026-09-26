import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;
export const pool = env.databaseUrl ? new Pool({ connectionString: env.databaseUrl }) : null;
let schemaPromise: Promise<void> | undefined;

export function ensureSchema(): Promise<void> {
  if (!pool) return Promise.reject(new Error("PostgreSQL is not configured. Set DATABASE_URL in server/.env."));
  schemaPromise ??= pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      google_subject TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      picture_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      age SMALLINT,
      height_cm NUMERIC(5,1),
      weight_kg NUMERIC(5,1),
      fitness_goal TEXT,
      selected_sport_id TEXT,
      onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `).then(() => undefined);
  return schemaPromise;
}

export async function checkDatabase(): Promise<boolean> {
  if (!pool) return false;
  try { await pool.query("SELECT 1"); return true; } catch { return false; }
}
