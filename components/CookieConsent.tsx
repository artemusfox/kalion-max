"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readConsent, writeConsent, type ConsentValue } from "@/lib/consent";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    // Beim ersten Mount: prüfe ob Consent fehlt
    if (readConsent() === null) {
      // Kleiner Delay, damit's nicht direkt beim Laden popt
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
    // Lausche auf Re-Open-Event vom Footer-Link
    const reopen = () => { setOpen(true); setShowDetail(true); };
    window.addEventListener("kalion-consent-reopen", reopen);
    return () => window.removeEventListener("kalion-consent-reopen", reopen);
  }, []);

  function decide(v: ConsentValue) {
    writeConsent(v);
    setOpen(false);
    setShowDetail(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
      style={{
        position: "fixed",
        bottom: 16, left: 16, right: 16,
        maxWidth: 560, marginLeft: "auto", marginRight: "auto",
        zIndex: 9998,
        padding: 18,
        background: "var(--bg-raised)",
        border: "1px solid var(--accent-border)",
        borderRadius: 16,
        boxShadow: "var(--shadow-lg)",
        backdropFilter: "blur(20px)",
        animation: "kalion-cookie-slide 0.4s ease-out",
      }}
    >
      <style>{`
        @keyframes kalion-cookie-slide {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div id="cookie-title" style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
        🍪 Cookies & Datenschutz
      </div>
      <div id="cookie-desc" style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 14 }}>
        KALION MAX nutzt technisch notwendige Cookies (Login-Session, Theme-Auswahl) und —
        nur mit deiner Einwilligung — anonyme Reichweitenanalyse via Vercel Web Analytics.
        Du kannst deine Wahl jederzeit über den Footer-Link ändern.
        {" "}<Link href="/datenschutz" style={{ color: "var(--accent)" }}>Mehr erfahren</Link>.
      </div>

      {showDetail && (
        <div style={{ marginBottom: 14 }}>
          <Section
            title="Notwendig"
            subtitle="Immer aktiv — für Login und App-Funktion erforderlich"
            color="var(--text-dim)"
            forced
          >
            <li>Supabase Auth-Session-Cookie</li>
            <li>Theme- &amp; Spracheinstellungen (localStorage)</li>
            <li>2FA-Faktor- &amp; Recovery-Cookies</li>
          </Section>
          <Section
            title="Reichweitenmessung"
            subtitle="Anonym, ohne IP-Speicherung — opt-in"
            color="var(--accent)"
          >
            <li>Vercel Web Analytics — Seitenaufrufe und Web-Vitals</li>
            <li>Keine Cookies, keine personenbezogenen Daten</li>
          </Section>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => decide("necessary")}
          className="btn"
          style={{ fontSize: 12, padding: "10px 14px" }}
        >Nur notwendige</button>
        <button
          onClick={() => decide("all")}
          className="btn btn-primary"
          style={{ fontSize: 12, padding: "10px 14px" }}
        >Alle akzeptieren</button>
      </div>

      <button
        onClick={() => setShowDetail((s) => !s)}
        className="btn btn-ghost"
        style={{ fontSize: 11, padding: "6px 12px", width: "100%" }}
      >
        {showDetail ? "Details ausblenden ↑" : "Details / Verwalten ↓"}
      </button>
    </div>
  );
}

function Section({
  title, subtitle, color, forced, children,
}: {
  title: string; subtitle: string; color: string;
  forced?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{
      padding: 10, background: "var(--bg-elevated)", borderRadius: 10,
      border: "1px solid var(--border)", marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color }}>{title}</div>
        {forced && (
          <span style={{
            fontSize: 9, fontWeight: 800, padding: "2px 6px",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 4, color: "var(--text-muted)", letterSpacing: 1,
          }}>PFLICHT</span>
        )}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>{subtitle}</div>
      <ul style={{ fontSize: 11, color: "var(--text-dim)", paddingLeft: 18, lineHeight: 1.6 }}>
        {children}
      </ul>
    </div>
  );
}
