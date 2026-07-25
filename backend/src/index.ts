import { Hono } from "hono";
import { cors } from "hono/cors";

import oauth2 from "./services/auth/oauth2.ts";
import { loadSettings } from "./middlewares/settings.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use("*", loadSettings);

app.use(
  "/*",
  cors({
    origin: (origin, c) => c.get("settings").frontend_url,
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.route("/v1/oauth", oauth2);

Deno.serve(app.fetch);
