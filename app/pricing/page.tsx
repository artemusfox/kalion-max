"use client";

import { useState } from "react";
import Link from "next/link";
import LegalFooter from "@/components/LegalFooter";
import LanguageSwitch from "@/components/LanguageSwitch";
import BrandLogo from "@/components/BrandLogo";
import PaywallModal from "@/components/PaywallModal";
import { useLanguage } from "@/components/LanguageProvider";

export default function PricingPage() {
  const { lang } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const features = lang === "en" ? [
    { txt: "Unlimited workout history", free: false },
    { txt: "Up to 3 plans / 5 photos", free: true },
    { txt: "Unlimited plans, photos, custom exercises", free: false },
    { txt: "Habits + Morning/Evening routines", free: true },
    { txt: "AI workout coach", free: false },
    { txt: "All 16 themes (dark, medium, light)", free: false },
    { txt: "6 dark themes only", free: true },
    { txt: "Custom avatar photo upload", free: false },
    { txt: "20 fitness preset avatars", free: true },
    { txt: "Watermark-free workout shares", free: false },
    { txt: "Apple Health / Google Health Connect sync", free: false },
    { txt: "Full analytics (spider chart, mood↔perf)", free: false },
    { txt: "PDF export + daily auto-backup", free: false },
  ] : [
    { txt: "Unbegrenzte Workout-Historie", free: false },
    { txt: "Bis 3 Pläne / 5 Fotos", free: true },
    { txt: "Unbegrenzte Pläne, Fotos, eigene Übungen", free: false },
    { txt: "Habits + Morgen-/Abend-Routinen", free: true },
    { txt: "KI-Workout-Coach", free: false },
    { txt: "Alle 16 Themes (dunkel, mittel, hell)", free: false },
    { txt: "Nur 6 dunkle Themes", free: true },
    { txt: "Eigenes Avatar-Foto hochladen", free: false },
    { txt: "20 Fitness-Preset-Avatare", free: true },
    { txt: "Watermark-freie Share-Bilder", free: false },
    { txt: "Apple Health / Google Health Connect Sync", free: false },
    { txt: "Vollständige Analytics (Spider-Chart, Mood↔Perf)", free: false },
    { txt: "PDF-Export + tägliches Auto-Backup", free: false },
  ];

  return (
    <div className="auth-wrap" style={{ alignItems: "flex-start", padding: 20 }}>
      <div style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <BrandLogo size={42} textSize={20} />
          </Link>
          <LanguageSwitch compact />
        </div>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 40, marginBottom: 12, letterSpacing: -1 }}>
            {lang === "en" ? "Simple pricing" : "Einfache Preise"}
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-dim)", maxWidth: 540, margin: "0 auto", lineHeight: 1.5 }}>
            {lang === "en"
              ? "Start free, upgrade when you want more. 7 days free trial, cancel anytime."
              : "Gratis starten, upgraden wenn du mehr willst. 7 Tage Testphase, jederzeit kündbar."}
          </p>
        </div>

        {/* Tier-Karten */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 40 }}>
          {/* FREE */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
              Free
            </div>
            <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>€0</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
              {lang === "en" ? "forever" : "für immer"}
            </div>
            <Link href="/auth/signup" className="btn btn-block" style={{ marginBottom: 20 }}>
              {lang === "en" ? "Start free" : "Gratis starten"}
            </Link>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {features.filter((f) => f.free).map((f, i) => (
                <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-dim)" }}>
                  <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>
                  <span>{f.txt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* PRO */}
          <div className="card" style={{
            padding: 28,
            background: "linear-gradient(180deg, var(--accent-tint) 0%, var(--bg-raised) 50%)",
            borderColor: "var(--accent)",
            position: "relative",
            boxShadow: "0 8px 32px var(--accent-glow)",
          }}>
            <div style={{
              position: "absolute", top: -10, left: 24,
              fontSize: 9, fontWeight: 800, letterSpacing: 2, padding: "4px 10px",
              background: "var(--accent)", color: "#0a0a10", borderRadius: 4,
              textTransform: "uppercase",
            }}>{lang === "en" ? "Most Popular" : "Beliebt"}</div>

            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
              💎 Pro
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1 }}>€39</div>
              <div style={{ fontSize: 14, color: "var(--text-dim)" }}>
                / {lang === "en" ? "year" : "Jahr"}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
              {lang === "en"
                ? "or €4.99 / month · 7-day trial"
                : "oder €4,99 / Monat · 7 Tage Testphase"}
            </div>
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-block" style={{ marginBottom: 20 }}>
              {lang === "en" ? "Start 7-day trial →" : "7 Tage gratis testen →"}
            </button>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {features.filter((f) => !f.free).map((f, i) => (
                <li key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                  <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>
                  <span>{f.txt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>FAQ</h3>
          <Faq q={lang === "en" ? "Can I cancel anytime?" : "Kann ich jederzeit kündigen?"}
               a={lang === "en"
                 ? "Yes — one click in your account, no questions asked. You keep Pro until the end of your paid period."
                 : "Ja — ein Klick in deinem Account, keine Fragen. Du behältst Pro bis zum Ende der bezahlten Periode."} />
          <Faq q={lang === "en" ? "What happens after trial ends?" : "Was passiert nach der Testphase?"}
               a={lang === "en"
                 ? "If you don't cancel, the subscription starts automatically. We send a reminder 1 day before."
                 : "Wenn du nicht kündigst, startet das Abo automatisch. Wir schicken dir 1 Tag vorher eine Erinnerung."} />
          <Faq q={lang === "en" ? "Do my workouts get deleted on Free?" : "Werden meine Workouts auf Free gelöscht?"}
               a={lang === "en"
                 ? "Never. Free shows the last 30 days, but everything is preserved. Upgrade and full history is back."
                 : "Niemals. Free zeigt nur die letzten 30 Tage, aber alles bleibt gespeichert. Upgrade → volle Historie wieder da."} />
          <Faq q={lang === "en" ? "Payment methods?" : "Zahlungsmethoden?"}
               a={lang === "en"
                 ? "Credit card, PayPal, Apple Pay, Google Pay — handled by Lemon Squeezy."
                 : "Kreditkarte, PayPal, Apple Pay, Google Pay — über Lemon Squeezy."} />
        </div>

        <LegalFooter />

        <PaywallModal open={showModal} onClose={() => setShowModal(false)} />
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details style={{ borderBottom: "1px solid var(--border)", padding: "12px 0" }}>
      <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 800, listStyle: "none" }}>
        {q}
      </summary>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 8, lineHeight: 1.6 }}>{a}</div>
    </details>
  );
}
