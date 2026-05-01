"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { getFirstVerifiedFactorId, getAalState } from "@/lib/mfa";
import { normalizeCode } from "@/lib/recovery-codes";
import BrandLogo from "@/components/BrandLogo";

export default function MfaChallengePage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [mode, setMode] = useState<"totp" | "recovery">("totp");
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

  async function submitRecovery(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = normalizeCode(recoveryCode);
    if (!cleaned) return;
    setBusy(true); setError(null);
    const supabase = createClient();
    const { data, error: rpcErr } = await supabase.rpc("mfa_consume_recovery_code", { p_code: cleaned });
    setBusy(false);
    if (rpcErr) { setError("Fehler beim Einlösen — versuche nochmal"); return; }
    if (!data) {
      setError("Code ungültig oder bereits verwendet");
      setRecoveryCode("");
      return;
    }
    toast("2FA wurde zurückgesetzt — bitte neu einrichten", { type: "success", icon: "🔓" });
    // Session ist nun aal1, aber kein Faktor mehr → AAL-Check wird durchgehen
    router.replace(next.includes("/admin") ? "/dashboard/settings?mfa-required=1" : next);
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
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <BrandLogo size={56} textSize={26} />
          </div>
          <div className="auth-title">🔐 Zwei-Faktor</div>
          <div className="auth-sub">
            {mode === "totp" ? "Code aus deiner Authenticator-App" : "Notfall-Code eingeben"}
          </div>
        </div>

        {mode === "totp" ? (
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
        ) : (
          <form onSubmit={submitRecovery}>
            <input
              className="form-input"
              value={recoveryCode}
              onChange={(e) => { setRecoveryCode(e.target.value); setError(null); }}
              placeholder="abcde-fghij"
              autoFocus
              autoComplete="off"
              style={{
                fontSize: 18, textAlign: "center", letterSpacing: 2,
                fontFamily: "var(--font-mono)", marginBottom: 14,
              }}
            />

            <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5, padding: "0 4px" }}>
              ⚠️ Ein Notfall-Code <strong>setzt deine 2FA zurück</strong>. Du wirst danach zum Settings geleitet, um sie neu einzurichten.
            </div>

            {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={busy || normalizeCode(recoveryCode).length < 6}
            >
              {busy ? <div className="spinner" /> : "Code einlösen"}
            </button>
          </form>
        )}

        <div className="auth-switch" style={{ marginTop: 14, display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={() => { setMode(mode === "totp" ? "recovery" : "totp"); setError(null); setCode(""); setRecoveryCode(""); }}
            className="btn btn-ghost"
            style={{ fontSize: 12 }}
          >
            {mode === "totp" ? "🆘 Notfall-Code verwenden" : "← Zurück zum App-Code"}
          </button>
        </div>

        <div className="auth-switch" style={{ marginTop: 8 }}>
          <button onClick={logout} className="btn btn-ghost" style={{ fontSize: 12 }}>
            Abbrechen / Logout
          </button>
        </div>
      </div>
    </div>
  );
}
