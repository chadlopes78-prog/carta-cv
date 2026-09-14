import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Postgres URL for Neon/Netlify Database, or undefined for the PGLite fallback. */
export function resolveDatabaseUrl(): string | undefined {
  if (typeof process === "undefined") return undefined;
  for (const key of ["DATABASE_URL", "NETLIFY_DATABASE_URL", "NETLIFY_DATABASE_URL_UNPOOLED"]) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  try {
    const mod = require("@netlify/database") as { getConnectionString?: () => string };
    const value = mod.getConnectionString?.()?.trim();
    if (value) return value;
  } catch {
    /* package missing outside Netlify */
  }
  return undefined;
}
