"use client";

import { useState, type ReactNode } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import PaywallModal from "@/components/PaywallModal";

type Props = {
  isPro: boolean;
  feature?: string;
  children: ReactNode;
  // Variante 1: rendere Children, aber sie sind disabled + locked
  showLock?: boolean;
  // Variante 2: Block ganz verstecken und Paywall-Hint zeigen
  hideContent?: boolean;
};

export default function PremiumGate({
  isPro, feature, children, showLock = false, hideContent = false,
}: Props) {
  const { lang } = useLanguage();
  const [showPaywall, setShowPaywall] = useState(false);

  if (isPro) return <>{children}</>;

  if (hideContent) {
    return (
      <>
        <div
          onClick={() => setShowPaywall(true)}
          style={{
            padding: 14, borderRadius: 12,
            background: "var(--accent-tint)", border: "1px solid var(--accent-border)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <div style={{ fontSize: 24 }}>💎</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--accent)" }}>
              {lang === "en" ? "Pro feature" : "Pro-Feature"}
              {feature ? ` — ${feature}` : ""}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
              {lang === "en" ? "Tap to upgrade" : "Tippen zum Upgraden"}
            </div>
          </div>
          <div style={{ fontSize: 18, color: "var(--accent)" }}>→</div>
        </div>
        <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} feature={feature} />
      </>
    );
  }

  // Variante 1: Children rendern, aber overlay drüber
  return (
    <>
      <div
        onClick={() => setShowPaywall(true)}
        style={{ position: "relative", cursor: "pointer" }}
      >
        <div style={{
          opacity: showLock ? 0.5 : 1,
          pointerEvents: showLock ? "none" : "auto",
          filter: showLock ? "blur(0.5px)" : "none",
        }}>
          {children}
        </div>
        {showLock && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, transparent, var(--accent-tint))",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            paddingBottom: 12, borderRadius: "inherit",
            pointerEvents: "none",
          }}>
            <div style={{
              padding: "6px 14px", background: "var(--accent)",
              color: "#0a0a10", borderRadius: 999,
              fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
              boxShadow: "0 4px 16px var(--accent-glow)",
            }}>
              💎 {lang === "en" ? "Pro" : "Pro"}
            </div>
          </div>
        )}
      </div>
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} feature={feature} />
    </>
  );
}
