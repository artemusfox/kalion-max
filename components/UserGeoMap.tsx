"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/components/LanguageProvider";
import { flagEmoji, countryName } from "@/lib/countries";

type Row = { country: string; country_name: string | null; user_count: number };

export default function UserGeoMap({ compact = false }: { compact?: boolean }) {
  const { lang } = useLanguage();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("get_country_stats");
      if (cancelled) return;
      if (error) { setFailed(true); return; }
      setRows((data as any) || []);
    })();
    return () => { cancelled = true; };
  }, []);

  if (failed) {
    return (
      <div style={{
        padding: 16, textAlign: "center", color: "var(--text-muted)",
        background: "var(--bg-elevated)", borderRadius: 10, border: "1px dashed var(--border)",
        fontSize: 11, lineHeight: 1.5,
      }}>
        {lang === "en"
          ? "Geo-stats not yet available — admin needs to run geo_migration.sql"
          : "Geo-Statistik noch nicht aktiv — Admin muss geo_migration.sql ausführen"}
      </div>
    );
  }

  if (!rows) {
    return <div style={{ textAlign: "center", padding: 30 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  }

  if (rows.length === 0) {
    return (
      <div style={{
        padding: 20, textAlign: "center", color: "var(--text-muted)",
        background: "var(--bg-elevated)", borderRadius: 12, border: "1px dashed var(--border)",
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🌍</div>
        <div style={{ fontSize: 12 }}>
          {lang === "en" ? "No location data yet — check back soon" : "Noch keine Standortdaten — bald"}
        </div>
      </div>
    );
  }

  const total = rows.reduce((s, r) => s + r.user_count, 0);
  const max = Math.max(...rows.map((r) => r.user_count), 1);
  const visible = compact && !showAll ? rows.slice(0, 5) : showAll ? rows : rows.slice(0, 10);

  return (
    <div>
      {/* Stats-Zeile oben */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Stat icon="🌍" label={lang === "en" ? "Countries" : "Länder"} value={rows.length} color="var(--accent)" />
        <Stat icon="👥" label={lang === "en" ? "With location" : "Mit Standort"} value={total} color="var(--green)" />
        <Stat icon="🥇" label={lang === "en" ? "Top region" : "Top-Region"} value={`${flagEmoji(rows[0].country)} ${rows[0].country}`} color="var(--amber)" small />
      </div>

      {/* Bar-Liste */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visible.map((r) => {
          const pct = (r.user_count / max) * 100;
          const totalPct = (r.user_count / total) * 100;
          const name = r.country_name || countryName(r.country, lang) || r.country;
          return (
            <div key={r.country} style={{ position: "relative" }}>
              <div style={{
                position: "relative", overflow: "hidden",
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "10px 14px",
              }}>
                {/* Bar-Fill als Background */}
                <div style={{
                  position: "absolute", inset: 0,
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, var(--accent-tint), transparent)",
                  borderRight: pct < 99 ? "1px solid var(--accent-border)" : "none",
                  transition: "width 0.4s",
                  pointerEvents: "none",
                }} />

                {/* Inhalt */}
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>
                    {flagEmoji(r.country)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {r.country} · {totalPct.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{
                    fontSize: 18, fontWeight: 900, color: "var(--accent)",
                    fontVariantNumeric: "tabular-nums", flexShrink: 0,
                  }}>
                    {r.user_count}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toggle: alle anzeigen */}
      {!compact && rows.length > 10 && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="btn btn-ghost btn-block"
          style={{ marginTop: 10, fontSize: 12 }}
        >
          {showAll
            ? (lang === "en" ? "Show top 10" : "Top 10 anzeigen")
            : (lang === "en" ? `Show all ${rows.length} countries →` : `Alle ${rows.length} Länder zeigen →`)}
        </button>
      )}
      {compact && rows.length > 5 && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="btn btn-ghost btn-block"
          style={{ marginTop: 10, fontSize: 12 }}
        >
          {showAll
            ? (lang === "en" ? "Less" : "Weniger")
            : (lang === "en" ? `+${rows.length - 5} more →` : `+${rows.length - 5} weitere →`)}
        </button>
      )}
    </div>
  );
}

function Stat({ icon, label, value, color, small }: {
  icon: string; label: string; value: number | string; color: string; small?: boolean;
}) {
  return (
    <div style={{
      flex: "1 1 100px",
      padding: "10px 14px",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 16 }}>{icon}</div>
      <div style={{
        fontSize: 9, color: "var(--text-muted)", letterSpacing: 1.5,
        fontWeight: 800, textTransform: "uppercase", marginTop: 2,
      }}>{label}</div>
      <div style={{
        fontSize: small ? 14 : 22, fontWeight: 800, color, marginTop: 2,
        whiteSpace: "nowrap",
      }}>{value}</div>
    </div>
  );
}
