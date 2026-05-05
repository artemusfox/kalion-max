"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { isTrial, trialDaysLeft, isPro, type ProfileSubscription } from "@/lib/premium";
import PaywallModal from "@/components/PaywallModal";

export default function TrialBanner({ profile }: { profile: ProfileSubscription | null }) {
  const { lang } = useLanguage();
  const [showPaywall, setShowPaywall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // FREE-User: zeige Upgrade-CTA-Banner
  if (!isPro(profile)) {
    return (
      <>
        <div
          onClick={() => setShowPaywall(true)}
          style={{
            padding: "12px 16px",
            background: "linear-gradient(135deg, var(--accent-tint), var(--bg-raised))",
            border: "1px solid var(--accent-border)",
            borderRadius: 12, marginBottom: 14,
            display: "flex", alignItems: "center", gap: 12,
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div style={{ fontSize: 24, flexShrink: 0 }}>💎</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--accent)" }}>
              {lang === "en" ? "Try Pro free for 7 days" : "7 Tage gratis Pro testen"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
              {lang === "en"
                ? "Unlimited everything · AI coach · all themes · cancel anytime"
                : "Alles unbegrenzt · KI-Coach · alle Themes · jederzeit kündbar"}
            </div>
          </div>
          <div style={{
            fontSize: 10, fontWeight: 800, padding: "6px 10px",
            background: "var(--accent)", color: "#0a0a10", borderRadius: 6,
            letterSpacing: 0.5, flexShrink: 0,
          }}>
            {lang === "en" ? "Try free →" : "Testen →"}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            aria-label="Dismiss"
            style={{
              position: "absolute", top: 4, right: 4,
              width: 22, height: 22, borderRadius: "50%",
              background: "transparent", border: "none",
              color: "var(--text-muted)", cursor: "pointer",
              fontSize: 14,
            }}
          >×</button>
        </div>
        <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      </>
    );
  }

  // PRO im Trial: zeige Countdown
  if (isTrial(profile)) {
    const days = trialDaysLeft(profile);
    if (days === null) return null;
    const urgent = days <= 2;
    return (
      <div style={{
        padding: "10px 14px",
        background: urgent ? "rgba(255,184,0,0.12)" : "var(--accent-tint)",
        border: `1px solid ${urgent ? "var(--amber)" : "var(--accent-border)"}`,
        borderRadius: 10, marginBottom: 14,
        fontSize: 12, fontWeight: 700,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>{urgent ? "⏳" : "🎁"}</span>
        <span style={{ flex: 1 }}>
          {lang === "en"
            ? `${days} day${days === 1 ? "" : "s"} of free trial left`
            : `Noch ${days} Tag${days === 1 ? "" : "e"} Testphase`}
        </span>
        <Link href="/dashboard/settings#subscription" style={{
          color: urgent ? "var(--amber)" : "var(--accent)",
          textDecoration: "none", fontSize: 11,
        }}>
          {lang === "en" ? "Manage" : "Verwalten"}
        </Link>
      </div>
    );
  }

  return null;
}
