import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: Deno.env.get("TURSO_CONNECTION_URL")!,
    authToken: Deno.env.get("TURSO_AUTH_TOKEN")!,
  },
});
