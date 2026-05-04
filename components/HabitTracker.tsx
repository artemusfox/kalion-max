"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/components/LanguageProvider";

type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  position: number;
};

type DayLog = { habit_id: string; log_date: string };

const ICONS = ["✅", "💧", "📖", "🧘", "🏃", "🥦", "💊", "🛏️", "🧠", "✍️", "🌞", "🌙"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function HabitTracker() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState(ICONS[0]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const [{ data: h }, { data: l }] = await Promise.all([
      supabase.from("habits").select("*").eq("is_active", true).order("position"),
      supabase.from("habit_logs").select("habit_id, log_date").gte("log_date", since),
    ]);
    setHabits((h as Habit[]) || []);
    setLogs((l as DayLog[]) || []);
    setLoading(false);
  }

  async function addHabit() {
    if (!newName.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    await supabase.from("habits").insert({
      user_id: user.id, name: newName.trim(), icon: newIcon,
      position: habits.length,
    });
    setNewName(""); setNewIcon(ICONS[0]);
    setBusy(false);
    load();
  }

  async function deleteHabit(id: string) {
    if (!confirm(t("habits.delete.confirm"))) return;
    const supabase = createClient();
    await supabase.from("habits").update({ is_active: false }).eq("id", id);
    load();
  }

  async function toggleToday(habit: Habit) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = todayISO();
    const isDone = logs.some((l) => l.habit_id === habit.id && l.log_date === today);
    if (isDone) {
      await supabase.from("habit_logs").delete()
        .eq("habit_id", habit.id).eq("log_date", today);
      setLogs((s) => s.filter((l) => !(l.habit_id === habit.id && l.log_date === today)));
    } else {
      await supabase.from("habit_logs").insert({
        user_id: user.id, habit_id: habit.id, log_date: today,
      });
      setLogs((s) => [...s, { habit_id: habit.id, log_date: today }]);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
    }
  }

  function streakFor(habitId: string): number {
    const ds = new Set(logs.filter((l) => l.habit_id === habitId).map((l) => l.log_date));
    let count = 0;
    const today = todayISO();
    let cursor = new Date();
    if (!ds.has(today)) {
      cursor.setDate(cursor.getDate() - 1);
      if (!ds.has(cursor.toISOString().slice(0, 10))) return 0;
    }
    while (ds.has(cursor.toISOString().slice(0, 10))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  function isDoneToday(habitId: string): boolean {
    const today = todayISO();
    return logs.some((l) => l.habit_id === habitId && l.log_date === today);
  }

  const todayDoneCount = habits.filter((h) => isDoneToday(h.id)).length;
  const todayPct = habits.length > 0 ? (todayDoneCount / habits.length) * 100 : 0;

  if (loading) {
    return <div style={{ padding: 30, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  }

  return (
    <div>
      {/* Tages-Progress */}
      {habits.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginBottom: 6, fontSize: 11,
          }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>
              {t("habits.today")}
            </span>
            <span style={{ color: "var(--accent)", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
              {todayDoneCount} / {habits.length}
            </span>
          </div>
          <div style={{ height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "var(--accent)",
              width: `${todayPct}%`, transition: "width 0.4s",
            }} />
          </div>
        </div>
      )}

      {/* Liste */}
      {habits.length === 0 ? (
        <div style={{
          padding: 20, textAlign: "center", color: "var(--text-muted)",
          background: "var(--bg-elevated)", borderRadius: 10,
          border: "1px dashed var(--border)", fontSize: 12,
          marginBottom: 12,
        }}>
          {t("habits.empty")}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {habits.map((h) => {
            const done = isDoneToday(h.id);
            const streak = streakFor(h.id);
            return (
              <div key={h.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                background: done ? "var(--accent-tint)" : "var(--bg-elevated)",
                border: `1px solid ${done ? "var(--accent-border)" : "var(--border)"}`,
                borderRadius: 10,
                transition: "all 0.2s",
              }}>
                {/* Checkbox */}
                <button
                  onClick={() => toggleToday(h)}
                  aria-label={done ? "Uncheck" : "Check"}
                  style={{
                    width: 30, height: 30, borderRadius: "50%",
                    border: `2px solid ${done ? "var(--accent)" : "var(--border-strong)"}`,
                    background: done ? "var(--accent)" : "transparent",
                    color: done ? "#0a0a10" : "var(--text-muted)",
                    fontSize: 16, fontWeight: 900,
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.2s",
                  }}
                >{done ? "✓" : ""}</button>

                <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{h.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 800,
                    textDecoration: done ? "line-through" : "none",
                    color: done ? "var(--text-dim)" : "var(--text)",
                  }}>{h.name}</div>
                  {streak > 0 && (
                    <div style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      🔥 {streak} {t("habits.streak")}
                    </div>
                  )}
                </div>
                {editing && (
                  <button
                    onClick={() => deleteHabit(h.id)}
                    style={{
                      background: "transparent", border: "none",
                      color: "var(--red)", cursor: "pointer", fontSize: 16,
                      padding: 4,
                    }}
                  >🗑</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit-Mode */}
      {editing && (
        <div style={{
          marginTop: 12, padding: 12,
          background: "var(--bg-elevated)", borderRadius: 10,
          border: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setNewIcon(i)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: `1px solid ${newIcon === i ? "var(--accent)" : "var(--border)"}`,
                  background: newIcon === i ? "var(--accent-tint)" : "var(--bg)",
                  fontSize: 18, cursor: "pointer",
                }}
              >{i}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="form-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHabit(); } }}
              placeholder={t("habits.name.ph")}
              style={{ flex: 1, padding: "8px 10px", fontSize: 13 }}
            />
            <button
              onClick={addHabit}
              disabled={busy || !newName.trim()}
              className="btn btn-primary"
              style={{ padding: "8px 14px", fontSize: 13 }}
            >+</button>
          </div>
        </div>
      )}

      {/* Manage Toggle */}
      <button
        onClick={() => setEditing((s) => !s)}
        className="btn btn-ghost"
        style={{ marginTop: 10, fontSize: 11, padding: "6px 12px", width: "100%" }}
      >
        {editing ? `✓ ${t("habits.done")}` : `⚙ ${t("habits.manage")}`}
      </button>
    </div>
  );
}
