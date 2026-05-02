"use client";

import { calculatePlatesPerSide, type PlateSettings } from "@/lib/units";

// Farben passend zu Standard-Olympia-Plates
const PLATE_COLORS: Record<string, string> = {
  "25":   "#FF5A6B",
  "20":   "#3B82F6",
  "15":   "#FFB800",
  "10":   "#52D983",
  "5":    "#E5E7EB",
  "2.5":  "#8B7FF0",
  "1.25": "#94A3B8",
  // Imperial
  "45":   "#3B82F6",
  "35":   "#FFB800",
};

function plateColor(weight: number): string {
  return PLATE_COLORS[String(weight)] || "var(--accent)";
}

function plateHeight(weight: number, max: number): number {
  // Normiert auf 24..72px Höhe je nach Größe relativ zur größten Scheibe
  return Math.max(24, Math.min(72, 24 + (weight / max) * 48));
}

export default function PlateVisualizer({
  totalWeight, prefs, unit = "kg", compact = false,
}: {
  totalWeight: number;
  prefs: PlateSettings;
  unit?: "kg" | "lb";
  compact?: boolean;
}) {
  if (!totalWeight || totalWeight < prefs.bar) return null;
  const { plates, remaining } = calculatePlatesPerSide(totalWeight, prefs);
  if (plates.length === 0 && remaining === 0) {
    return (
      <div style={{ fontSize: 11, color: "var(--text-muted)", padding: "4px 0" }}>
        Nur die Stange ({prefs.bar} {unit})
      </div>
    );
  }

  const maxPlate = Math.max(...prefs.plates);
  const barW = compact ? 80 : 130;
  const barH = compact ? 6 : 8;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: compact ? "6px 0" : "10px 0", gap: 0,
    }}>
      {/* Linke Scheiben (umgekehrt rendern, große außen) */}
      <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
        {[...plates].reverse().map((p, i) => {
          const h = plateHeight(p, maxPlate);
          return (
            <div key={`l-${i}`} title={`${p} ${unit}`} style={{
              width: 7, height: h, background: plateColor(p),
              borderRadius: 2, border: "1px solid rgba(0,0,0,0.25)",
              boxShadow: "inset 0 0 4px rgba(255,255,255,0.15)",
            }} />
          );
        })}
      </div>
      {/* Bar links */}
      <div style={{
        width: 8, height: barH * 1.4, background: "var(--text-muted)",
        borderRadius: 1,
      }} />
      {/* Bar Mittelteil */}
      <div style={{
        width: barW, height: barH, background: "var(--text-dim)",
        borderRadius: 1,
      }} />
      {/* Bar rechts */}
      <div style={{
        width: 8, height: barH * 1.4, background: "var(--text-muted)",
        borderRadius: 1,
      }} />
      {/* Rechte Scheiben */}
      <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
        {plates.map((p, i) => {
          const h = plateHeight(p, maxPlate);
          return (
            <div key={`r-${i}`} title={`${p} ${unit}`} style={{
              width: 7, height: h, background: plateColor(p),
              borderRadius: 2, border: "1px solid rgba(0,0,0,0.25)",
              boxShadow: "inset 0 0 4px rgba(255,255,255,0.15)",
            }} />
          );
        })}
      </div>
    </div>
  );
}

// Kompaktes Text-Listing wie "2× 20 + 1× 5 + 1× 2.5 (pro Seite)"
export function PlateBreakdown({
  totalWeight, prefs, unit = "kg",
}: {
  totalWeight: number; prefs: PlateSettings; unit?: "kg" | "lb";
}) {
  if (!totalWeight || totalWeight < prefs.bar) return null;
  const { plates, remaining } = calculatePlatesPerSide(totalWeight, prefs);
  if (plates.length === 0) {
    return <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Nur Stange</span>;
  }
  // Counts aggregieren
  const counts: Record<string, number> = {};
  for (const p of plates) counts[p] = (counts[p] || 0) + 1;
  const parts = Object.entries(counts)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([w, c]) => `${c}× ${w}`);
  return (
    <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
      {parts.join(" + ")} {unit} · pro Seite
      {remaining > 0 && (
        <span style={{ color: "var(--amber)", marginLeft: 4 }}>
          (+{remaining.toFixed(1)} fehlen)
        </span>
      )}
    </span>
  );
}
