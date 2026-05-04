"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { BADGES, levelFromXp, SPORT_LABELS, SPORT_ICONS, type Sport } from "@/lib/types";
import { EXERCISES, EX_BY_ID } from "@/lib/exercises";
import { useToast } from "@/components/Toast";
import { EmptyState, SkeletonList } from "@/components/UI";
import Confetti from "@/components/Confetti";
import { useLanguage } from "@/components/LanguageProvider";
import { badgeName, badgeDesc, exerciseName as exNameTr } from "@/lib/data-translations";

export default function GoalsPage() {
  const { toast } = useToast();
  const { t: tr, lang } = useLanguage();
  const [tab, setTab] = useState<"goals" | "badges">("goals");
  const [goals, setGoals] = useState<any[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();

    // Vorher: Active-Goals aus PRs aktualisieren
    const before = await supabase.from("goals").select("id, status").eq("status", "active");
    await supabase.rpc("refresh_goal_progress");
    const { data: g } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    setGoals(g || []);

    // Wenn ein Goal NEU completed ist (vorher active, jetzt completed) → Konfetti
    if (before.data && g) {
      const wasActive = new Set(before.data.filter((x: any) => x.status === "active").map((x: any) => x.id));
      const newlyDone = g.filter((x: any) => wasActive.has(x.id) && x.status === "completed");
      if (newlyDone.length > 0) {
        setConfettiKey((k) => k + 1);
        toast(lang === "en" ? `🎯 Goal achieved: ${newlyDone[0].title}!` : `🎯 Ziel erreicht: ${newlyDone[0].title}!`, { type: "success", icon: "🎯" });
      }
    }

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
    toast(newStatus === "completed" ? tr("goals.completed.toast") : tr("goals.reactivated"), { type: "success" });
    load();
  }

  async function deleteGoal(id: string) {
    if (!confirm(tr("goals.delete.confirm"))) return;
    const supabase = createClient();
    await supabase.from("goals").delete().eq("id", id);
    toast(tr("goals.deleted.toast"), { type: "info", icon: "🗑" });
    load();
  }

  const xp = profile?.xp || 0;
  const levelInfo = levelFromXp(xp);

  return (
    <div>
      <Confetti trigger={confettiKey} />
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
            {t === "goals" ? tr("goals.tab.goals") : tr("goals.tab.badges")}
          </button>
        ))}
      </div>

      {loading ? <SkeletonList count={3} />
       : tab === "goals" ? (
        <>
          <button className="btn btn-primary btn-block" onClick={() => setShowNewGoal(true)} style={{ marginBottom: 16 }}>
            {tr("goals.new")}
          </button>
          {showNewGoal && <NewGoalForm onDone={() => { setShowNewGoal(false); toast(tr("goals.created.toast"), { type: "success", icon: "🎯" }); load(); }} onCancel={() => setShowNewGoal(false)} />}
          {goals.length === 0 && !showNewGoal ? (
            <EmptyState
              icon="🎯"
              title={tr("goals.empty.title")}
              description={tr("goals.empty.desc")}
              action={{ label: tr("goals.empty.cta"), onClick: () => setShowNewGoal(true) }}
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
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{badgeName(b.key, b.name, lang)}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.3 }}>{badgeDesc(b.key, b.desc, lang)}</div>
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
  const { lang } = useLanguage();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("kg");
  const [sport, setSport] = useState<Sport | "">("");
  const [deadline, setDeadline] = useState("");
  const [linkedExId, setLinkedExId] = useState("");
  const [exSearch, setExSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const exMatches = exSearch
    ? EXERCISES.filter((e) => {
        const q = exSearch.toLowerCase();
        return e.name.toLowerCase().includes(q) || exNameTr(e.id, e.name, lang).toLowerCase().includes(q);
      }).slice(0, 6)
    : [];
  const linkedEx = linkedExId ? EX_BY_ID[linkedExId] : null;

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
      linked_exercise_id: linkedExId || null,
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

      <div className="form-group">
        <label className="form-label">Mit Übung verknüpfen (optional)</label>
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 6, lineHeight: 1.4 }}>
          Wenn verknüpft, wird der Fortschritt automatisch aus deinen PRs für diese Übung berechnet.
        </div>
        {linkedEx ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: 10,
            background: "var(--accent-tint)", border: "1px solid var(--accent-border)",
            borderRadius: 10,
          }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>
              ⚡ {exNameTr(linkedEx.id, linkedEx.name, lang)}
            </div>
            <button
              type="button"
              onClick={() => { setLinkedExId(""); setExSearch(""); }}
              className="btn btn-ghost"
              style={{ padding: "4px 10px", fontSize: 11 }}
            >Lösen</button>
          </div>
        ) : (
          <>
            <input
              className="form-input"
              value={exSearch}
              onChange={(e) => setExSearch(e.target.value)}
              placeholder="🔍 Übung suchen..."
              style={{ marginBottom: exMatches.length > 0 ? 6 : 0 }}
            />
            {exMatches.length > 0 && (
              <div style={{
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 8, maxHeight: 200, overflowY: "auto",
              }}>
                {exMatches.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => { setLinkedExId(e.id); setExSearch(""); }}
                    style={{
                      width: "100%", padding: "8px 10px", textAlign: "left",
                      background: "transparent", border: "none", color: "var(--text)",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 12,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >{SPORT_ICONS[e.sport]} {exNameTr(e.id, e.name, lang)}</button>
                ))}
              </div>
            )}
          </>
        )}
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
