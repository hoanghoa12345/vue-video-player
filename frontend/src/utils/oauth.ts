// Browser-only (Web Crypto). Generates a PKCE code_verifier (> 43 chars)
// and the corresponding S256 code_challenge.

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomCodeVerifier(length = 64) {
  // RFC 7636 allowed chars: ALPHA / DIGIT / "-" / "." / "_" / "~"
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let out = "";
  for (let i = 0; i < length; i++) out += charset[bytes[i] % charset.length];
  return out; // length > 43 by default (64)
}

async function sha256Base64Url(str: string) {
  const data = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncodeBytes(new Uint8Array(digest));
}

export async function generatePkce() {
  const code_verifier = randomCodeVerifier(64); // >= 43
  const code_challenge = await sha256Base64Url(code_verifier);
  return { code_verifier, code_challenge, code_challenge_method: "S256" };
}

// Example:
// const { code_verifier, code_challenge } = await generatePkce();
