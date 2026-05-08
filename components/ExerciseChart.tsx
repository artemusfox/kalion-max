"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { EX_BY_ID } from "@/lib/exercises";
import { useIsPro } from "@/lib/use-pro";
import { FREE_LIMITS } from "@/lib/premium";
import { useLanguage } from "@/components/LanguageProvider";
import PaywallModal from "@/components/PaywallModal";

type Point = {
  date: string;
  maxWeight: number;
  volume: number;
  totalReps: number;
};

export default function ExerciseChart() {
  const isPro = useIsPro();
  const { lang } = useLanguage();
  const [exerciseStats, setExerciseStats] = useState<Record<string, { name: string; points: Point[] }>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<"weight" | "volume">("weight");
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [isPro]);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("workouts")
      .select("started_at, exercises_data")
      .order("started_at", { ascending: true });
    if (isPro === false) {
      const since = new Date(Date.now() - FREE_LIMITS.workoutHistoryDays * 86400000).toISOString();
      query = query.gte("started_at", since);
    }
    const { data } = await query;

    const stats: Record<string, { name: string; points: Point[] }> = {};
    for (const w of (data || []) as any[]) {
      const arr = Array.isArray(w.exercises_data) ? w.exercises_data : [];
      for (const e of arr) {
        const id = e?.id;
        if (!id) continue;
        const ex = EX_BY_ID[id];
        const name = e?.n || ex?.name || id;
        const sets = Array.isArray(e?.sets) ? e.sets.filter((s: any) => s?.done) : [];
        if (sets.length === 0) continue;

        let maxW = 0, vol = 0, reps = 0;
        for (const s of sets) {
          const w = s?.weight ?? 0;
          const r = s?.reps ?? 0;
          if (w > maxW) maxW = w;
          vol += w * r;
          reps += r;
        }

        if (!stats[id]) stats[id] = { name, points: [] };
        stats[id].points.push({
          date: w.started_at,
          maxWeight: maxW,
          volume: vol,
          totalReps: reps,
        });
      }
    }

    setExerciseStats(stats);
    // Standard-Auswahl: Übung mit den meisten Datenpunkten
    const sorted = Object.entries(stats).sort((a, b) => b[1].points.length - a[1].points.length);
    if (sorted.length > 0 && !selected) setSelected(sorted[0][0]);
    setLoading(false);
  }

  const sortedExercises = useMemo(() =>
    Object.entries(exerciseStats)
      .filter(([, s]) => s.points.length >= 2)
      .sort((a, b) => b[1].points.length - a[1].points.length),
    [exerciseStats]
  );

  if (loading) return <div style={{ textAlign: "center", padding: 30 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;

  if (sortedExercises.length === 0) {
    return (
      <div style={{
        padding: 24, textAlign: "center", background: "var(--bg-elevated)",
        borderRadius: 12, border: "1px dashed var(--border)", color: "var(--text-muted)",
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
        <div style={{ fontSize: 13 }}>Noch nicht genug Daten — komplett 2+ Workouts mit der gleichen Übung.</div>
      </div>
    );
  }

  const stats = selected ? exerciseStats[selected] : null;

  return (
    <div>
      {isPro === false && (
        <div
          onClick={() => setShowPaywall(true)}
          style={{
            padding: "8px 12px", marginBottom: 12,
            background: "var(--accent-tint)", border: "1px solid var(--accent-border)",
            borderRadius: 8, fontSize: 11, color: "var(--accent)",
            cursor: "pointer", fontWeight: 700,
          }}
        >
          💎 {lang === "en"
            ? `Showing last ${FREE_LIMITS.workoutHistoryDays} days · upgrade to Pro for full history →`
            : `Letzte ${FREE_LIMITS.workoutHistoryDays} Tage · Pro für volle Historie →`}
        </div>
      )}
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} feature={lang === "en" ? "Full chart history" : "Volle Chart-Historie"} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <select
          value={selected ?? ""}
          onChange={(e) => setSelected(e.target.value)}
          className="form-input"
          style={{ flex: 1, minWidth: 180, padding: "8px 10px", fontSize: 13 }}
        >
          {sortedExercises.map(([id, s]) => (
            <option key={id} value={id}>{s.name} ({s.points.length} Workouts)</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 6 }}>
          {(["weight", "volume"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className="btn"
              style={{
                padding: "8px 14px", fontSize: 12,
                border: metric === m ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: metric === m ? "var(--accent-tint)" : "var(--bg-elevated)",
                color: metric === m ? "var(--accent)" : "var(--text)",
              }}
            >
              {m === "weight" ? "Max-Gewicht" : "Volumen"}
            </button>
          ))}
        </div>
      </div>

      {stats && <Chart points={stats.points} metric={metric} />}
    </div>
  );
}

function Chart({ points, metric }: { points: Point[]; metric: "weight" | "volume" }) {
  const W = 600, H = 220, PAD_L = 40, PAD_R = 16, PAD_T = 16, PAD_B = 30;

  const values = points.map((p) => metric === "weight" ? p.maxWeight : p.volume);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const xAt = (i: number) => points.length === 1 ? PAD_L + innerW / 2 : PAD_L + (i / (points.length - 1)) * innerW;
  const yAt = (v: number) => PAD_T + innerH - ((v - min) / range) * innerH;

  const linePath = points.map((p, i) => {
    const v = metric === "weight" ? p.maxWeight : p.volume;
    return `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(v)}`;
  }).join(" ");

  const areaPath = `${linePath} L ${xAt(points.length - 1)} ${PAD_T + innerH} L ${xAt(0)} ${PAD_T + innerH} Z`;

  const first = points[0];
  const last = points[points.length - 1];
  const firstVal = metric === "weight" ? first.maxWeight : first.volume;
  const lastVal = metric === "weight" ? last.maxWeight : last.volume;
  const change = lastVal - firstVal;
  const pct = firstVal > 0 ? (change / firstVal) * 100 : 0;

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  }

  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 12, gap: 16, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1.5, fontWeight: 800, textTransform: "uppercase" }}>
            Aktuell
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--accent)" }}>
            {Math.round(lastVal)}
            <span style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 700, marginLeft: 4 }}>
              {metric === "weight" ? "kg" : "kg·Wdh"}
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1.5, fontWeight: 800, textTransform: "uppercase" }}>
            Δ Verlauf
          </div>
          <div style={{
            fontSize: 18, fontWeight: 800,
            color: change > 0 ? "var(--green)" : change < 0 ? "var(--red)" : "var(--text-dim)",
          }}>
            {change > 0 ? "↑ +" : change < 0 ? "↓ " : ""}{Math.round(change)}
            <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 4 }}>
              ({pct > 0 ? "+" : ""}{pct.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i}
            x1={PAD_L} x2={W - PAD_R}
            y1={PAD_T + innerH * t} y2={PAD_T + innerH * t}
            stroke="var(--border)" strokeWidth="1" strokeDasharray={t === 0 || t === 1 ? "0" : "3 4"}
          />
        ))}
        {/* Area fill — fadet ein nachdem Line gezeichnet ist */}
        <path
          d={areaPath}
          fill="var(--accent-tint)"
          style={{
            opacity: 0,
            animation: "kalion-page-in 600ms ease-out 800ms forwards",
          }}
        />
        {/* Line — zeichnet sich von links nach rechts */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1000}
          strokeDasharray={1000}
          style={{
            ["--draw-length" as any]: "1000",
            animation: "kalion-draw-line 1000ms ease-out forwards",
          }}
        />
        {/* Points */}
        {points.map((p, i) => {
          const v = metric === "weight" ? p.maxWeight : p.volume;
          return (
            <g key={i}>
              <circle cx={xAt(i)} cy={yAt(v)} r="4" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
              {(i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)) && (
                <text x={xAt(i)} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--text-muted)" fontWeight="700">
                  {fmtDate(p.date)}
                </text>
              )}
            </g>
          );
        })}
        {/* Y-Achse Labels */}
        <text x={PAD_L - 6} y={PAD_T + 4} fontSize="10" textAnchor="end" fill="var(--text-muted)" fontWeight="700">
          {Math.round(max)}
        </text>
        <text x={PAD_L - 6} y={PAD_T + innerH + 4} fontSize="10" textAnchor="end" fill="var(--text-muted)" fontWeight="700">
          {Math.round(min)}
        </text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>
        {points.length} Workouts · {fmtDate(first.date)} – {fmtDate(last.date)}
      </div>
    </div>
  );
}
