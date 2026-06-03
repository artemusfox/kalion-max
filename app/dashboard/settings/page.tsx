"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useTheme, THEMES, SURFACES } from "@/components/ThemeProvider";
import { isVoiceEnabled, setVoiceEnabled, isVoiceSupported, speak } from "@/lib/voice";
import MfaSettings from "@/components/MfaSettings";
import UnitsSettings from "@/components/UnitsSettings";
import WidgetSettings from "@/components/WidgetSettings";
import UserAvatar from "@/components/UserAvatar";
import AvatarPicker from "@/components/AvatarPicker";
import SubscriptionCard from "@/components/SubscriptionCard";
import PaywallModal from "@/components/PaywallModal";
import { isPro } from "@/lib/premium";
import LanguageSwitch from "@/components/LanguageSwitch";
import { useLanguage } from "@/components/LanguageProvider";

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
  const { theme, setTheme, surface, setSurface, customAccent, setCustomAccent } = useTheme();
  const { t: tr, lang } = useLanguage();
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setEmail(user.email || "");

    if (user) {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) console.error("[settings] profile load failed", error);
      if (data) {
        console.log("[settings] profile loaded", {
          is_admin: data.is_admin, is_pro_granted: data.is_pro_granted,
          subscription_tier: data.subscription_tier, subscription_status: data.subscription_status,
        });
        setProfile(data);
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || null);
      }
    }
    setLoading(false);
  }

  async function saveProfile() {
    if (saving) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast("Nicht eingeloggt", { type: "error" });
        return;
      }
      const trimmed = (displayName || "").trim();
      if (!trimmed) {
        toast("Anzeigename darf nicht leer sein", { type: "error" });
        return;
      }
      const { error } = await supabase.from("profiles")
        .update({ display_name: trimmed, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) {
        toast("Fehler: " + error.message, { type: "error" });
        return;
      }
      // Lokalen State aktualisieren damit Header etc. den neuen Namen zeigen
      setProfile((p: any) => p ? { ...p, display_name: trimmed } : p);
      toast(tr("settings.saved"), { type: "success", icon: "✓" });
    } catch (e: any) {
      toast("Speichern fehlgeschlagen: " + (e?.message || "unbekannt"), { type: "error" });
    } finally {
      setSaving(false);
    }
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
    toast(lang === "en" ? "Backup downloaded" : "Backup heruntergeladen", { type: "success", icon: "💾" });
  }

  if (loading) return <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{tr("settings.profile")}</div>
          <LanguageSwitch compact />
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <UserAvatar avatarUrl={avatarUrl} displayName={displayName} size={64} ring />
          <div style={{ flex: 1 }}>
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="btn"
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              {lang === "en" ? "Change avatar" : "Avatar ändern"}
            </button>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>
              {lang === "en"
                ? "Pick from 20 fitness presets or upload your own photo"
                : "20 Fitness-Vorlagen oder eigenes Foto"}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{tr("common.email")}</label>
          <input className="form-input" value={email} disabled />
        </div>
        <div className="form-group">
          <label className="form-label">{tr("settings.displayname")}</label>
          <input className="form-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} />
        </div>
        <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
          {saving ? <div className="spinner" /> : tr("common.save")}
        </button>

        {showAvatarPicker && (
          <AvatarPicker
            currentUrl={avatarUrl}
            displayName={displayName}
            onClose={() => setShowAvatarPicker(false)}
            onChange={(newUrl) => { setAvatarUrl(newUrl); router.refresh(); }}
          />
        )}
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{tr("settings.theme")}</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
          {tr("settings.theme.desc")}
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

        {/* Custom-Accent (Pro-Feature) */}
        <div style={{
          marginTop: 14, padding: 12,
          background: customAccent ? "var(--accent-tint)" : "var(--bg-elevated)",
          border: `1px solid ${customAccent ? "var(--accent-border)" : "var(--border)"}`,
          borderRadius: 10,
          opacity: !isPro(profile) ? 0.85 : 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: customAccent ? 10 : 0 }}>
            <div style={{ fontSize: 22 }}>🎨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                {lang === "en" ? "Custom accent color" : "Eigene Akzent-Farbe"}
                {!isPro(profile) && (
                  <span style={{
                    fontSize: 9, padding: "2px 6px",
                    background: "var(--accent)", color: "#0a0a10",
                    borderRadius: 4, letterSpacing: 0.5,
                  }}>💎 PRO</span>
                )}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                {customAccent
                  ? (lang === "en" ? `Active: ${customAccent}` : `Aktiv: ${customAccent}`)
                  : (lang === "en" ? "Override theme accent with any hex" : "Theme-Akzent mit beliebigem Hex überschreiben")}
              </div>
            </div>
            {!isPro(profile) ? (
              <button
                onClick={() => { setPaywallFeature(lang === "en" ? "Custom accent color" : "Eigene Akzent-Farbe"); setShowPaywall(true); }}
                className="btn btn-ghost"
                style={{ padding: "5px 10px", fontSize: 11 }}
              >→</button>
            ) : (
              <>
                <input
                  type="color"
                  value={customAccent || "#22D3EE"}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  style={{
                    width: 38, height: 38, padding: 0, border: "1px solid var(--border)",
                    borderRadius: 8, cursor: "pointer", background: "transparent",
                  }}
                />
                {customAccent && (
                  <button
                    onClick={() => setCustomAccent(null)}
                    className="btn btn-ghost"
                    style={{ padding: "5px 10px", fontSize: 11 }}
                  >×</button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{tr("settings.surface")}</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
          {tr("settings.surface.desc")}
        </div>

        {([
          { tone: "dark"   as const, label: tr("settings.surface.dark"), gated: false },
          { tone: "medium" as const, label: tr("settings.surface.medium"), gated: true },
          { tone: "light"  as const, label: tr("settings.surface.light"), gated: true },
        ]).map((group, gi, arr) => {
          const items = SURFACES.filter((s) => s.tone === group.tone);
          const proRequired = group.gated && !isPro(profile);
          return (
            <div key={group.tone} style={{ marginBottom: gi < arr.length - 1 ? 18 : 0 }}>
              <div style={{
                fontSize: 10, color: "var(--text-muted)", fontWeight: 800,
                letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span>{group.label}</span>
                {proRequired && (
                  <span style={{
                    fontSize: 9, padding: "2px 6px",
                    background: "var(--accent)", color: "#0a0a10",
                    borderRadius: 4, letterSpacing: 0.5,
                  }}>💎 PRO</span>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                {items.map((s) => {
                  const active = surface === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (proRequired) {
                          setPaywallFeature(lang === "en" ? "Light & Medium themes" : "Helle & mittlere Themes");
                          setShowPaywall(true);
                          return;
                        }
                        setSurface(s.id);
                        toast(`Hintergrund: ${s.label}`, { type: "success", icon: s.tone === "light" ? "☀️" : s.tone === "medium" ? "🌗" : "🌑" });
                      }}
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
                        opacity: proRequired ? 0.65 : 1,
                        position: "relative",
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
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>
          💎 {lang === "en" ? "Subscription" : "Abonnement"}
        </div>
        <SubscriptionCard />
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{tr("widgets.title")}</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>
          {tr("widgets.desc")}
        </div>
        <WidgetSettings />
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{tr("settings.units")}</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>
          {tr("settings.units.desc")}
        </div>
        <UnitsSettings />
      </div>

      <div className="card" style={mfaRequired ? { borderColor: "var(--accent)" } : {}}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{tr("settings.mfa")}</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>
          {tr("settings.mfa.desc")}
        </div>
        <MfaSettings requiresMfa={!!profile?.is_admin} />
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>{tr("settings.security")}</div>
        <button className="btn btn-block" onClick={changePassword}>{tr("settings.security.pw")}</button>
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>{tr("settings.data")}</div>
        <button className="btn btn-block" onClick={exportData}>{tr("settings.data.export")}</button>
      </div>

      <div className="card" style={{ borderColor: "rgba(255,90,107,0.3)" }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, color: "var(--red)" }}>{tr("settings.danger")}</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.5 }}>
          {tr("settings.danger.desc")}
        </div>
        <button onClick={deleteAccount} style={{
          padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(255,90,107,0.3)",
          background: "transparent", color: "var(--red)", cursor: "pointer",
          fontFamily: "inherit", fontSize: 13, fontWeight: 800, width: "100%",
        }}>{tr("settings.delete")}</button>
      </div>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={paywallFeature}
      />
    </div>
  );
}
