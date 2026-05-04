"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/components/LanguageProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  feature?: string; // optional: welches Feature hat den Paywall getriggert (für Headline-Variation)
};

const FEATURES_DE = [
  { icon: "♾️", title: "Unbegrenzte Pläne, Fotos, Historie",  desc: "Keine Limits mehr — speicher alles was du willst." },
  { icon: "🤖", title: "KI-Coach",                            desc: "Plan-Vorschläge basierend auf deinen Daten + Plateau-Detektor." },
  { icon: "🎨", title: "Alle 16 Themes + Custom-Akzent",      desc: "Helle Themes, mittlere Töne, eigene Brand-Farbe." },
  { icon: "📸", title: "Eigenes Avatar-Foto + Watermark-frei",desc: "Persönliches Foto + saubere Share-Bilder ohne Branding." },
  { icon: "📊", title: "Vollständige Analytics",              desc: "Spider-Chart, Mood-Performance, Recovery-Tracker." },
  { icon: "❤️", title: "Apple Health / Google Health Sync",    desc: "Schritte, Schlaf, HF — automatisch in der App." },
  { icon: "📄", title: "PDF + tägliches Auto-Backup",         desc: "Druckbares Workout-PDF + JSON-Backup per E-Mail." },
];
const FEATURES_EN = [
  { icon: "♾️", title: "Unlimited plans, photos, history",     desc: "No more caps — save anything you want." },
  { icon: "🤖", title: "AI coach",                            desc: "Plan suggestions from your data + plateau detector." },
  { icon: "🎨", title: "All 16 themes + custom accent",        desc: "Light themes, medium tones, your own brand color." },
  { icon: "📸", title: "Custom avatar photo + watermark-free", desc: "Your photo + clean share images without branding." },
  { icon: "📊", title: "Full analytics",                       desc: "Spider chart, mood-performance, recovery tracker." },
  { icon: "❤️", title: "Apple Health / Google Health sync",    desc: "Steps, sleep, heart rate — auto-imported." },
  { icon: "📄", title: "PDF + daily auto backup",             desc: "Printable workout PDF + JSON backup via email." },
];

export default function PaywallModal({ open, onClose, feature }: Props) {
  const { lang } = useLanguage();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) setUser({ id: u.id, email: u.email });
    })();
  }, [open]);

  async function checkout() {
    if (!user) return;
    setBusy(true);
    try {
      const res = await fetch("/api/checkout/lemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setBusy(false);
        alert(json.error || "Checkout failed");
      }
    } catch (e: any) {
      setBusy(false);
      alert(e?.message || "Error");
    }
  }

  if (!open) return null;

  const features = lang === "en" ? FEATURES_EN : FEATURES_DE;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", padding: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "kalion-fade 0.2s ease-out",
      }}
    >
      <style>{`@keyframes kalion-fade { from { opacity: 0 } to { opacity: 1 } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          maxWidth: 480, width: "100%", maxHeight: "92vh", overflowY: "auto",
          margin: 0, padding: 24,
          background: "linear-gradient(180deg, var(--accent-tint) 0%, var(--bg-raised) 30%)",
          borderColor: "var(--accent-border)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: 2, padding: "4px 10px",
            background: "var(--accent)", color: "#0a0a10", borderRadius: 6,
            textTransform: "uppercase",
          }}>{lang === "en" ? "Pro" : "Pro"}</div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "4px 10px" }}>✕</button>
        </div>

        <h2 style={{ fontSize: 26, marginBottom: 6, letterSpacing: -0.5 }}>
          {lang === "en" ? "Unlock everything" : "Schalt alles frei"}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20, lineHeight: 1.5 }}>
          {lang === "en"
            ? "7-day free trial · cancel anytime · no surprises"
            : "7 Tage gratis testen · jederzeit kündbar · keine Überraschungen"}
        </p>

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, lineHeight: 1.4, flexShrink: 0 }}>{f.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan-Switcher */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16,
        }}>
          <PlanCard
            active={plan === "monthly"}
            onClick={() => setPlan("monthly")}
            label={lang === "en" ? "Monthly" : "Monatlich"}
            price="€4,99"
            sub={lang === "en" ? "per month" : "pro Monat"}
          />
          <PlanCard
            active={plan === "yearly"}
            onClick={() => setPlan("yearly")}
            label={lang === "en" ? "Yearly" : "Jährlich"}
            price="€39"
            sub={lang === "en" ? "per year" : "pro Jahr"}
            badge={lang === "en" ? "Save 35%" : "−35%"}
          />
        </div>

        <button
          onClick={checkout}
          disabled={busy || !user}
          className="btn btn-primary btn-block"
          style={{ padding: 16, fontSize: 14 }}
        >
          {busy
            ? <div className="spinner" />
            : (lang === "en" ? "Start 7-day free trial →" : "7 Tage gratis testen →")}
        </button>

        <div style={{
          fontSize: 10, color: "var(--text-muted)", textAlign: "center",
          marginTop: 12, lineHeight: 1.6,
        }}>
          {lang === "en"
            ? "Powered by Lemon Squeezy · Secure checkout · No commitment"
            : "Bezahlung über Lemon Squeezy · Sichere Abwicklung · Keine Bindung"}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ active, onClick, label, price, sub, badge }: {
  active: boolean; onClick: () => void;
  label: string; price: string; sub: string; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        padding: "14px 12px", borderRadius: 12,
        background: active ? "var(--accent-tint)" : "var(--bg-elevated)",
        border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
        cursor: "pointer", textAlign: "center",
        fontFamily: "inherit", color: "var(--text)",
        transition: "all 0.15s",
      }}
    >
      {badge && (
        <span style={{
          position: "absolute", top: -8, right: 8,
          fontSize: 9, fontWeight: 800, padding: "2px 6px",
          background: "var(--accent)", color: "#0a0a10",
          borderRadius: 4, letterSpacing: 0.5,
        }}>{badge}</span>
      )}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1, fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: active ? "var(--accent)" : "var(--text)" }}>{price}</div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>
    </button>
  );
}
