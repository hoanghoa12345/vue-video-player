import { createMiddleware } from "hono/factory";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { Env } from "../types/env.ts";
import { getUserBySub } from "../db/queries/auth.ts";

// Global cache - lives for the lifetime of the worker / server
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJWKS(url: string) {
  if (!jwksCache.has(url)) {
    // jose will cache the keys internally and respect Cache-Control headers
    jwksCache.set(url, createRemoteJWKSet(new URL(url)));
  }
  return jwksCache.get(url)!;
}

type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: number;
  image: string | null;
};

const userCache = new Map<string, { user: User; expiresAt: number }>();

function getUser(sub: string) {
  const cached = userCache.get(sub);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }
  return null;
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

    if (!payload.sub) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const cached = userCache.get(payload.sub);
    if (cached && cached.expiresAt > Date.now()) {
      if (!cached.user.id) {
        return c.json({ error: "Forbidden" }, 403);
      }
    } else {
      const dbUser = await getUserBySub(payload.sub);
      if (dbUser) {
        userCache.set(payload.sub, {
          user: dbUser,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });
      }
    }

    const user = getUser(payload.sub);

    // Attach user to context for downstream handlers
    c.set("user", {
      id: user?.id,
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
    });

    await next();
  } catch (e) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
});
