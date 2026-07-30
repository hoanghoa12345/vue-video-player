import { Hono } from "hono";
import { cors } from "hono/cors";

import oauth2 from "./services/auth/oauth2.ts";
import user from "./services/auth/user.ts";
import { loadSettings } from "./middlewares/settings.ts";
import { requireAuth } from "./middlewares/auth.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.html("<center><h1>403 Forbidden</h1></center>");
});

app.use("*", loadSettings);

app.use(
  "/*",
  cors({
    origin: (_origin, c) => c.get("settings").frontend_url,
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.route("/v1/oauth", oauth2);

app.use("/v1/*", requireAuth);

app.route("/v1/user", user);

Deno.serve(app.fetch);
