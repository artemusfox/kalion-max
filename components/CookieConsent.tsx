"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readConsent, writeConsent, type ConsentValue } from "@/lib/consent";
import { useLanguage } from "@/components/LanguageProvider";

export default function CookieConsent() {
  const { t } = useLanguage();
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
        {t("consent.title")}
      </div>
      <div id="cookie-desc" style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 14 }}>
        {t("consent.desc")}
        {" "}<Link href="/datenschutz" style={{ color: "var(--accent)" }}>{t("consent.more")}</Link>.
      </div>

      {showDetail && (
        <div style={{ marginBottom: 14 }}>
          <Section
            title={t("consent.cat.necessary")}
            subtitle={t("consent.cat.necessary.sub")}
            color="var(--text-dim)"
            forced
            forcedLabel={t("common.required")}
          >
            <li>Supabase Auth-Session-Cookie</li>
            <li>Theme &amp; language (localStorage)</li>
            <li>2FA factor &amp; recovery cookies</li>
          </Section>
          <Section
            title={t("consent.cat.analytics")}
            subtitle={t("consent.cat.analytics.sub")}
            color="var(--accent)"
            forcedLabel=""
          >
            <li>Vercel Web Analytics</li>
            <li>No cookies, no personal data</li>
          </Section>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => decide("necessary")}
          className="btn"
          style={{ fontSize: 12, padding: "10px 14px" }}
        >{t("consent.necessary")}</button>
        <button
          onClick={() => decide("all")}
          className="btn btn-primary"
          style={{ fontSize: 12, padding: "10px 14px" }}
        >{t("consent.all")}</button>
      </div>

      <button
        onClick={() => setShowDetail((s) => !s)}
        className="btn btn-ghost"
        style={{ fontSize: 11, padding: "6px 12px", width: "100%" }}
      >
        {showDetail ? t("consent.details.hide") : t("consent.details.show")}
      </button>
    </div>
  );
}

function Section({
  title, subtitle, color, forced, forcedLabel, children,
}: {
  title: string; subtitle: string; color: string;
  forced?: boolean; forcedLabel?: string; children: React.ReactNode;
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
          }}>{(forcedLabel || "REQUIRED").toUpperCase()}</span>
        )}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>{subtitle}</div>
      <ul style={{ fontSize: 11, color: "var(--text-dim)", paddingLeft: 18, lineHeight: 1.6 }}>
        {children}
      </ul>
    </div>
  );
}
