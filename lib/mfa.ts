// ═══════════════════════════════════════════════════════════
// MFA / 2FA Helper — gemeinsame Logik für Settings + Login
// ═══════════════════════════════════════════════════════════

import type { SupabaseClient } from "@supabase/supabase-js";

export type AalState = {
  currentLevel: "aal1" | "aal2" | null;
  nextLevel: "aal1" | "aal2" | null;
  needsChallenge: boolean;       // User hat MFA enrolled, aber Session ist erst aal1
  hasVerifiedFactor: boolean;    // mind. ein Faktor ist verifiziert
};

export async function getAalState(supabase: SupabaseClient): Promise<AalState> {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const totp = factorsData?.totp ?? [];
  const verified = totp.filter((f: any) => f.status === "verified");
  return {
    currentLevel: (data?.currentLevel as any) ?? null,
    nextLevel: (data?.nextLevel as any) ?? null,
    needsChallenge: data?.currentLevel === "aal1" && data?.nextLevel === "aal2",
    hasVerifiedFactor: verified.length > 0,
  };
}

export async function getFirstVerifiedFactorId(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase.auth.mfa.listFactors();
  const verified = (data?.totp ?? []).find((f: any) => f.status === "verified");
  return verified?.id ?? null;
}
