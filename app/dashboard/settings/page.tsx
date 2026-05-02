"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useTheme, THEMES, SURFACES } from "@/components/ThemeProvider";
import { isVoiceEnabled, setVoiceEnabled, isVoiceSupported, speak } from "@/lib/voice";
import MfaSettings from "@/components/MfaSettings";
import UnitsSettings from "@/components/UnitsSettings";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>}>
      <SettingsInner />
    </Suspense>
  );
}

function SettingsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { theme, setTheme, surface, setSurface } = useTheme();
  const mfaRequired = searchParams.get("mfa-required") === "1";
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  useEffect(() => {
    setVoiceSupported(isVoiceSupported());
    setVoiceOn(isVoiceEnabled());
  }, []);
  function toggleVoice() {
    const next = !voiceOn;
    setVoiceEnabled(next);
    setVoiceOn(next);
    if (next) speak("Sprachausgabe ist aktiviert");
    toast(next ? "Sprache an" : "Sprache aus", { type: "success", icon: next ? "🔊" : "🔇" });
  }
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setEmail(user.email || "");

    const { data } = await supabase.from("profiles").select("*").single();
    if (data) {
      setProfile(data);
      setDisplayName(data.display_name || "");
    }
    setLoading(false);
  }

  async function saveProfile() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles")
      .update({ display_name: displayName })
      .eq("id", profile.id);
    if (error) toast("Fehler: " + error.message, { type: "error" });
    else toast("Profil gespeichert", { type: "success", icon: "✓" });
    setSaving(false);
  }

  async function changePassword() {
    const newPw = prompt("Neues Passwort eingeben (mind. 6 Zeichen):");
    if (!newPw || newPw.length < 6) return;
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) toast("Fehler: " + error.message, { type: "error" });
    else toast("Passwort geändert", { type: "success", icon: "🔒" });
  }

  async function deleteAccount() {
    if (!confirm("Account WIRKLICH löschen? Alle deine Daten werden unwiderruflich gelöscht!")) return;
    if (!confirm("Bist du absolut sicher?")) return;
    const supabase = createClient();
    // Der Server muss den User löschen — wir rufen einen RPC auf
    try {
      await supabase.rpc("delete_own_account");
    } catch {
      // Fehler ignorieren — Logout erfolgt trotzdem
    }
    await supabase.auth.signOut();
    router.push("/");
  }

  async function exportData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [profile, workouts, prs, measurements, goals, nutrition, foods, meals, supps, suppLogs] = await Promise.all([
      supabase.from("profiles").select("*").single(),
      supabase.from("workouts").select("*"),
      supabase.from("personal_records").select("*"),
      supabase.from("body_measurements").select("*"),
      supabase.from("goals").select("*"),
      supabase.from("nutrition_logs").select("*"),
      supabase.from("foods").select("*"),
      supabase.from("meal_entries").select("*"),
      supabase.from("supplements").select("*"),
      supabase.from("supplement_logs").select("*"),
    ]);
    const bundle = {
      exportedAt: new Date().toISOString(),
      profile: profile.data,
      workouts: workouts.data,
      personal_records: prs.data,
      body_measurements: measurements.data,
      goals: goals.data,
      nutrition_logs: nutrition.data,
      foods: foods.data,
      meal_entries: meals.data,
      supplements: supps.data,
      supplement_logs: suppLogs.data,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kalion-max-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup heruntergeladen", { type: "success", icon: "💾" });
  }

  if (loading) return <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;

  return (
    <div>
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>👤 Profil</div>
        <div className="form-group">
          <label className="form-label">E-Mail</label>
          <input className="form-input" value={email} disabled />
        </div>
        <div className="form-group">
          <label className="form-label">Anzeigename</label>
          <input className="form-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} />
        </div>
        <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
          {saving ? <div className="spinner" /> : "Speichern"}
        </button>
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>🎨 Akzent-Farbe</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
          Wirkt sofort und gilt nur für dich auf diesem Gerät.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); toast(`Theme: ${t.label}`, { type: "success", icon: "🎨" }); }}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: active ? `2px solid ${t.preview}` : "1px solid var(--border)",
                  background: active ? `${t.preview}15` : "var(--bg-elevated)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "var(--text)",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.preview}, ${t.preview}88)`,
                  boxShadow: active ? `0 0 12px ${t.preview}` : "none",
                  flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{t.label}</div>
                  {active && <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>aktiv</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>🎨 Hintergrund</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
          Stimmung der Flächen — Body und Karten.
        </div>

        {([
          { tone: "dark"   as const, label: "🌑 Dunkel" },
          { tone: "medium" as const, label: "🌗 Mittel" },
          { tone: "light"  as const, label: "☀️ Hell" },
        ]).map((group, gi, arr) => {
          const items = SURFACES.filter((s) => s.tone === group.tone);
          return (
            <div key={group.tone} style={{ marginBottom: gi < arr.length - 1 ? 18 : 0 }}>
              <div style={{
                fontSize: 10, color: "var(--text-muted)", fontWeight: 800,
                letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8,
              }}>{group.label}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                {items.map((s) => {
                  const active = surface === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSurface(s.id); toast(`Hintergrund: ${s.label}`, { type: "success", icon: s.tone === "light" ? "☀️" : s.tone === "medium" ? "🌗" : "🌑" }); }}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        border: active ? "2px solid var(--accent)" : "1px solid var(--border)",
                        background: active ? "var(--accent-tint)" : "var(--bg-elevated)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        color: "var(--text)",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: s.preview,
                        border: "1px solid rgba(127,127,127,0.3)",
                        flexShrink: 0,
                      }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{s.label}</div>
                        {active && <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>aktiv</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>🔊 Workout-Sprachausgabe</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>
          {voiceSupported
            ? "Beim Pausen-Timer wird der Countdown laut angesagt — freihändig im Gym."
            : "Dein Browser unterstützt keine Sprachausgabe."}
        </div>
        <button
          onClick={toggleVoice}
          disabled={!voiceSupported}
          className="btn btn-block"
          style={{
            border: voiceOn ? "1px solid var(--accent)" : "1px solid var(--border)",
            background: voiceOn ? "var(--accent-tint)" : "var(--bg-elevated)",
            color: voiceOn ? "var(--accent)" : "var(--text)",
            opacity: voiceSupported ? 1 : 0.5,
          }}
        >
          {voiceOn ? "🔊 Sprache an — antippen zum Deaktivieren" : "🔇 Sprache aus — antippen zum Aktivieren"}
        </button>
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>📐 Einheiten & Hantelscheiben</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>
          Kg/Lbs, km/Meilen — und welche Hantelscheiben in deinem Studio liegen.
        </div>
        <UnitsSettings />
      </div>

      <div className="card" style={mfaRequired ? { borderColor: "var(--accent)" } : {}}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>🔐 Zwei-Faktor-Authentifizierung</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>
          Zusätzlicher Schutz beim Login: 6-stelliger Code aus deiner Authenticator-App.
        </div>
        <MfaSettings requiresMfa={!!profile?.is_admin} />
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>🔒 Sicherheit</div>
        <button className="btn btn-block" onClick={changePassword}>Passwort ändern</button>
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>💾 Daten</div>
        <button className="btn btn-block" onClick={exportData}>⬇️ Alle Daten exportieren (JSON)</button>
      </div>

      <div className="card" style={{ borderColor: "rgba(255,90,107,0.3)" }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, color: "var(--red)" }}>⚠️ Gefahrenzone</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.5 }}>
          Löschen deines Accounts entfernt ALLE deine Daten dauerhaft. Dies kann nicht rückgängig gemacht werden.
        </div>
        <button onClick={deleteAccount} style={{
          padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(255,90,107,0.3)",
          background: "transparent", color: "var(--red)", cursor: "pointer",
          fontFamily: "inherit", fontSize: 13, fontWeight: 800, width: "100%",
        }}>Account löschen</button>
      </div>
    </div>
  );
}
