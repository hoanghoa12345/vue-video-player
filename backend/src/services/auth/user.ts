import { Hono } from "hono";
import type { Env } from "../../types/env.ts";

const app = new Hono<Env>();

app.get("/info", (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export default app;
