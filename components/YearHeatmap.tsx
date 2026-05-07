"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useIsPro } from "@/lib/use-pro";
import { FREE_LIMITS } from "@/lib/premium";
import { useLanguage } from "@/components/LanguageProvider";
import PaywallModal from "@/components/PaywallModal";

type DayCell = {
  date: string;          // YYYY-MM-DD
  volume: number;
  workouts: number;
  reps: number;
};

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const WEEKDAYS = ["Mo", "", "Mi", "", "Fr", "", ""]; // sparse → nur jeden 2. Tag labeln

export default function YearHeatmap() {
  const isPro = useIsPro();
  const { lang } = useLanguage();
  const [days, setDays] = useState<Record<string, DayCell>>({});
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState<DayCell | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [isPro]);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    // Free-User: 30 Tage Cap. Pro: volle 365 Tage
    const dayWindow = isPro === false ? FREE_LIMITS.workoutHistoryDays : 365;
    const since = new Date(Date.now() - dayWindow * 86400000).toISOString();
    const { data } = await supabase
      .from("workouts")
      .select("started_at, total_volume, total_reps")
      .gte("started_at", since);

    const map: Record<string, DayCell> = {};
    for (const w of (data || []) as any[]) {
      const d = new Date(w.started_at).toISOString().slice(0, 10);
      if (!map[d]) map[d] = { date: d, volume: 0, workouts: 0, reps: 0 };
      map[d].volume += Number(w.total_volume) || 0;
      map[d].reps += Number(w.total_reps) || 0;
      map[d].workouts += 1;
    }
    setDays(map);
    setLoading(false);
  }

  // Erstelle 53 Spalten × 7 Zeilen, ausgerichtet so dass die letzte Spalte den heutigen Wochenpunkt enthält
  const grid = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Suche den Sonntag dieser Woche, von dort 53*7-1 Tage zurück
    const cells: (DayCell | null)[][] = []; // [woche][weekday 0=Mo … 6=So]
    const totalCols = 53;
    // Heutiger Wochentag, Mo=0 … So=6
    const todayDow = (today.getDay() + 6) % 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - ((totalCols - 1) * 7 + todayDow));

    let max = 0;
    for (let col = 0; col < totalCols; col++) {
      const week: (DayCell | null)[] = [];
      for (let row = 0; row < 7; row++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + col * 7 + row);
        if (d > today) { week.push(null); continue; }
        const key = d.toISOString().slice(0, 10);
        const cell = days[key] ?? { date: key, volume: 0, workouts: 0, reps: 0 };
        if (cell.workouts > 0 && cell.volume > max) max = cell.volume;
        week.push(cell);
      }
      cells.push(week);
    }
    return { cells, max };
  }, [days]);

  function intensity(cell: DayCell | null): number {
    if (!cell || cell.workouts === 0) return 0;
    if (grid.max === 0) return 0.4; // hat workout, aber kein volumen → mind. sichtbar
    return 0.25 + 0.75 * Math.min(1, cell.volume / grid.max);
  }
  function fill(cell: DayCell | null) {
    if (!cell) return "transparent";
    const i = intensity(cell);
    if (i === 0) return "var(--surface)";
    return `color-mix(in srgb, var(--accent) ${i * 100}%, transparent)`;
  }

  // Monatslabels: zeige den Monatsnamen über der ersten Spalte, in der der 1. eines Monats liegt
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  grid.cells.forEach((week, col) => {
    for (const cell of week) {
      if (!cell) continue;
      const m = new Date(cell.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ col, label: MONTHS[m] });
        lastMonth = m;
      }
      break;
    }
  });

  if (loading) return <div style={{ textAlign: "center", padding: 30 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;

  const totalWorkouts = Object.values(days).reduce((s, d) => s + d.workouts, 0);
  const totalVolume = Object.values(days).reduce((s, d) => s + d.volume, 0);
  const activeDays = Object.values(days).filter((d) => d.workouts > 0).length;

  const CELL = 13;
  const GAP = 3;
  const W = 53 * (CELL + GAP) + 30;
  const H = 7 * (CELL + GAP) + 24;

  return (
    <div>
      {isPro === false && (
        <div
          onClick={() => setShowPaywall(true)}
          style={{
            padding: "8px 12px", marginBottom: 12,
            background: "var(--accent-tint)", border: "1px solid var(--accent-border)",
            borderRadius: 8, fontSize: 11, color: "var(--accent)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <span>💎</span>
          <span style={{ flex: 1, fontWeight: 700 }}>
            {lang === "en"
              ? `Showing last ${FREE_LIMITS.workoutHistoryDays} days · upgrade to Pro for full year →`
              : `Letzte ${FREE_LIMITS.workoutHistoryDays} Tage · Pro für volles Jahr →`}
          </span>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 14 }}>
        <Stat icon="📅" label="Aktive Tage" value={activeDays} />
        <Stat icon="💪" label="Workouts" value={totalWorkouts} />
        <Stat icon="🏋️" label="Volumen total" value={`${Math.round(totalVolume / 1000)}t`} />
      </div>
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} feature={lang === "en" ? "Full year history" : "Volle Jahres-Historie"} />

      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 700, width: "100%", height: "auto" }}>
          {/* Wochentag-Labels */}
          {WEEKDAYS.map((wd, i) => (
            <text key={i} x={26} y={24 + i * (CELL + GAP) + CELL - 3}
              fontSize="9" fill="var(--text-muted)" fontWeight="700" textAnchor="end">
              {wd}
            </text>
          ))}
          {/* Monatslabels */}
          {monthLabels.map((m, i) => (
            <text key={i} x={30 + m.col * (CELL + GAP)} y={14}
              fontSize="9" fill="var(--text-muted)" fontWeight="700">
              {m.label}
            </text>
          ))}
          {/* Zellen */}
          {grid.cells.map((week, col) =>
            week.map((cell, row) => {
              if (!cell) return null;
              return (
                <rect
                  key={`${col}-${row}`}
                  x={30 + col * (CELL + GAP)}
                  y={24 + row * (CELL + GAP)}
                  width={CELL}
                  height={CELL}
                  rx={3}
                  fill={fill(cell)}
                  stroke={cell.workouts > 0 ? "var(--accent-border)" : "var(--border)"}
                  strokeWidth={0.5}
                  onMouseEnter={() => setHover(cell)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: cell.workouts > 0 ? "pointer" : "default" }}
                />
              );
            })
          )}
        </svg>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 11, color: "var(--text-dim)", minHeight: 18 }}>
          {hover ? (
            <span>
              <strong style={{ color: "var(--text)" }}>
                {new Date(hover.date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" })}
              </strong>
              {" — "}
              {hover.workouts > 0
                ? `${hover.workouts} Workout${hover.workouts > 1 ? "s" : ""} · ${Math.round(hover.volume)} kg Volumen · ${hover.reps} Wdh.`
                : "Kein Training"}
            </span>
          ) : (
            <span>Hover über einen Tag für Details · Letzte 365 Tage</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "var(--text-muted)", marginRight: 4 }}>weniger</span>
          {[0, 0.25, 0.5, 0.75, 1].map((i) => (
            <div key={i} style={{
              width: 11, height: 11, borderRadius: 2,
              background: i === 0 ? "var(--surface)" : `color-mix(in srgb, var(--accent) ${i * 100}%, transparent)`,
              border: "1px solid var(--border)",
            }} />
          ))}
          <span style={{ fontSize: 9, color: "var(--text-muted)", marginLeft: 4 }}>mehr</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div style={{
      flex: "1 1 110px", padding: "10px 14px",
      background: "var(--bg-elevated)", borderRadius: 10, border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 1.5, fontWeight: 800, textTransform: "uppercase", marginTop: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{value}</div>
    </div>
  );
}
