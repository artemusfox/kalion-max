"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { EX_BY_ID } from "@/lib/exercises";
import { SPORT_COLORS, type PlanExercise, type Exercise, type TrackingMode } from "@/lib/types";
import { useToast } from "@/components/Toast";

type SetData = {
  reps?: number;
  weight?: number;
  time?: number;
  distance?: number;
  done: boolean;
};

type ExState = PlanExercise & {
  exercise: Exercise;
  sets: SetData[];
};

export default function WorkoutSession({
  planId, sport, week, dayIdx, dayName, dayLabel, exercises,
}: {
  planId: string; sport: string; week: number; dayIdx: number;
  dayName: string; dayLabel: string; exercises: PlanExercise[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<ExState[]>(() =>
    exercises.map((pe) => {
      const ex = EX_BY_ID[pe.exerciseId];
      return {
        ...pe, exercise: ex,
        sets: Array.from({ length: pe.sets }, () => ({
          reps: pe.targetReps,
          weight: pe.targetWeight,
          time: pe.targetTime,
          distance: pe.targetDistance,
          done: false,
        })),
      };
    }).filter((e) => e.exercise) // nur Übungen mit gefundener Referenz
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const restIntervalRef = useRef<any>(null);

  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [startTime]);

  useEffect(() => () => clearInterval(restIntervalRef.current), []);

  const ex = session[currentIdx];
  const totalSets = session.reduce((s, e) => s + e.sets.length, 0);
  const doneSets = session.reduce((s, e) => s + e.sets.filter((x) => x.done).length, 0);
  const progress = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  function updateSet(setIdx: number, patch: Partial<SetData>) {
    setSession((s) => s.map((e, i) => i === currentIdx ? {
      ...e, sets: e.sets.map((st, j) => j === setIdx ? { ...st, ...patch } : st)
    } : e));
  }

  function toggleSet(setIdx: number) {
    const wasDone = ex.sets[setIdx].done;
    updateSet(setIdx, { done: !wasDone });
    if (!wasDone) {
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40);
      const isLastSetOfEx = setIdx === ex.sets.length - 1;
      const isLastEx = currentIdx === session.length - 1;
      if (!(isLastSetOfEx && isLastEx) && ex.rest && ex.rest > 0) {
        startRest(ex.rest);
      }
    }
  }

  function startRest(sec: number) {
    clearInterval(restIntervalRef.current);
    setRestSeconds(sec);
    restIntervalRef.current = setInterval(() => {
      setRestSeconds((r) => {
        if (r === null || r <= 1) {
          clearInterval(restIntervalRef.current);
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
          return null;
        }
        return r - 1;
      });
    }, 1000);
  }

  function adjustRest(delta: number) {
    setRestSeconds((r) => (r === null ? r : Math.max(1, r + delta)));
  }

  function skipRest() {
    clearInterval(restIntervalRef.current);
    setRestSeconds(null);
  }

  async function saveWorkout() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast("Nicht eingeloggt", { type: "error" }); setSaving(false); return; }

    const duration = Math.floor((Date.now() - startTime) / 1000);
    const totalReps = session.reduce((sum, e) =>
      sum + e.sets.filter((s) => s.done).reduce((r, s) => r + (s.reps || 0), 0), 0);
    const totalVolume = session.reduce((sum, e) =>
      sum + e.sets.filter((s) => s.done).reduce((v, s) => v + (s.reps || 0) * (s.weight || 0), 0), 0);
    const totalDistance = session.reduce((sum, e) =>
      sum + e.sets.filter((s) => s.done).reduce((d, s) => d + (s.distance || 0), 0), 0);

    const { error } = await supabase.from("workouts").insert({
      user_id: user.id,
      plan_id: planId,
      sport,
      week, day_idx: dayIdx, day_name: dayName,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_sec: duration,
      completed_sets: doneSets,
      total_sets: totalSets,
      total_reps: totalReps,
      total_volume: totalVolume,
      total_distance: totalDistance,
      mood, notes,
      exercises_data: session.map((e) => ({
        id: e.exercise.id, n: e.exercise.name, c: e.exercise.sport,
        tracking: e.exercise.tracking,
        sets: e.sets,
      })),
    });

    if (error) { toast("Fehler beim Speichern: " + error.message, { type: "error" }); setSaving(false); return; }

    // XP & Streak
    const xpGained = doneSets * 10 + (doneSets === totalSets ? 50 : 0);
    const { data: prof } = await supabase.from("profiles")
      .select("xp, total_workouts, current_streak, last_workout_date, best_streak").single();
    if (prof) {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let streak = prof.current_streak || 0;
      if (prof.last_workout_date === yesterday) streak += 1;
      else if (prof.last_workout_date !== today) streak = 1;
      const best = Math.max(prof.best_streak || 0, streak);
      await supabase.from("profiles").update({
        xp: (prof.xp || 0) + xpGained,
        total_workouts: (prof.total_workouts || 0) + 1,
        current_streak: streak, best_streak: best,
        last_workout_date: today,
      }).eq("id", user.id);
    }

    toast(`+${xpGained} XP verdient! 💪`, { type: "success", icon: "⚡" });
    router.push("/dashboard/training");
    router.refresh();
  }

  if (showSummary) {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const mm = Math.floor(duration / 60);
    const ss = duration % 60;
    const totalReps = session.reduce((sum, e) =>
      sum + e.sets.filter((s) => s.done).reduce((r, s) => r + (s.reps || 0), 0), 0);
    const totalVolume = session.reduce((sum, e) =>
      sum + e.sets.filter((s) => s.done).reduce((v, s) => v + (s.reps || 0) * (s.weight || 0), 0), 0);
    const perfect = doneSets === totalSets;

    return (
      <div style={overlayStyle}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: 20 }}>
          <div className="card" style={{
            background: "linear-gradient(135deg, var(--accent-tint), transparent)",
            borderColor: "var(--accent-border)", textAlign: "center", padding: 40,
          }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>{perfect ? "🏆" : "💪"}</div>
            <h2 style={{ fontStyle: "italic", fontSize: 28, marginBottom: 8 }}>
              {perfect ? "Perfekt!" : "Gut gemacht!"}
            </h2>
            <div style={{ color: "var(--text-dim)" }}>{dayName} · Woche {week}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: totalVolume > 0 ? "repeat(4, 1fr)" : "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            <SummaryStat val={`${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`} label="Dauer" color="var(--teal)" />
            <SummaryStat val={`${doneSets}/${totalSets}`} label="Sätze" color="var(--coral)" />
            <SummaryStat val={totalReps} label="Wdh." color="var(--amber)" />
            {totalVolume > 0 && <SummaryStat val={`${totalVolume}kg`} label="Volumen" color="var(--indigo)" />}
          </div>

          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>😊 Wie war's?</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
              {[{e:"😣",l:"Sehr hart"},{e:"😓",l:"Hart"},{e:"💪",l:"Normal"},{e:"😊",l:"Leicht"},{e:"🔥",l:"Top"}].map((m, i) => (
                <button key={i} onClick={() => setMood(i + 1)} style={{
                  padding: 12, borderRadius: 12, cursor: "pointer",
                  border: `1px solid ${mood === i+1 ? "var(--accent)" : "var(--border)"}`,
                  background: mood === i+1 ? "var(--accent-tint)" : "var(--bg-elevated)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: 26 }}>{m.e}</span>
                  <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700 }}>{m.l}</span>
                </button>
              ))}
            </div>
            <textarea className="form-textarea" placeholder="Notizen..." rows={3}
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <button className="btn btn-primary btn-block" onClick={saveWorkout} disabled={saving} style={{ padding: 18 }}>
            {saving ? <div className="spinner" /> : "✓ Workout speichern"}
          </button>
        </div>
      </div>
    );
  }

  if (!ex) {
    return (
      <div style={overlayStyle}>
        <div style={{ padding: 40, textAlign: "center" }}>
          <div>Keine Übungen in diesem Workout.</div>
          <button className="btn" style={{ marginTop: 20 }} onClick={() => router.back()}>Zurück</button>
        </div>
      </div>
    );
  }

  const restPct = restSeconds !== null && ex.rest ? (restSeconds / ex.rest) * 100 : 0;

  return (
    <div style={overlayStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={() => {
          if (doneSets > 0 && !confirm("Workout beenden?")) return;
          router.back();
        }} className="btn btn-ghost">✕</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800 }}>SESSION</div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, fontWeight: 800 }}>
            {String(Math.floor(elapsed/60)).padStart(2,"0")}:{String(elapsed%60).padStart(2,"0")}
          </div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", background: "var(--accent)", width: `${progress}%`, transition: "width 0.4s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
          <span>{dayLabel} · {dayName} · W{week}</span>
          <span>{doneSets}/{totalSets} Sätze</span>
        </div>
      </div>

      {/* Exercise card */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: 20, paddingBottom: 120 }}>
        <div className="card" style={{ position: "relative", overflow: "hidden", padding: 28 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: SPORT_COLORS[ex.exercise.sport] }} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800, marginBottom: 6, textTransform: "uppercase" }}>
            Übung {currentIdx + 1} von {session.length}
          </div>
          <h2 style={{ fontSize: 30, fontStyle: "italic", letterSpacing: -1, marginBottom: 12, lineHeight: 1.1 }}>
            {ex.exercise.name}
          </h2>
          {ex.exercise.tip && (
            <div style={{
              fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 20,
              padding: "12px 14px", background: "var(--surface)", borderRadius: 12,
              borderLeft: "3px solid var(--accent)",
            }}>💡 {ex.exercise.tip}</div>
          )}

          {/* Sets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ex.sets.map((s, si) => (
              <SetRow key={si} set={s} idx={si} tracking={ex.exercise.tracking}
                onUpdate={(patch) => updateSet(si, patch)}
                onToggle={() => toggleSet(si)} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={bottomNavStyle}>
        <div style={{ maxWidth: 560, width: "100%", display: "flex", gap: 10 }}>
          <button className="btn" onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))} disabled={currentIdx === 0}>← Zurück</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => {
            if (currentIdx === session.length - 1) setShowSummary(true);
            else { setCurrentIdx((i) => i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
          }}>
            {currentIdx === session.length - 1 ? "✓ Workout beenden" : "Nächste →"}
          </button>
        </div>
      </div>

      {restSeconds !== null && (
        <div style={restOverlayStyle}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: 3, textTransform: "uppercase", fontWeight: 800, marginBottom: 20 }}>Pause</div>
            <div style={{ fontSize: 140, fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 800, color: "var(--accent)", letterSpacing: -5, lineHeight: 1, marginBottom: 30 }}>
              {restSeconds}
            </div>
            <div style={{ height: 4, background: "var(--surface)", borderRadius: 2, overflow: "hidden", marginBottom: 24 }}>
              <div style={{ height: "100%", background: "var(--accent)", width: `${restPct}%`, transition: "width 1s linear" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn" onClick={() => adjustRest(-15)}>−15s</button>
              <button className="btn" onClick={() => adjustRest(15)}>+15s</button>
              <button className="btn btn-primary" onClick={skipRest}>Überspringen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SetRow({ set, idx, tracking, onUpdate, onToggle }: {
  set: SetData; idx: number; tracking: TrackingMode;
  onUpdate: (p: Partial<SetData>) => void; onToggle: () => void;
}) {
  return (
    <div className={set.done ? "animate-pop" : ""} style={{
      display: "flex", alignItems: "center", gap: 12,
      background: set.done ? "var(--accent-tint)" : "var(--bg-elevated)",
      border: `1px solid ${set.done ? "var(--accent-border)" : "var(--border)"}`,
      borderRadius: 12, padding: "12px 14px", flexWrap: "wrap",
      transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: set.done ? "var(--accent)" : "var(--surface)",
        color: set.done ? "#0a0a10" : "var(--text-dim)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontFamily: "var(--font-mono)", fontSize: 13,
        transition: "background 0.25s, color 0.25s",
      }}>{idx + 1}</div>

      <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minWidth: 0 }}>
        {(tracking === "reps_weight" || tracking === "reps_only") && (
          <SetField label="Reps" value={set.reps} onChange={(v) => onUpdate({ reps: v })} />
        )}
        {tracking === "reps_weight" && (
          <SetField label="kg" value={set.weight} step={0.5} onChange={(v) => onUpdate({ weight: v })} />
        )}
        {(tracking === "time" || tracking === "time_distance") && (
          <SetField label="Sek" value={set.time} onChange={(v) => onUpdate({ time: v })} />
        )}
        {(tracking === "distance" || tracking === "time_distance") && (
          <SetField label="m" value={set.distance} onChange={(v) => onUpdate({ distance: v })} />
        )}
      </div>

      <button onClick={onToggle} style={{
        padding: "8px 14px", borderRadius: 10, border: "1px solid var(--accent)",
        background: set.done ? "var(--accent)" : "transparent",
        color: set.done ? "#0a0a10" : "var(--accent)",
        cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 800,
      }}>{set.done ? "✓ OK" : "✓"}</button>
    </div>
  );
}

function SetField({ label, value, step = 1, onChange }: { label: string; value?: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <input type="number" inputMode="decimal" step={step}
        value={value ?? ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8,
          padding: "6px 8px", width: 60, color: "var(--text)",
          fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
          outline: "none", textAlign: "center",
        }} />
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>{label}</span>
    </div>
  );
}

function SummaryStat({ val, label, color }: any) {
  return (
    <div className="card" style={{ padding: 16, marginBottom: 0, textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, fontWeight: 800,
        letterSpacing: -0.5, color,
      }}>{val}</div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800, marginTop: 6 }}>{label}</div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "var(--bg)", zIndex: 100, overflowY: "auto",
};

const headerStyle: React.CSSProperties = {
  position: "sticky", top: 0, zIndex: 10, padding: "16px 20px",
  background: "rgba(15,18,24,0.92)", backdropFilter: "blur(24px)",
  borderBottom: "1px solid var(--border)",
  display: "flex", alignItems: "center", justifyContent: "space-between",
};

const bottomNavStyle: React.CSSProperties = {
  position: "fixed", bottom: 0, left: 0, right: 0,
  padding: "14px 20px calc(14px + var(--safe-bottom))",
  background: "rgba(15,18,24,0.92)", backdropFilter: "blur(24px)",
  borderTop: "1px solid var(--border)",
  display: "flex", justifyContent: "center",
};

const restOverlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 30,
  background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
