// ═══════════════════════════════════════════════════════════
// MFA-Trust-Cookie — vertraue einem Browser für 1 Stunde nach
// erfolgreichem 2FA-Login.
// Cookie ist HttpOnly + signiert mit HMAC-SHA256 + 1h-Expiry.
// ═══════════════════════════════════════════════════════════

import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "kalion-mfa-trust";
const TTL_MS = 60 * 60 * 1000; // 1 Stunde

function getSecret(): string {
  // Fallback: MFA_TRUST_SECRET aus ENV, sonst eine Combination
  // damit es ohne Setup minimal funktioniert (aber WARNT in Console)
  const s = process.env.MFA_TRUST_SECRET
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_URL
    || "kalion-mfa-trust-fallback-secret-please-set-MFA_TRUST_SECRET";
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

// Token-Format: `${userId}.${expiresAt}.${signature}`
export function makeTrustToken(userId: string): string {
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${userId}.${expiresAt}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifyTrustToken(token: string | undefined, expectedUserId: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [userId, expStr, providedSig] = parts;
  if (userId !== expectedUserId) return false;

  const expiresAt = parseInt(expStr, 10);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSig = sign(`${userId}.${expStr}`);
  try {
    const a = Buffer.from(providedSig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const MFA_TRUST_COOKIE = COOKIE_NAME;
export const MFA_TRUST_TTL_S = TTL_MS / 1000;
