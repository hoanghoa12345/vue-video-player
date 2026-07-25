import { drizzle } from "drizzle-orm/libsql";
import { TURSO_AUTH_TOKEN, TURSO_CONNECTION_URL } from "../lib/env.ts";

export const db = drizzle({
  connection: {
    url: TURSO_CONNECTION_URL,
    authToken: TURSO_AUTH_TOKEN,
  },
});
