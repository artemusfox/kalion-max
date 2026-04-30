"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { getFirstVerifiedFactorId, getAalState } from "@/lib/mfa";

export default function MfaChallengePage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const aal = await getAalState(supabase);
      // Wenn schon aal2 oder gar keine Factors → direkt weiter
      if (aal.currentLevel === "aal2" || !aal.hasVerifiedFactor) {
        router.replace(next);
        return;
      }
      const id = await getFirstVerifiedFactorId(supabase);
      if (!id) { router.replace(next); return; }
      setFactorId(id);
    })();
  }, [router, next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || code.length !== 6) return;
    setBusy(true); setError(null);
    const supabase = createClient();
    const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({ factorId });
    if (chalErr || !chal) { setBusy(false); setError("Challenge fehlgeschlagen — neu laden"); return; }
    const { error } = await supabase.auth.mfa.verify({
      factorId, challengeId: chal.id, code,
    });
    if (error) {
      setBusy(false);
      setError("Code falsch oder abgelaufen — versuche den nächsten");
      setCode("");
      return;
    }
    toast("Verifiziert ⚡", { type: "success", icon: "🔐" });
    router.replace(next);
    router.refresh();
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand" style={{ fontSize: 28, marginBottom: 8, display: "flex", justifyContent: "center" }}>
            <span className="brand-kalion">KALION</span>
            <span className="brand-bolt">⚡</span>
            <span className="brand-max">MAX</span>
          </div>
          <div className="auth-title">🔐 Zwei-Faktor</div>
          <div className="auth-sub">Code aus deiner Authenticator-App</div>
        </div>

        <form onSubmit={submit}>
          <input
            className="form-input"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(null); }}
            placeholder="000000"
            autoFocus
            autoComplete="one-time-code"
            style={{
              fontSize: 26, textAlign: "center", letterSpacing: 10,
              fontFamily: "var(--font-mono)", marginBottom: 16,
            }}
          />

          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={busy || code.length !== 6 || !factorId}
          >
            {busy ? <div className="spinner" /> : "Bestätigen"}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: 14 }}>
          <button onClick={logout} className="btn btn-ghost" style={{ fontSize: 12 }}>
            Abbrechen / Logout
          </button>
        </div>

        <div style={{
          marginTop: 16, padding: 10, background: "var(--bg-elevated)",
          borderRadius: 8, fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5,
        }}>
          Authenticator weg? Ein Admin kann dein 2FA zurücksetzen — schreib uns an{" "}
          <Link href="/" style={{ color: "var(--accent)" }}>support</Link>.
        </div>
      </div>
    </div>
  );
}
