"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";

type EnrollData = { factorId: string; qrCode: string; secret: string };

export default function MfaSettings({ requiresMfa }: { requiresMfa?: boolean }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasMfa, setHasMfa] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enroll, setEnroll] = useState<EnrollData | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = (data?.totp ?? []).some((f: any) => f.status === "verified");
    setHasMfa(verified);
    setLoading(false);
  }

  async function startEnrollment() {
    setBusy(true);
    const supabase = createClient();
    // Alte unverified-Factors zuerst aufräumen, sonst Konflikt
    const { data: list } = await supabase.auth.mfa.listFactors();
    const unverified = (list?.totp ?? []).filter((f: any) => f.status !== "verified");
    for (const f of unverified) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Kalion-Auth-${Date.now()}`,
    });
    setBusy(false);
    if (error || !data) { toast("Enrollment fehlgeschlagen: " + (error?.message ?? "unbekannt"), { type: "error" }); return; }
    setEnroll({
      factorId: data.id,
      qrCode: (data as any).totp?.qr_code ?? "",
      secret: (data as any).totp?.secret ?? "",
    });
    setEnrolling(true);
  }

  async function cancelEnrollment() {
    if (!enroll) { setEnrolling(false); return; }
    const supabase = createClient();
    await supabase.auth.mfa.unenroll({ factorId: enroll.factorId });
    setEnroll(null);
    setEnrolling(false);
    setCode("");
  }

  async function verifyEnrollment() {
    if (!enroll || code.length !== 6) return;
    setBusy(true);
    const supabase = createClient();
    const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({ factorId: enroll.factorId });
    if (chalErr || !chal) { setBusy(false); toast("Challenge fehlgeschlagen", { type: "error" }); return; }
    const { error } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: chal.id,
      code,
    });
    setBusy(false);
    if (error) { toast("Code falsch — versuche nochmal (Zeitsync prüfen)", { type: "error" }); return; }
    toast("2FA aktiviert! 🔐", { type: "success", icon: "🔐" });
    setEnrolling(false);
    setEnroll(null);
    setCode("");
    setHasMfa(true);
  }

  async function disableMfa() {
    if (requiresMfa) {
      toast("Admin-Accounts müssen 2FA aktiviert lassen", { type: "error", icon: "🛡️" });
      return;
    }
    if (!confirm("2FA wirklich deaktivieren? Dein Account ist danach nur noch durch das Passwort geschützt.")) return;
    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    for (const f of (data?.totp ?? [])) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    setBusy(false);
    setHasMfa(false);
    toast("2FA deaktiviert", { type: "info", icon: "🔓" });
  }

  if (loading) return <div style={{ padding: 20, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;

  if (enrolling && enroll) {
    return (
      <div style={{ padding: 4 }}>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>
          <strong>Schritt 1:</strong> QR-Code mit deiner Authenticator-App scannen (Google Authenticator, 1Password, Authy, …) — oder den Schlüssel manuell eintragen.
        </div>

        <div style={{
          padding: 16, background: "white", borderRadius: 12, marginBottom: 14,
          display: "flex", justifyContent: "center",
        }}>
          {/* Supabase liefert qr_code als data-URI mit SVG */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qrCode} alt="QR-Code für Authenticator" style={{ width: 200, height: 200 }} />
        </div>

        <div style={{
          fontSize: 11, color: "var(--text-muted)", textAlign: "center",
          marginBottom: 4, fontWeight: 700, letterSpacing: 1,
        }}>MANUELL EINTRAGEN</div>
        <div style={{
          padding: 10, background: "var(--bg-elevated)", borderRadius: 8,
          fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "center",
          marginBottom: 16, wordBreak: "break-all", letterSpacing: 1,
        }}>{enroll.secret}</div>

        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8, lineHeight: 1.5 }}>
          <strong>Schritt 2:</strong> Den 6-stelligen Code aus der App eingeben:
        </div>
        <input
          className="form-input"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          style={{ fontSize: 22, textAlign: "center", letterSpacing: 8, fontFamily: "var(--font-mono)", marginBottom: 14 }}
          autoFocus
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button onClick={cancelEnrollment} disabled={busy} className="btn">Abbrechen</button>
          <button
            onClick={verifyEnrollment}
            disabled={busy || code.length !== 6}
            className="btn btn-primary"
          >
            {busy ? <div className="spinner" /> : "Aktivieren"}
          </button>
        </div>

        <div style={{
          marginTop: 14, padding: 10, background: "var(--accent-tint)",
          borderRadius: 8, fontSize: 11, color: "var(--accent)", lineHeight: 1.5,
        }}>
          ⚠️ <strong>Wichtig:</strong> Bewahre den Schlüssel oben sicher auf (z. B. in einem Passwort-Manager). Falls du dein Handy verlierst, kannst du damit den Authenticator auf einem neuen Gerät wieder einrichten.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
        padding: 12, background: hasMfa ? "var(--accent-tint)" : "var(--bg-elevated)",
        border: `1px solid ${hasMfa ? "var(--accent-border)" : "var(--border)"}`,
        borderRadius: 10,
      }}>
        <div style={{ fontSize: 24 }}>{hasMfa ? "🔐" : "🔓"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>
            {hasMfa ? "2FA ist aktiv" : "2FA ist deaktiviert"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
            {hasMfa
              ? "Beim Login wird zusätzlich ein Code aus deinem Authenticator verlangt."
              : "Nur Passwort schützt deinen Account."}
          </div>
        </div>
      </div>

      {requiresMfa && !hasMfa && (
        <div style={{
          padding: 10, background: "var(--accent-tint)",
          borderRadius: 8, fontSize: 12, color: "var(--accent)",
          lineHeight: 1.5, marginBottom: 14, border: "1px solid var(--accent-border)",
        }}>
          🛡️ <strong>Admin-Account:</strong> 2FA ist Pflicht. Solange nicht aktiviert, kannst du den Admin-Bereich nicht betreten.
        </div>
      )}

      {!hasMfa ? (
        <button
          onClick={startEnrollment}
          disabled={busy}
          className="btn btn-primary btn-block"
        >{busy ? <div className="spinner" /> : "🔐 2FA aktivieren"}</button>
      ) : (
        <button
          onClick={disableMfa}
          disabled={busy || requiresMfa}
          className="btn btn-block"
          style={{
            border: "1px solid rgba(255,90,107,0.3)", background: "transparent",
            color: requiresMfa ? "var(--text-muted)" : "var(--red)",
            cursor: requiresMfa ? "not-allowed" : "pointer",
          }}
        >
          {requiresMfa ? "🔐 Erforderlich für Admin" : "🔓 2FA deaktivieren"}
        </button>
      )}
    </div>
  );
}
