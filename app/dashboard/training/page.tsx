"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { EX_BY_ID } from "@/lib/exercises";
import { SPORT_LABELS, SPORT_ICONS, SPORT_COLORS, MUSCLE_COLORS, type Sport, type PlanDay, type PlanExercise } from "@/lib/types";
import WorkoutSession from "@/components/WorkoutSession";
import { EmptyState, SkeletonList, SkeletonCard } from "@/components/UI";

export default function TrainingPage() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [activeSession, setActiveSession] = useState<{ di: number } | null>(null);
  const [tab, setTab] = useState<"week" | "history">("week");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { loadPlan(); }, []);
  useEffect(() => { if (tab === "history") loadHistory(); }, [tab]);

  async function loadPlan() {
    setLoading(true);
    const supabase = createClient();
    const { data: profile } = await supabase.from("profiles").select("active_plan_id").single();
    if (profile?.active_plan_id) {
      const { data } = await supabase.from("user_plans").select("*").eq("id", profile.active_plan_id).single();
      setPlan(data);
    }
    setLoading(false);
  }

  async function loadHistory() {
    const supabase = createClient();
    const { data } = await supabase.from("workouts").select("*")
      .order("started_at", { ascending: false }).limit(50);
    setHistory(data || []);
  }

  if (loading) {
    return <SkeletonList count={4} />;
  }

  if (!plan) {
    return (
      <EmptyState
        icon="📋"
        title="Kein aktiver Plan"
        description="Wähle einen Plan aus den Vorlagen oder erstelle deinen eigenen, um loszulegen."
        action={{ label: "→ Zu den Plänen", onClick: () => { window.location.href = "/dashboard/plans"; } }}
        size="lg"
      />
    );
  }

  const sport = plan.sport as Sport;
  const weeks = plan.plan_data?.weeks || [];
  const firstWeek = weeks[0]; // Templates have only week 1 defined
  const currentWeek = weeks.find((w: any) => w.weekNum === week) || firstWeek;

  if (activeSession && currentWeek) {
    const day = currentWeek.days[activeSession.di];
    return (
      <WorkoutSession planId={plan.id} sport={plan.sport}
        week={week} dayIdx={activeSession.di}
        dayName={day.name} dayLabel={day.dayLabel || ""}
        exercises={day.exercises} />
    );
  }

  return (
    <div>
      {/* Active Plan Header */}
      <div className="card" style={{
        background: `linear-gradient(135deg, ${SPORT_COLORS[sport]}15, transparent)`,
        borderColor: `${SPORT_COLORS[sport]}30`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 36 }}>{SPORT_ICONS[sport]}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800, textTransform: "uppercase" }}>
              Aktiver Plan
            </div>
            <div style={{ fontSize: 22, fontStyle: "italic", fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: -0.5 }}>
              {plan.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              {SPORT_LABELS[sport]} · {plan.level} · {plan.duration_weeks} Wochen
            </div>
          </div>
          <Link href={`/dashboard/plans/${plan.id}`} className="btn">📝 Bearbeiten</Link>
          <Link href="/dashboard/plans" className="btn btn-ghost" style={{ fontSize: 12 }}>wechseln</Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={tabsStyle}>
        {(["week", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={tabBtnStyle(tab === t)}>
            {t === "week" ? "📅 Woche" : "📋 Verlauf"}
          </button>
        ))}
      </div>

      {tab === "week" && currentWeek && (
        <>
          {/* Week selector */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 18 }}>
            <button onClick={() => setWeek(Math.max(1, week - 1))} className="btn" style={{ padding: "10px 14px" }}>‹</button>
            <div style={{ textAlign: "center", minWidth: 160 }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800, textTransform: "uppercase" }}>
                Woche {week} von {plan.duration_weeks}
              </div>
              <div style={{ fontSize: 28, fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 800, letterSpacing: -1 }}>
                {currentWeek.days?.length || 0} Tage
              </div>
            </div>
            <button onClick={() => setWeek(Math.min(plan.duration_weeks, week + 1))} className="btn" style={{ padding: "10px 14px" }}>›</button>
          </div>

          {/* Days */}
          {(currentWeek.days || []).length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Keine Tage für Woche {week}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                Erstelle deinen ersten Trainingstag im Plan-Editor.
              </div>
              <Link href={`/dashboard/plans/${plan.id}`} className="btn btn-primary">→ Plan bearbeiten</Link>
            </div>
          ) : (
            (currentWeek.days || []).map((day: PlanDay, di: number) => {
              const isOpen = expandedDay === di;
              return (
                <div key={day.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div onClick={() => setExpandedDay(isOpen ? null : di)} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 20px", cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {day.dayLabel && (
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: "5px 11px", borderRadius: 8,
                          letterSpacing: 1.2, textTransform: "uppercase",
                          color: "var(--accent)", background: "var(--accent-tint)",
                        }}>{day.dayLabel}</span>
                      )}
                      <span style={{ marginLeft: day.dayLabel ? 12 : 0, fontSize: 15, fontWeight: 700 }}>{day.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {day.exercises.length} {day.exercises.length === 1 ? "Übung" : "Übungen"}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: 14, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>⌃</span>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ padding: "0 20px 18px" }}>
                      {day.exercises.length > 0 && (
                        <button className="btn btn-primary btn-block" style={{ padding: 18, marginBottom: 16 }}
                          onClick={() => setActiveSession({ di })}>
                          ▶ Workout starten
                        </button>
                      )}
                      {day.exercises.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 13 }}>
                          Keine Übungen. <Link href={`/dashboard/plans/${plan.id}`} style={{ color: "var(--accent)" }}>Zum Editor</Link>
                        </div>
                      ) : (
                        day.exercises.map((pe: PlanExercise, ei: number) => {
                          const ex = EX_BY_ID[pe.exerciseId];
                          if (!ex) return (
                            <div key={ei} style={{ padding: "10px 0", fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                              ⚠ Übung nicht gefunden
                            </div>
                          );
                          return (
                            <div key={ei} style={{
                              display: "flex", alignItems: "center", gap: 12, padding: "14px 0",
                              borderBottom: ei < day.exercises.length - 1 ? "1px solid var(--border)" : "none",
                            }}>
                              <div style={{ width: 3, height: 32, borderRadius: 2, background: MUSCLE_COLORS[ex.muscle] }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>{ex.name}</div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, fontWeight: 700 }}>
                                  {ex.muscle} · {ex.equipment}
                                </div>
                              </div>
                              <div style={{
                                fontSize: 11, color: "var(--text-dim)", fontWeight: 700,
                                fontFamily: "var(--font-mono)", background: "var(--surface)",
                                padding: "5px 9px", borderRadius: 7, border: "1px solid var(--border)",
                              }}>
                                {formatTarget(pe, ex.tracking)}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}

      {tab === "history" && (
        history.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Noch kein Verlauf"
            description="Starte dein erstes Workout, dann erscheint es hier."
          />
        ) : (
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>📋 Workout-Verlauf · {history.length}</div>
            {history.map((h) => {
              const d = new Date(h.started_at);
              const mm = h.duration_sec ? Math.floor(h.duration_sec / 60) : null;
              const moodEmojis = ['','😣','😓','💪','😊','🔥'];
              const sportIcon = h.sport ? SPORT_ICONS[h.sport as Sport] : "💪";
              return (
                <div key={h.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 0", borderBottom: "1px solid var(--border)",
                }}>
                  <div style={{ width: 52, textAlign: "center", borderRight: "1px solid var(--border)", paddingRight: 12 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, fontWeight: 800, lineHeight: 1 }}>
                      {d.getDate()}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1, marginTop: 2 }}>
                      {["JAN","FEB","MRZ","APR","MAI","JUN","JUL","AUG","SEP","OKT","NOV","DEZ"][d.getMonth()]}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {sportIcon} {h.day_name} · W{h.week} {h.mood ? moodEmojis[h.mood] : ""}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      {h.completed_sets}/{h.total_sets} Sätze
                      {h.total_reps ? ` · ${h.total_reps} Wdh.` : ""}
                      {h.total_volume > 0 ? ` · ${Math.round(h.total_volume)}kg Vol.` : ""}
                      {mm !== null ? ` · ${mm} min` : ""}
                    </div>
                  </div>
                  <div style={{ fontSize: 22 }}>{h.completed_sets === h.total_sets ? "✅" : "⚡"}</div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

function formatTarget(pe: PlanExercise, tracking: string): string {
  switch (tracking) {
    case "reps_weight": return `${pe.sets}×${pe.targetReps} @ ${pe.targetWeight || 0}kg`;
    case "reps_only": return `${pe.sets}×${pe.targetReps}`;
    case "time": return `${pe.sets}× ${pe.targetTime}s`;
    case "distance": return `${((pe.targetDistance || 0) / 1000).toFixed(1)}km`;
    case "time_distance": return `${pe.targetTime}s / ${pe.targetDistance}m`;
    default: return "";
  }
}

const tabsStyle: React.CSSProperties = {
  display: "flex", gap: 4, padding: 4, background: "var(--bg-raised)",
  border: "1px solid var(--border)", borderRadius: 14, marginBottom: 20,
};

function tabBtnStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1, padding: 10, borderRadius: 10, border: "none",
    background: active ? "var(--bg-elevated)" : "transparent",
    color: active ? "var(--text)" : "var(--text-muted)",
    cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700,
  };
}
