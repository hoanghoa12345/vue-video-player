import { createMiddleware } from "hono/factory";
import { findAllSettings } from "../db/db.ts";

// simple in-memory cache
let cache: Record<string, any> | null = null;
let lastFetch = 0;
const TTL_MS = 60_000; // 1 min, adjust

async function loadAllSettings() {
  const now = Date.now();
  if (cache && now - lastFetch < TTL_MS) return cache;

  const rows = await findAllSettings();
  const map: Record<string, any> = {};

  for (const row of rows) {
    switch (row.dataType) {
      case "boolean":
        map[row.key] = row.value === "true";
        break;
      case "number":
        map[row.key] = Number(row.value);
        break;
      case "json":
        try {
          map[row.key] = JSON.parse(row.value);
        } catch {
          map[row.key] = row.value;
        }
        break;
      default:
        map[row.key] = row.value;
    }
  }

  cache = map;
  lastFetch = now;
  return map;
}

export const loadSettings = createMiddleware(async (c, next) => {
  const settings = await loadAllSettings();
  c.set("settings", settings);
  await next();
});

export function invalidateSettingsCache() {
  cache = null;
}
