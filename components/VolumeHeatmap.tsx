"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { EX_BY_ID } from "@/lib/exercises";
import { MUSCLE_LABELS, type MuscleGroup } from "@/lib/types";

const MUSCLES_TO_TRACK: MuscleGroup[] = [
  "chest", "back", "shoulders", "arms", "core", "legs", "glutes",
];

export default function VolumeHeatmap() {
  const [days, setDays] = useState<7 | 30>(7);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data } = await supabase
      .from("workouts")
      .select("exercises_data")
      .gte("started_at", since);

    const c: Record<string, number> = {};
    for (const w of (data || []) as any[]) {
      const arr = Array.isArray(w.exercises_data) ? w.exercises_data : [];
      for (const e of arr) {
        const ex = EX_BY_ID[e?.id];
        if (!ex) continue;
        const doneSets = Array.isArray(e?.sets) ? e.sets.filter((s: any) => s?.done).length : 0;
        if (doneSets === 0) continue;
        c[ex.muscle] = (c[ex.muscle] || 0) + doneSets;
      }
    }
    setCounts(c);
    setLoading(false);
  }

  const max = Math.max(1, ...Object.values(counts));
  function intensity(m: MuscleGroup) {
    const v = counts[m] || 0;
    return Math.min(1, v / max);
  }
  function fill(m: MuscleGroup) {
    const i = intensity(m);
    if (i === 0) return "rgba(255,255,255,0.06)";
    // Akzent-Farbe via CSS-Variable mit dynamischer Opacity
    return `color-mix(in srgb, var(--accent) ${20 + i * 80}%, transparent)`;
  }
  function stroke(m: MuscleGroup) {
    const i = intensity(m);
    return i > 0 ? "var(--accent-border)" : "var(--border)";
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {([7, 30] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className="btn"
            style={{
              padding: "6px 14px",
              fontSize: 12,
              border: days === d ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: days === d ? "var(--accent-tint)" : "var(--bg-elevated)",
              color: days === d ? "var(--accent)" : "var(--text)",
            }}
          >
            {d} Tage
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 30 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(200px, 1fr) 1fr", gap: 20, alignItems: "start" }}>
          {/* Body SVG */}
          <svg viewBox="0 0 200 360" style={{ width: "100%", maxWidth: 240, height: "auto" }}>
            {/* Kopf */}
            <circle cx="100" cy="30" r="20" fill="rgba(255,255,255,0.04)" stroke="var(--border)" strokeWidth="1" />
            {/* Hals */}
            <rect x="92" y="48" width="16" height="10" fill="rgba(255,255,255,0.04)" stroke="var(--border)" strokeWidth="1" />
            {/* Schultern */}
            <ellipse cx="65" cy="72" rx="22" ry="14" fill={fill("shoulders")} stroke={stroke("shoulders")} strokeWidth="1" />
            <ellipse cx="135" cy="72" rx="22" ry="14" fill={fill("shoulders")} stroke={stroke("shoulders")} strokeWidth="1" />
            {/* Brust */}
            <rect x="68" y="80" width="64" height="40" rx="8" fill={fill("chest")} stroke={stroke("chest")} strokeWidth="1" />
            {/* Arme */}
            <rect x="38" y="80" width="22" height="80" rx="11" fill={fill("arms")} stroke={stroke("arms")} strokeWidth="1" />
            <rect x="140" y="80" width="22" height="80" rx="11" fill={fill("arms")} stroke={stroke("arms")} strokeWidth="1" />
            {/* Core */}
            <rect x="74" y="122" width="52" height="48" rx="6" fill={fill("core")} stroke={stroke("core")} strokeWidth="1" />
            {/* Glutes */}
            <ellipse cx="100" cy="184" rx="32" ry="14" fill={fill("glutes")} stroke={stroke("glutes")} strokeWidth="1" />
            {/* Beine */}
            <rect x="70" y="194" width="26" height="120" rx="13" fill={fill("legs")} stroke={stroke("legs")} strokeWidth="1" />
            <rect x="104" y="194" width="26" height="120" rx="13" fill={fill("legs")} stroke={stroke("legs")} strokeWidth="1" />
            {/* Rücken-Indikator (rechts oben als 2. Ansicht) */}
            <text x="100" y="345" textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontWeight="700">FRONT</text>
          </svg>

          {/* Liste */}
          <div>
            {MUSCLES_TO_TRACK.map((m) => {
              const v = counts[m] || 0;
              const i = intensity(m);
              return (
                <div key={m} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4,
                    background: i > 0 ? `color-mix(in srgb, var(--accent) ${20 + i * 80}%, transparent)` : "rgba(255,255,255,0.06)",
                    border: `1px solid ${i > 0 ? "var(--accent-border)" : "var(--border)"}`,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>{MUSCLE_LABELS[m]}</div>
                  <div style={{ fontSize: 12, color: v === 0 ? "var(--text-muted)" : "var(--accent)", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    {v}× Sätze
                  </div>
                </div>
              );
            })}
            {Object.keys(counts).length === 0 && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 16 }}>
                Keine Workouts in den letzten {days} Tagen
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.5 }}>
        Hellere Bereiche = mehr trainiertes Volumen. Hilft, Imbalances zu erkennen — z. B. wenn Beine seit Wochen "kalt" bleiben.
      </div>
    </div>
  );
}
