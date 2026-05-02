"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { LANGUAGES } from "@/lib/i18n";

export default function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div style={{
      display: "inline-flex",
      gap: 4, padding: 4,
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      borderRadius: 999,
    }}>
      {LANGUAGES.map((l) => {
        const active = l.id === lang;
        return (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            aria-pressed={active}
            aria-label={l.label}
            style={{
              padding: compact ? "5px 10px" : "6px 14px",
              borderRadius: 999, border: "none",
              background: active ? "var(--accent-tint)" : "transparent",
              color: active ? "var(--accent)" : "var(--text-dim)",
              cursor: "pointer", fontFamily: "inherit",
              fontSize: compact ? 11 : 12, fontWeight: 800,
              display: "inline-flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: compact ? 12 : 14 }}>{l.flag}</span>
            {!compact && <span>{l.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
