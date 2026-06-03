// API: setzt + prüft + löscht das MFA-Trust-Cookie

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import { makeTrustToken, verifyTrustToken, MFA_TRUST_COOKIE, MFA_TRUST_TTL_S } from "@/lib/mfa-trust";

export const dynamic = "force-dynamic";

// GET — prüft ob ein gültiges Trust-Cookie da ist
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ trusted: false, reason: "not logged in" }, { status: 401 });
  }

  const jar = await cookies();
  const token = jar.get(MFA_TRUST_COOKIE)?.value;
  const trusted = verifyTrustToken(token, user.id);
  return NextResponse.json({ trusted });
}

// POST — setzt das Trust-Cookie nach erfolgreichem MFA-Verify
// Body: { trust: true } (optional)
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not logged in" }, { status: 401 });
  }

  // Nur erlauben wenn User WIRKLICH gerade aal2 hat (= echter MFA-Verify gerade passiert)
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalData?.currentLevel !== "aal2") {
    return NextResponse.json({ error: "AAL2 required to set trust" }, { status: 403 });
  }

  const token = makeTrustToken(user.id);
  const jar = await cookies();
  jar.set(MFA_TRUST_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: MFA_TRUST_TTL_S,
  });

  return NextResponse.json({ ok: true, expires_at: new Date(Date.now() + MFA_TRUST_TTL_S * 1000).toISOString() });
}

// DELETE — Trust aufheben (z.B. nach MFA-Reset oder explizitem User-Logout)
export async function DELETE() {
  const jar = await cookies();
  jar.delete(MFA_TRUST_COOKIE);
  return NextResponse.json({ ok: true });
}
