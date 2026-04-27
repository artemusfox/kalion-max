"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { BADGES, levelFromXp, SPORT_LABELS, SPORT_ICONS, type Sport } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { EmptyState, SkeletonList } from "@/components/UI";

export default function GoalsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"goals" | "badges">("goals");
  const [goals, setGoals] = useState<any[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewGoal, setShowNewGoal] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data: g } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    setGoals(g || []);
    const { data: b } = await supabase.from("user_badges").select("badge_key");
    setBadges((b || []).map((x: any) => x.badge_key));
    const { data: p } = await supabase.from("profiles").select("*").single();
    setProfile(p);
    setLoading(false);
  }

  async function toggleGoalStatus(id: string, status: string) {
    const supabase = createClient();
    const newStatus = status === "completed" ? "active" : "completed";
    await supabase.from("goals").update({
      status: newStatus,
      completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    }).eq("id", id);
    toast(newStatus === "completed" ? "Ziel erreicht! 🎯" : "Ziel wieder aktiv", { type: "success" });
    load();
  }

  async function deleteGoal(id: string) {
    if (!confirm("Ziel wirklich löschen?")) return;
    const supabase = createClient();
    await supabase.from("goals").delete().eq("id", id);
    toast("Ziel gelöscht", { type: "info", icon: "🗑" });
    load();
  }

  const xp = profile?.xp || 0;
  const levelInfo = levelFromXp(xp);

  return (
    <div>
      {profile && (
        <div className="card" style={{
          background: "linear-gradient(135deg, var(--accent-tint), transparent)",
          borderColor: "var(--accent-border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#0a0a10", fontSize: 28, fontFamily: "var(--font-display)",
              fontWeight: 800, boxShadow: "0 4px 20px var(--accent-glow)",
              flexShrink: 0,
            }}>{levelInfo.level}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800, textTransform: "uppercase" }}>Level {levelInfo.level}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{xp} XP · {badges.length} Badges</div>
              <div style={{ height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden", marginTop: 10 }}>
                <div style={{ height: "100%", background: "var(--accent)", width: `${levelInfo.progress * 100}%`, transition: "width 0.4s" }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP zum nächsten Level
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={tabsStyle}>
        {(["goals", "badges"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={tabBtn(tab === t)}>
            {t === "goals" ? "🎯 Ziele" : "🏅 Badges"}
          </button>
        ))}
      </div>

      {loading ? <SkeletonList count={3} />
       : tab === "goals" ? (
        <>
          <button className="btn btn-primary btn-block" onClick={() => setShowNewGoal(true)} style={{ marginBottom: 16 }}>
            + Neues Ziel
          </button>
          {showNewGoal && <NewGoalForm onDone={() => { setShowNewGoal(false); toast("Ziel erstellt", { type: "success", icon: "🎯" }); load(); }} onCancel={() => setShowNewGoal(false)} />}
          {goals.length === 0 && !showNewGoal ? (
            <EmptyState
              icon="🎯"
              title="Noch keine Ziele"
              description="Setze dir ein konkretes Ziel und tracke deinen Fortschritt dorthin."
              action={{ label: "+ Erstes Ziel setzen", onClick: () => setShowNewGoal(true) }}
            />
          ) : (
            <div className="stagger">
            {goals.map((g) => {
              const pct = g.target_value ? Math.min(100, (g.current_value / g.target_value) * 100) : 0;
              const done = g.status === "completed";
              const sport = g.sport as Sport;
              return (
                <div key={g.id} className="card" style={{
                  borderColor: done ? "var(--accent-border)" : "var(--border)",
                  background: done ? "var(--accent-tint)" : "var(--bg-raised)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 18 }}>{done ? "✅" : sport ? SPORT_ICONS[sport] : "🎯"}</span>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{g.title}</div>
                      </div>
                      {g.description && <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>{g.description}</div>}
                      {g.target_value && (
                        <>
                          <div style={{ height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                            <div style={{ height: "100%", background: "var(--accent)", width: `${pct}%`, transition: "width 0.4s" }} />
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                            {g.current_value} / {g.target_value} {g.unit || ""} · {Math.round(pct)}%
                          </div>
                        </>
                      )}
                      {g.deadline && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                          🗓 bis {new Date(g.deadline).toLocaleDateString("de-DE")}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <button onClick={() => toggleGoalStatus(g.id, g.status)} className="btn btn-ghost"
                        style={{ padding: "6px 10px", fontSize: 11 }}>{done ? "↩" : "✓"}</button>
                      <button onClick={() => deleteGoal(g.id)} className="btn btn-ghost"
                        style={{ padding: "6px 10px", fontSize: 11, color: "var(--red)" }}>🗑</button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>🏅 Badges · {badges.length} / {BADGES.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
            {BADGES.map((b) => {
              const earned = badges.includes(b.key);
              return (
                <div key={b.key} style={{
                  padding: 18, borderRadius: 14, textAlign: "center",
                  background: earned ? "var(--accent-tint)" : "var(--bg-elevated)",
                  border: `1px solid ${earned ? "var(--accent-border)" : "var(--border)"}`,
                  opacity: earned ? 1 : 0.4, transition: "all 0.3s",
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8, filter: earned ? "none" : "grayscale(1)" }}>{b.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.3 }}>{b.desc}</div>
                  <div style={{ fontSize: 11, color: earned ? "var(--accent)" : "var(--text-muted)", fontWeight: 800, marginTop: 6, fontFamily: "var(--font-mono)" }}>
                    +{b.xp} XP
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function NewGoalForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("kg");
  const [sport, setSport] = useState<Sport | "">("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("goals").insert({
      user_id: user.id,
      title, description: desc || null,
      target_value: target ? parseFloat(target) : null,
      unit, sport: sport || null,
      deadline: deadline || null,
    });
    setSaving(false);
    onDone();
  }

  return (
    <div className="card">
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>🎯 Neues Ziel</div>
      <div className="form-group">
        <label className="form-label">Titel</label>
        <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="z.B. 100kg Kniebeuge" autoFocus />
      </div>
      <div className="form-group">
        <label className="form-label">Beschreibung</label>
        <textarea className="form-textarea" value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="Optional" rows={2} />
      </div>
      <div className="form-group">
        <label className="form-label">Sportart (optional)</label>
        <select className="form-select" value={sport} onChange={(e) => setSport(e.target.value as Sport)}>
          <option value="">Keine</option>
          {(Object.keys(SPORT_LABELS) as Sport[]).map((s) => (
            <option key={s} value={s}>{SPORT_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Zielwert</label>
          <input className="form-input" type="number" inputMode="decimal"
            value={target} onChange={(e) => setTarget(e.target.value)} placeholder="100" />
        </div>
        <div className="form-group">
          <label className="form-label">Einheit</label>
          <input className="form-input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg / reps / km" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Deadline (optional)</label>
        <input className="form-input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-primary btn-block" onClick={save} disabled={saving || !title.trim()}>
          {saving ? <div className="spinner" /> : "Speichern"}
        </button>
        <button className="btn" onClick={onCancel}>Abbrechen</button>
      </div>
    </div>
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
