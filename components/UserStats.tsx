"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/components/LanguageProvider";

const REFRESH_MS = 30_000;

type Stats = { online_count: number; total_count: number };

export default function UserStats({ compact = false }: { compact?: boolean }) {
  const { lang } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function fetchStats() {
      const { data } = await supabase.rpc("get_user_stats");
      if (cancelled) return;
      const row = Array.isArray(data) && data[0] ? data[0] : null;
      if (row) {
        setStats({
          online_count: Number(row.online_count) || 0,
          total_count:  Number(row.total_count)  || 0,
        });
        setPulse((p) => p + 1); // triggert Pulse-Animation
      }
    }

    fetchStats();
    const iv = setInterval(fetchStats, REFRESH_MS);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  if (!stats) {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: compact ? "4px 8px" : "6px 12px",
        background: "var(--bg-elevated)", border: "1px solid var(--border)",
        borderRadius: 999, fontSize: compact ? 10 : 11, color: "var(--text-muted)",
      }}>
        <div className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
      </div>
    );
  }

  const onlineLabel = lang === "en" ? "online" : "online";
  const totalLabel  = lang === "en" ? "total"  : "gesamt";

  return (
    <div
      title={lang === "en"
        ? `${stats.online_count} users online · ${stats.total_count} registered total`
        : `${stats.online_count} Nutzer online · ${stats.total_count} registriert insgesamt`}
      style={{
        display: "inline-flex", alignItems: "center",
        gap: compact ? 6 : 10,
        padding: compact ? "4px 10px" : "6px 14px",
        background: "var(--bg-elevated)", border: "1px solid var(--border)",
        borderRadius: 999,
        fontSize: compact ? 10 : 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <style>{`
        @keyframes kalion-online-dot {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(82,217,131,0.55); }
          50%      { transform: scale(1.2); box-shadow: 0 0 0 5px rgba(82,217,131,0); }
        }
        @keyframes kalion-stats-fade {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <span style={{
        width: compact ? 6 : 8, height: compact ? 6 : 8,
        borderRadius: "50%",
        background: "var(--green)",
        animation: "kalion-online-dot 2s ease-in-out infinite",
        flexShrink: 0,
      }} />

      <span
        key={`o-${pulse}`}
        style={{
          color: "var(--green)",
          animation: "kalion-stats-fade 0.3s ease-out",
          fontVariantNumeric: "tabular-nums",
        }}
      >{stats.online_count}</span>
      <span style={{ color: "var(--text-muted)" }}>{onlineLabel}</span>

      <span style={{
        width: 1, height: compact ? 10 : 12,
        background: "var(--border)",
      }} />

      <span
        key={`t-${pulse}`}
        style={{
          color: "var(--text)",
          animation: "kalion-stats-fade 0.3s ease-out",
          fontVariantNumeric: "tabular-nums",
        }}
      >{stats.total_count}</span>
      <span style={{ color: "var(--text-muted)" }}>{totalLabel}</span>
    </div>
  );
}
