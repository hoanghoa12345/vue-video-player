import { createMiddleware } from "hono/factory";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { Env } from "../types/env.ts";

// Global cache - lives for the lifetime of the worker / server
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJWKS(url: string) {
  if (!jwksCache.has(url)) {
    // jose will cache the keys internally and respect Cache-Control headers
    jwksCache.set(url, createRemoteJWKSet(new URL(url)));
  }
  return jwksCache.get(url)!;
}

export const requireAuth = createMiddleware<Env>(async (c, next) => {
  const settings = c.get("settings");

  const jwksUrl = settings.oauth2_provider_jwks_url!;

  if (!jwksUrl) {
    return c.json({ error: "JWKS URL not configured" }, 500);
  }

  // Use JWKS if your provider has one: https://your-provider/.well-known/jwks.json
  const JWKS = getJWKS(jwksUrl);

  const header = c.req.header("Authorization");

  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Missing access token" }, 401);
  }

  const token = header.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: settings.oauth2_provider_issuer, // e.g. https://your-provider
      audience: settings.oauth2_client_id, // e.g. your api identifier
    });

    // Attach user to context for downstream handlers
    c.set("user", {
      sub: payload.sub as string,
      email: payload.email as string,
      scope: payload.scope as string,
    });

    await next();
  } catch (e) {
    console.error("[OAuth2] Error verifying token", e);
    return c.json({ error: "Invalid or expired token" }, 401);
  }
});
