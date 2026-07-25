import { Hono } from "hono";
import type { Env } from "../../types/env.ts";
import { upsertUserAndAccount } from "../../db/queries/auth.ts";

const app = new Hono<Env>();

// GET /oauth/url
app.get("/url", async (c) => {
  const settings = c.get("settings");
  const { challenge, state } = c.req.query();
  const authUrl = new URL(settings.oauth2_provider_auth_url);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: settings.oauth2_client_id,
    redirect_uri: settings.oauth2_redirect_uri,
    scope: "openid profile email",
    state: state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  authUrl.search = params.toString();

  const url = authUrl.toString();
  return c.json({ url });
});

// POST /oauth/exchange
// Body: { code, code_verifier, state, stored_state, provider }
app.post("/exchange", async (c) => {
  const settings = c.get("settings");
  const {
    code,
    code_verifier,
    state,
    stored_state,
    provider = "oauth2",
  } = await c.req.json();

  // 1. Validate input from frontend
  if (!code || !code_verifier || !state || !stored_state) {
    return c.json({ error: "missing_params" }, 400);
  }

  // 2. Validate state - CRITICAL: CSRF protection
  // stored_state is what frontend had in sessionStorage
  if (state !== stored_state) {
    return c.json({ error: "invalid_state" }, 403);
  }

  // 3. Exchange code + verifier for tokens
  try {
    let tokenRes: Response;
    if (provider === "oauth2") {
      tokenRes = await fetch(settings.oauth2_provider_token_url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: settings.oauth2_client_id,
          client_secret: settings.oauth2_client_secret,
          code,
          code_verifier,
          grant_type: "authorization_code",
          redirect_uri: settings.oauth2_redirect_uri,
        }),
      });
    } else {
      return c.json({ error: "unsupported_provider" }, 400);
    }

    const tokens = (await tokenRes.json()) as any;

    if (!tokenRes.ok) {
      console.error("token exchange failed", tokens);
      return c.json({ error: "token_exchange_failed", details: tokens }, 400);
    }

    // tokens: { access_token, refresh_token, id_token, expires_in }

    const userInfoRes = await fetch(settings.oauth2_provider_user_info_url, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = await userInfoRes.json();

    // 4. Upsert user and account
    const userData = {
      name: user.name,
      email: user.email,
      emailVerified: user.email_verified,
      image: user.picture,
    };

    const accountData = {
      accountId: user.sub,
      providerId: provider,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      accessTokenExpiresAt: tokens.expires_in,
      refreshTokenExpiresAt: tokens.expires_in,
      scope: tokens.scope,
    };
    await upsertUserAndAccount(userData, accountData);

    // 5. Return as secure httpOnly cookie or json
    // For SPA, set httpOnly cookie for refresh_token
    return c.json({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      expires_in: tokens.expires_in,
      user,
    });
  } catch (e) {
    console.error("error", e);
    return c.json({ error: "server_error" }, 500);
  }
});

// POST /oauth/refresh
app.post("/refresh", async (c) => {
  const settings = c.get("settings");
  const { refresh_token } = await c.req.json();
  const res = await fetch(settings.oauth2_provider_token_url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: settings.oauth2_client_id,
      client_secret: settings.oauth2_client_secret,
      grant_type: "refresh_token",
      refresh_token,
    }),
  });
  const data = await res.json();
  return c.json(data, res.status as any);
});

export default app;
