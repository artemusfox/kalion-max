"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { EXERCISES } from "@/lib/exercises";
import { SPORT_LABELS, SPORT_ICONS, SPORT_COLORS, MUSCLE_LABELS, type Sport, type PlanDay, type PlanExercise, type Exercise } from "@/lib/types";
import { useToast } from "@/components/Toast";

export default function PlanEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeWeek, setActiveWeek] = useState(0);
  const [showAddEx, setShowAddEx] = useState<{ dayIdx: number } | null>(null);
  const [editingEx, setEditingEx] = useState<{ dayIdx: number; exIdx: number } | null>(null);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("user_plans").select("*").eq("id", id).single();
    if (error || !data) { router.push("/dashboard/plans"); return; }
    setPlan(data);
    setLoading(false);
  }

  async function save(patch: any = {}) {
    setSaving(true);
    const supabase = createClient();
    const updated = { ...plan, ...patch, updated_at: new Date().toISOString() };
    setPlan(updated);
    const { error } = await supabase.from("user_plans").update({
      name: updated.name,
      description: updated.description,
      sport: updated.sport,
      level: updated.level,
      duration_weeks: updated.duration_weeks,
      plan_data: updated.plan_data,
    }).eq("id", id);
    if (error) toast("Fehler beim Speichern: " + error.message, { type: "error" });
    setSaving(false);
  }

  function addDay() {
    const weeks = [...(plan.plan_data.weeks || [])];
    if (!weeks[activeWeek]) weeks[activeWeek] = { weekNum: activeWeek + 1, days: [] };
    const existingDays = weeks[activeWeek].days || [];
    weeks[activeWeek].days = [...existingDays, {
      id: `d${Date.now()}`, name: `Tag ${existingDays.length + 1}`, exercises: []
    }];
    save({ plan_data: { ...plan.plan_data, weeks } });
  }

  function deleteDay(dayIdx: number) {
    if (!confirm("Tag wirklich löschen?")) return;
    const weeks = [...plan.plan_data.weeks];
    weeks[activeWeek].days = weeks[activeWeek].days.filter((_: any, i: number) => i !== dayIdx);
    save({ plan_data: { ...plan.plan_data, weeks } });
  }

  function updateDay(dayIdx: number, patch: Partial<PlanDay>) {
    const weeks = [...plan.plan_data.weeks];
    weeks[activeWeek].days[dayIdx] = { ...weeks[activeWeek].days[dayIdx], ...patch };
    save({ plan_data: { ...plan.plan_data, weeks } });
  }

  function addExercise(dayIdx: number, ex: Exercise) {
    const weeks = [...plan.plan_data.weeks];
    const newPE: PlanExercise = {
      exerciseId: ex.id,
      sets: 3,
      targetReps: ex.tracking === "reps_weight" ? 8 : ex.tracking === "reps_only" ? 10 : undefined,
      targetWeight: ex.tracking === "reps_weight" ? 20 : undefined,
      targetTime: ex.tracking === "time" || ex.tracking === "time_distance" ? 30 : undefined,
      targetDistance: ex.tracking === "distance" || ex.tracking === "time_distance" ? 1000 : undefined,
      rest: ex.defaultRest,
    };
    weeks[activeWeek].days[dayIdx].exercises = [
      ...(weeks[activeWeek].days[dayIdx].exercises || []),
      newPE,
    ];
    save({ plan_data: { ...plan.plan_data, weeks } });
    setShowAddEx(null);
  }

  function updateExercise(dayIdx: number, exIdx: number, patch: Partial<PlanExercise>) {
    const weeks = [...plan.plan_data.weeks];
    weeks[activeWeek].days[dayIdx].exercises[exIdx] = {
      ...weeks[activeWeek].days[dayIdx].exercises[exIdx], ...patch
    };
    save({ plan_data: { ...plan.plan_data, weeks } });
  }

  function removeExercise(dayIdx: number, exIdx: number) {
    const weeks = [...plan.plan_data.weeks];
    weeks[activeWeek].days[dayIdx].exercises = weeks[activeWeek].days[dayIdx].exercises.filter((_: any, i: number) => i !== exIdx);
    save({ plan_data: { ...plan.plan_data, weeks } });
  }

  function moveExercise(dayIdx: number, exIdx: number, dir: number) {
    const weeks = [...plan.plan_data.weeks];
    const exs = [...weeks[activeWeek].days[dayIdx].exercises];
    const newIdx = exIdx + dir;
    if (newIdx < 0 || newIdx >= exs.length) return;
    [exs[exIdx], exs[newIdx]] = [exs[newIdx], exs[exIdx]];
    weeks[activeWeek].days[dayIdx].exercises = exs;
    save({ plan_data: { ...plan.plan_data, weeks } });
  }

  if (loading) return <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  if (!plan) return null;

  const sport = plan.sport as Sport;
  const weeks = plan.plan_data.weeks || [];
  const currentWeek = weeks[activeWeek] || { weekNum: activeWeek + 1, days: [] };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => router.push("/dashboard/plans")} className="btn btn-ghost">← Zurück</button>
        <div style={{ fontSize: 11, color: saving ? "var(--accent)" : "var(--text-muted)", fontWeight: 700 }}>
          {saving ? "💾 Speichert..." : "✓ Auto-Save"}
        </div>
      </div>

      {/* Plan meta */}
      <div className="card" style={{
        background: `linear-gradient(135deg, ${SPORT_COLORS[sport]}15, transparent)`,
        borderColor: `${SPORT_COLORS[sport]}40`,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 40 }}>{SPORT_ICONS[sport]}</div>
          <div style={{ flex: 1 }}>
            <input className="form-input" value={plan.name}
              onChange={(e) => setPlan({ ...plan, name: e.target.value })}
              onBlur={() => save()}
              style={{
                fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)",
                background: "transparent", border: "1px solid transparent",
                padding: "4px 8px", marginBottom: 6,
              }} />
            <textarea className="form-textarea" value={plan.description || ""}
              onChange={(e) => setPlan({ ...plan, description: e.target.value })}
              onBlur={() => save()}
              placeholder="Beschreibung..." rows={2}
              style={{ fontSize: 13, padding: "6px 10px" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label className="form-label" style={{ fontSize: 10 }}>Sport</label>
            <select className="form-select" value={plan.sport}
              onChange={(e) => setPlan({ ...plan, sport: e.target.value })}
              onBlur={() => save()} style={{ padding: "8px 10px", fontSize: 12 }}>
              {(Object.keys(SPORT_LABELS) as Sport[]).map((s) => (
                <option key={s} value={s}>{SPORT_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: 10 }}>Level</label>
            <select className="form-select" value={plan.level}
              onChange={(e) => setPlan({ ...plan, level: e.target.value })}
              onBlur={() => save()} style={{ padding: "8px 10px", fontSize: 12 }}>
              <option value="beginner">Anfänger</option>
              <option value="intermediate">Fortgeschritten</option>
              <option value="advanced">Profi</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: 10 }}>Dauer</label>
            <input className="form-input" type="number" min="1" max="52"
              value={plan.duration_weeks}
              onChange={(e) => setPlan({ ...plan, duration_weeks: parseInt(e.target.value) || 8 })}
              onBlur={() => save()} style={{ padding: "8px 10px", fontSize: 12 }} />
          </div>
        </div>
      </div>

      {/* Week selector */}
      <div className="card">
        <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800, textTransform: "uppercase", marginBottom: 12 }}>
          Woche
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {Array.from({ length: plan.duration_weeks }, (_, i) => (
            <button key={i} onClick={() => setActiveWeek(i)} style={{
              padding: "8px 14px", borderRadius: 10,
              border: `1px solid ${activeWeek === i ? "var(--accent)" : "var(--border)"}`,
              background: activeWeek === i ? "var(--accent-tint)" : "var(--bg-elevated)",
              color: activeWeek === i ? "var(--accent)" : "var(--text-dim)",
              cursor: "pointer", fontSize: 12, fontWeight: 800, fontFamily: "inherit",
            }}>
              W{i + 1}{weeks[i]?.days?.length ? ` · ${weeks[i].days.length}T` : ""}
            </button>
          ))}
        </div>

        {/* Days */}
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 12, fontWeight: 600 }}>
          {currentWeek.days.length === 0 ? "Keine Tage in Woche " + (activeWeek + 1) + ". Füge deinen ersten Trainingstag hinzu!" :
            `${currentWeek.days.length} Trainingstag${currentWeek.days.length === 1 ? "" : "e"} in Woche ${activeWeek + 1}`}
        </div>
        <button onClick={addDay} className="btn btn-primary btn-block">+ Trainingstag hinzufügen</button>
      </div>

      {/* Days list */}
      {currentWeek.days.map((day: PlanDay, dayIdx: number) => (
        <div key={day.id} className="card">
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input className="form-input" value={day.name}
              onChange={(e) => updateDay(dayIdx, { name: e.target.value })}
              style={{ fontWeight: 700, fontSize: 16 }} />
            <input className="form-input" value={day.dayLabel || ""} placeholder="Mo"
              onChange={(e) => updateDay(dayIdx, { dayLabel: e.target.value })}
              maxLength={3} style={{ width: 70, textAlign: "center", fontWeight: 700 }} />
            <button onClick={() => deleteDay(dayIdx)} className="btn"
              style={{ color: "var(--red)", borderColor: "rgba(255,90,107,0.25)" }}>🗑</button>
          </div>

          {day.exercises.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 13 }}>
              Noch keine Übungen
            </div>
          ) : (
            <div style={{ marginBottom: 12 }}>
              {day.exercises.map((pe, exIdx) => {
                const ex = EXERCISES.find((x) => x.id === pe.exerciseId);
                if (!ex) return null;
                const isEditing = editingEx?.dayIdx === dayIdx && editingEx?.exIdx === exIdx;
                return (
                  <div key={exIdx} style={{
                    padding: 14, background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    borderRadius: 12, marginBottom: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 3, height: 30, borderRadius: 2, background: SPORT_COLORS[ex.sport] }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{ex.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                          {formatSets(pe, ex)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => moveExercise(dayIdx, exIdx, -1)} disabled={exIdx === 0}
                          className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 14 }}>↑</button>
                        <button onClick={() => moveExercise(dayIdx, exIdx, 1)} disabled={exIdx === day.exercises.length - 1}
                          className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 14 }}>↓</button>
                        <button onClick={() => setEditingEx(isEditing ? null : { dayIdx, exIdx })}
                          className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 13 }}>
                          {isEditing ? "▲" : "✎"}
                        </button>
                        <button onClick={() => removeExercise(dayIdx, exIdx)}
                          className="btn btn-ghost" style={{ padding: "6px 10px", color: "var(--red)", fontSize: 13 }}>✕</button>
                      </div>
                    </div>
                    {isEditing && (
                      <ExerciseSetEditor pe={pe} ex={ex}
                        onChange={(patch: Partial<PlanExercise>) => updateExercise(dayIdx, exIdx, patch)}
                        onClose={() => setEditingEx(null)} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={() => setShowAddEx({ dayIdx })} className="btn btn-block">
            + Übung hinzufügen
          </button>
        </div>
      ))}

      {showAddEx && (
        <ExercisePicker sport={sport} onPick={(ex) => addExercise(showAddEx.dayIdx, ex)}
          onClose={() => setShowAddEx(null)} />
      )}
    </div>
  );
}

function formatSets(pe: PlanExercise, ex: Exercise): string {
  switch (ex.tracking) {
    case "reps_weight":
      return `${pe.sets}×${pe.targetReps} @ ${pe.targetWeight || 0}kg · Pause ${pe.rest || 60}s`;
    case "reps_only":
      return `${pe.sets}×${pe.targetReps} · Pause ${pe.rest || 60}s`;
    case "time":
      return `${pe.sets}× ${pe.targetTime}s · Pause ${pe.rest || 60}s`;
    case "distance":
      return `${pe.sets}× ${((pe.targetDistance || 0) / 1000).toFixed(1)}km`;
    case "time_distance":
      return `${pe.sets}× ${pe.targetTime}s / ${pe.targetDistance}m`;
  }
}

function ExerciseSetEditor({ pe, ex, onChange, onClose }: any) {
  return (
    <div style={{
      marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)",
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10,
    }}>
      <div>
        <label className="form-label" style={{ fontSize: 10 }}>Sätze</label>
        <input className="form-input" type="number" min="1" max="20"
          value={pe.sets} onChange={(e) => onChange({ sets: parseInt(e.target.value) || 1 })}
          style={{ padding: "6px 8px", fontSize: 13 }} />
      </div>
      {(ex.tracking === "reps_weight" || ex.tracking === "reps_only") && (
        <div>
          <label className="form-label" style={{ fontSize: 10 }}>Reps</label>
          <input className="form-input" type="number" min="1"
            value={pe.targetReps || ""}
            onChange={(e) => onChange({ targetReps: parseInt(e.target.value) || undefined })}
            style={{ padding: "6px 8px", fontSize: 13 }} />
        </div>
      )}
      {ex.tracking === "reps_weight" && (
        <div>
          <label className="form-label" style={{ fontSize: 10 }}>Gewicht (kg)</label>
          <input className="form-input" type="number" min="0" step="0.5"
            value={pe.targetWeight || ""}
            onChange={(e) => onChange({ targetWeight: parseFloat(e.target.value) || undefined })}
            style={{ padding: "6px 8px", fontSize: 13 }} />
        </div>
      )}
      {(ex.tracking === "time" || ex.tracking === "time_distance") && (
        <div>
          <label className="form-label" style={{ fontSize: 10 }}>Zeit (Sek)</label>
          <input className="form-input" type="number" min="1"
            value={pe.targetTime || ""}
            onChange={(e) => onChange({ targetTime: parseInt(e.target.value) || undefined })}
            style={{ padding: "6px 8px", fontSize: 13 }} />
        </div>
      )}
      {(ex.tracking === "distance" || ex.tracking === "time_distance") && (
        <div>
          <label className="form-label" style={{ fontSize: 10 }}>Distanz (m)</label>
          <input className="form-input" type="number" min="1"
            value={pe.targetDistance || ""}
            onChange={(e) => onChange({ targetDistance: parseInt(e.target.value) || undefined })}
            style={{ padding: "6px 8px", fontSize: 13 }} />
        </div>
      )}
      <div>
        <label className="form-label" style={{ fontSize: 10 }}>Pause (Sek)</label>
        <input className="form-input" type="number" min="0" max="600"
          value={pe.rest || 60}
          onChange={(e) => onChange({ rest: parseInt(e.target.value) || 60 })}
          style={{ padding: "6px 8px", fontSize: 13 }} />
      </div>
    </div>
  );
}

function ExercisePicker({ sport, onPick, onClose }: { sport: Sport; onPick: (ex: Exercise) => void; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [filterSport, setFilterSport] = useState<Sport | "all">(sport);
  const [filterMuscle, setFilterMuscle] = useState<string>("all");

  let list = EXERCISES.filter((ex) => {
    if (filterSport !== "all" && ex.sport !== filterSport) return false;
    if (filterMuscle !== "all" && ex.muscle !== filterMuscle) return false;
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 400,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      backdropFilter: "blur(8px)",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{
        maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto", margin: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 20 }}>Übung hinzufügen</h3>
          <button onClick={onClose} className="btn btn-ghost">✕</button>
        </div>

        <input className="form-input" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Suchen..." style={{ marginBottom: 12 }} autoFocus />

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8, fontSize: 11 }}>
          <button onClick={() => setFilterSport("all")} style={pickerChip(filterSport === "all")}>Alle Sportarten</button>
          {(Object.keys(SPORT_LABELS) as Sport[]).map((s) => (
            <button key={s} onClick={() => setFilterSport(s)} style={pickerChip(filterSport === s, SPORT_COLORS[s])}>
              {SPORT_ICONS[s]} {SPORT_LABELS[s]}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, fontSize: 11 }}>
          <button onClick={() => setFilterMuscle("all")} style={pickerChip(filterMuscle === "all")}>Alle Muskeln</button>
          {Object.entries(MUSCLE_LABELS).map(([k, l]) => (
            <button key={k} onClick={() => setFilterMuscle(k)} style={pickerChip(filterMuscle === k)}>{l}</button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 700 }}>
          {list.length} Ergebnisse
        </div>

        {list.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>Keine Treffer</div>
        ) : (
          list.slice(0, 50).map((ex) => (
            <div key={ex.id} onClick={() => onPick(ex)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: 12,
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 10, marginBottom: 6, cursor: "pointer",
            }}>
              <div style={{ width: 3, height: 32, borderRadius: 2, background: SPORT_COLORS[ex.sport] }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{ex.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  {SPORT_ICONS[ex.sport]} {SPORT_LABELS[ex.sport]} · {MUSCLE_LABELS[ex.muscle]}
                </div>
              </div>
              <span style={{ color: "var(--accent)", fontSize: 18 }}>+</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function pickerChip(active: boolean, color?: string): React.CSSProperties {
  return {
    padding: "5px 10px", borderRadius: 999,
    border: `1px solid ${active ? (color || "var(--accent)") : "var(--border)"}`,
    background: active ? (color ? `${color}20` : "var(--accent-tint)") : "var(--bg-elevated)",
    color: active ? (color || "var(--accent)") : "var(--text-dim)",
    cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: 11,
  };
}
