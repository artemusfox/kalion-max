"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { EXERCISES, EX_BY_ID } from "@/lib/exercises";
import { SPORT_COLORS, SPORT_LABELS, SPORT_ICONS, type Sport } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { EmptyState, SkeletonList } from "@/components/UI";
import VolumeHeatmap from "@/components/VolumeHeatmap";
import ExerciseChart from "@/components/ExerciseChart";

export default function ProgressPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"prs" | "charts" | "heatmap" | "streak" | "tools">("prs");
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [showAddPR, setShowAddPR] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data: prData } = await supabase.from("personal_records")
      .select("*").order("recorded_at", { ascending: false });
    setPrs(prData || []);
    const { data: p } = await supabase.from("profiles").select("*").single();
    setProfile(p);
    setLoading(false);
  }

  // Group PRs by exercise
  const prsByExercise = prs.reduce((acc: any, pr: any) => {
    if (!acc[pr.exercise_id]) acc[pr.exercise_id] = [];
    acc[pr.exercise_id].push(pr);
    return acc;
  }, {});

  return (
    <div>
      <div style={tabsStyle}>
        {(["prs", "charts", "heatmap", "streak", "tools"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={tabBtn(tab === t)}>
            {t === "prs" ? "🏆 PRs" :
             t === "charts" ? "📈 Charts" :
             t === "heatmap" ? "🔥 Heatmap" :
             t === "streak" ? "🔥 Streak" : "🧮 Tools"}
          </button>
        ))}
      </div>

      {loading ? <SkeletonList count={4} />
       : tab === "prs" ? (
        <>
          <button className="btn btn-primary btn-block" onClick={() => setShowAddPR(true)} style={{ marginBottom: 16 }}>
            + Neues PR eintragen
          </button>

          {showAddPR && <AddPRModal onClose={() => setShowAddPR(false)} onDone={() => { setShowAddPR(false); load(); toast("PR gespeichert!", { type: "success", icon: "🏆" }); }} />}

          {Object.keys(prsByExercise).length === 0 ? (
            <EmptyState
              icon="🏆"
              title="Noch keine Personal Records"
              description="Trag deinen ersten PR ein — z.B. 100kg Kniebeuge oder 10 Klimmzüge."
              action={{ label: "+ Erstes PR", onClick: () => setShowAddPR(true) }}
            />
          ) : (
            Object.entries(prsByExercise).map(([exId, prList]: [string, any]) => {
              const exercise = EX_BY_ID[exId];
              const latest = prList[0];
              const prev = prList[1];
              const diff = latest && prev ? latest.value - prev.value : null;
              return (
                <div key={exId} className="card card-hover" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 4, height: 44, borderRadius: 2, background: exercise ? SPORT_COLORS[exercise.sport] : "var(--text-muted)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>{latest.exercise_name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {new Date(latest.recorded_at).toLocaleDateString("de-DE")} · {prList.length} Eintrag{prList.length !== 1 ? "" : ""}
                    </div>
                    {diff !== null && diff > 0 && (
                      <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4, fontWeight: 800 }}>
                        ↑ +{diff} {latest.unit} seit vorher
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28, fontWeight: 800, letterSpacing: -1,
                    color: exercise ? SPORT_COLORS[exercise.sport] : "var(--text)",
                    textAlign: "right",
                  }}>
                    {latest.value}
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-body)", fontStyle: "normal", marginLeft: 4 }}>
                      {latest.unit}
                    </span>
                    {latest.reps && (
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontStyle: "normal", marginTop: 2 }}>
                        × {latest.reps} Reps
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </>
      ) : tab === "charts" ? (
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>📈 Verlauf pro Übung</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
            Gewicht und Volumen über Zeit — wähle eine Übung, um Plateaus und Spikes zu sehen.
          </div>
          <ExerciseChart />
        </div>
      ) : tab === "heatmap" ? (
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>🔥 Volume-Heatmap</div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
            So gleichmäßig hast du deine Muskelgruppen trainiert.
          </div>
          <VolumeHeatmap />
        </div>
      ) : tab === "streak" ? (
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>🔥 Streak-Statistik</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <StatBox label="Aktuell" value={profile?.current_streak || 0} suffix="Tage" color="var(--coral)" />
            <StatBox label="Rekord" value={profile?.best_streak || 0} suffix="Tage" color="var(--amber)" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <StatBox label="Workouts" value={profile?.total_workouts || 0} suffix="gesamt" color="var(--teal)" />
            <StatBox label="XP" value={profile?.xp || 0} suffix="Punkte" color="var(--indigo)" />
          </div>
        </div>
      ) : <ToolsTab />}
    </div>
  );
}

function AddPRModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [reps, setReps] = useState("");
  const [saving, setSaving] = useState(false);

  const list = EXERCISES.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20);

  async function save() {
    if (!selected || !value) return;
    const ex = EX_BY_ID[selected];
    if (!ex) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const unit = ex.tracking === "reps_weight" ? "kg" : ex.tracking === "reps_only" ? "reps" : ex.tracking === "time" ? "s" : "m";
    await supabase.from("personal_records").insert({
      user_id: user.id,
      exercise_id: ex.id, exercise_name: ex.name,
      record_type: ex.tracking === "reps_weight" ? "max_weight" : "max_reps",
      value: parseFloat(value), reps: reps ? parseInt(reps) : null, unit,
    });
    onDone();
  }

  const ex = selected ? EX_BY_ID[selected] : null;

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ maxWidth: 500, width: "100%", maxHeight: "85vh", overflowY: "auto", margin: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 20 }}>Neues PR</h3>
          <button onClick={onClose} className="btn btn-ghost">✕</button>
        </div>

        {!selected ? (
          <>
            <input className="form-input" placeholder="🔍 Übung suchen..." value={search}
              onChange={(e) => setSearch(e.target.value)} autoFocus style={{ marginBottom: 12 }} />
            {list.map((e) => (
              <div key={e.id} onClick={() => setSelected(e.id)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: 12,
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 10, marginBottom: 6, cursor: "pointer",
              }}>
                <div style={{ width: 3, height: 28, borderRadius: 2, background: SPORT_COLORS[e.sport] }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{e.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                    {SPORT_ICONS[e.sport]} {SPORT_LABELS[e.sport]}
                  </div>
                </div>
                <span style={{ color: "var(--accent)", fontSize: 18 }}>+</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{ex!.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 20 }}>{SPORT_LABELS[ex!.sport]}</div>
            <div className="form-group">
              <label className="form-label">
                {ex!.tracking === "reps_weight" ? "Max. Gewicht (kg)" :
                 ex!.tracking === "reps_only" ? "Max. Wiederholungen" :
                 ex!.tracking === "time" ? "Max. Zeit (Sek)" : "Max. Distanz (m)"}
              </label>
              <input className="form-input" type="number" inputMode="decimal" step="0.5"
                value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
            </div>
            {ex!.tracking === "reps_weight" && (
              <div className="form-group">
                <label className="form-label">Wiederholungen (optional)</label>
                <input className="form-input" type="number" inputMode="numeric"
                  value={reps} onChange={(e) => setReps(e.target.value)} placeholder="z.B. 5" />
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => setSelected(null)}>← Andere Übung</button>
              <button className="btn btn-primary btn-block" onClick={save} disabled={!value || saving}>
                {saving ? <div className="spinner" /> : "✓ Speichern"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, suffix, color }: any) {
  return (
    <div style={{ padding: 20, border: "1px solid var(--border)", borderRadius: 14, background: "var(--bg-elevated)", textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 44, fontWeight: 800, fontFamily: "var(--font-display)", color, letterSpacing: -2, lineHeight: 1, marginTop: 8 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600, marginTop: 4 }}>{suffix}</div>
    </div>
  );
}

function ToolsTab() {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const orm = weight && reps ? Math.round(parseFloat(weight) * (1 + parseFloat(reps) / 30)) : null;

  const [target, setTarget] = useState("");
  const [bar, setBar] = useState("20");
  const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const perSide = (parseFloat(target) || 0) - (parseFloat(bar) || 20);
  const stacksRaw = perSide / 2;
  const stacks: { plate: number; count: number }[] = [];
  if (stacksRaw > 0) {
    let rem = stacksRaw;
    for (const p of plates) {
      const c = Math.floor(rem / p);
      if (c > 0) { stacks.push({ plate: p, count: c }); rem -= c * p; }
    }
  }

  return (
    <>
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>🧮 1RM-Rechner</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.5 }}>
          Schätzt dein Maximalgewicht für eine Wdh. (Epley-Formel).
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="form-label">Gewicht (kg)</label>
            <input className="form-input" type="number" inputMode="decimal" value={weight}
              onChange={(e) => setWeight(e.target.value)} placeholder="z.B. 80" />
          </div>
          <div>
            <label className="form-label">Wiederholungen</label>
            <input className="form-input" type="number" inputMode="numeric" value={reps}
              onChange={(e) => setReps(e.target.value)} placeholder="z.B. 5" />
          </div>
        </div>
        {orm && (
          <div style={{ marginTop: 20, padding: 24, background: "var(--accent-tint)", border: "1px solid var(--accent-border)", borderRadius: 14, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800, textTransform: "uppercase" }}>Geschätztes 1RM</div>
            <div style={{ fontSize: 48, fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--accent)", letterSpacing: -2, marginTop: 8, lineHeight: 1 }}>
              {orm}<span style={{ fontSize: 18, color: "var(--text-muted)", fontStyle: "normal", fontFamily: "var(--font-body)", marginLeft: 4 }}>kg</span>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>🏋️ Plate Calculator</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>Welche Scheiben brauchst du pro Seite?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="form-label">Ziel (kg)</label>
            <input className="form-input" type="number" inputMode="decimal" value={target}
              onChange={(e) => setTarget(e.target.value)} placeholder="100" />
          </div>
          <div>
            <label className="form-label">Stange (kg)</label>
            <input className="form-input" type="number" inputMode="decimal" value={bar}
              onChange={(e) => setBar(e.target.value)} placeholder="20" />
          </div>
        </div>
        {stacks.length > 0 && (
          <div style={{ marginTop: 20, padding: 20, background: "var(--bg-elevated)", borderRadius: 14, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1.5, fontWeight: 800, textTransform: "uppercase", marginBottom: 12 }}>
              Pro Seite ({stacksRaw} kg)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {stacks.map((s, i) => (
                <div key={i} style={{
                  padding: "10px 16px", background: "var(--accent-tint)",
                  border: "1px solid var(--accent-border)", borderRadius: 10,
                  fontWeight: 800, fontFamily: "var(--font-mono)",
                }}>
                  {s.count}× <span style={{ color: "var(--accent)" }}>{s.plate} kg</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const tabsStyle: React.CSSProperties = {
  display: "flex", gap: 4, padding: 4, background: "var(--bg-raised)",
  border: "1px solid var(--border)", borderRadius: 14, marginBottom: 20,
};
function tabBtn(active: boolean): React.CSSProperties {
  return {
    flex: 1, padding: 10, borderRadius: 10, border: "none",
    background: active ? "var(--bg-elevated)" : "transparent",
    color: active ? "var(--text)" : "var(--text-muted)",
    cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700,
  };
}
const modalOverlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 400,
  display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  backdropFilter: "blur(8px)",
};
