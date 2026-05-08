"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/components/LanguageProvider";
import MicroBurst from "@/components/MicroBurst";

type RoutineType = "morning" | "evening";

type RoutineItem = {
  id: string;
  routine_type: RoutineType;
  name: string;
  icon: string;
  position: number;
};

const ICONS_MORNING = ["☀️", "💧", "🧘", "🏃", "🥣", "💊", "📓", "🧴", "📖"];
const ICONS_EVENING = ["🌙", "🛁", "📖", "🧘", "💊", "📝", "🍵", "🎵", "🛏️"];

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function RoutineChecklist({ type }: { type: RoutineType }) {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState(type === "morning" ? "☀️" : "🌙");
  const [busy, setBusy] = useState(false);
  const [bursts, setBursts] = useState<Record<string, number>>({});

  const ICONS = type === "morning" ? ICONS_MORNING : ICONS_EVENING;
  const title = type === "morning" ? t("routine.morning") : t("routine.evening");
  const desc  = type === "morning" ? t("routine.morning.desc") : t("routine.evening.desc");
  const empty = type === "morning" ? t("routine.empty.morning") : t("routine.empty.evening");

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [type]);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const today = todayISO();
    const [{ data: r }, { data: l }] = await Promise.all([
      supabase.from("routine_items").select("*")
        .eq("routine_type", type).eq("is_active", true).order("position"),
      supabase.from("routine_logs").select("routine_item_id")
        .eq("log_date", today),
    ]);
    setItems((r as RoutineItem[]) || []);
    setDoneIds(new Set(((l as any[]) || []).map((x) => x.routine_item_id)));
    setLoading(false);
  }

  async function addItem() {
    if (!newName.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    await supabase.from("routine_items").insert({
      user_id: user.id, routine_type: type,
      name: newName.trim(), icon: newIcon, position: items.length,
    });
    setNewName("");
    setBusy(false);
    load();
  }

  async function deleteItem(id: string) {
    const supabase = createClient();
    await supabase.from("routine_items").update({ is_active: false }).eq("id", id);
    load();
  }

  async function toggle(item: RoutineItem) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = todayISO();
    const isDone = doneIds.has(item.id);
    if (isDone) {
      await supabase.from("routine_logs").delete()
        .eq("routine_item_id", item.id).eq("log_date", today);
      setDoneIds((s) => { const n = new Set(s); n.delete(item.id); return n; });
    } else {
      await supabase.from("routine_logs").insert({
        user_id: user.id, routine_item_id: item.id, log_date: today,
      });
      setDoneIds((s) => new Set([...s, item.id]));
      setBursts((s) => ({ ...s, [item.id]: (s[item.id] || 0) + 1 }));
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
    }
  }

  if (loading) {
    return <div style={{ padding: 30, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  }

  const allDone = items.length > 0 && items.every((i) => doneIds.has(i.id));

  return (
    <div className="card" style={{
      borderColor: allDone ? "var(--accent-border)" : "var(--border)",
      background: allDone ? "var(--accent-tint)" : "var(--bg-raised)",
      transition: "all 0.4s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div>
        {items.length > 0 && (
          <div style={{
            fontSize: 11, color: allDone ? "var(--accent)" : "var(--text-muted)",
            fontFamily: "var(--font-mono)", fontWeight: 800,
          }}>
            {doneIds.size} / {items.length}
            {allDone && ` ${t("routine.complete")}`}
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14 }}>{desc}</div>

      {items.length === 0 ? (
        <div style={{
          padding: 16, textAlign: "center", color: "var(--text-muted)",
          background: "var(--bg-elevated)", borderRadius: 10,
          border: "1px dashed var(--border)", fontSize: 12,
        }}>
          {empty}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((it) => {
            const done = doneIds.has(it.id);
            return (
              <div key={it.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px",
                background: done ? "var(--surface-2)" : "var(--bg-elevated)",
                border: "1px solid var(--border)", borderRadius: 8,
                transition: "all 0.2s",
              }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <button
                    onClick={() => toggle(it)}
                    style={{
                      width: 26, height: 26, borderRadius: "50%",
                      border: `2px solid ${done ? "var(--accent)" : "var(--border-strong)"}`,
                      background: done ? "var(--accent)" : "transparent",
                      color: done ? "#0a0a10" : "var(--text-muted)",
                      fontSize: 13, fontWeight: 900, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >{done ? "✓" : ""}</button>
                  <MicroBurst trigger={bursts[it.id] || 0} color="var(--accent)" count={6} size={5} />
                </div>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{it.icon}</span>
                <div style={{
                  flex: 1, fontSize: 12, fontWeight: 700,
                  textDecoration: done ? "line-through" : "none",
                  color: done ? "var(--text-dim)" : "var(--text)",
                }}>{it.name}</div>
                {editing && (
                  <button
                    onClick={() => deleteItem(it.id)}
                    style={{
                      background: "transparent", border: "none",
                      color: "var(--red)", cursor: "pointer", fontSize: 14,
                    }}
                  >🗑</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div style={{
          marginTop: 10, padding: 10,
          background: "var(--bg-elevated)", borderRadius: 8,
          border: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {ICONS.map((i) => (
              <button key={i}
                onClick={() => setNewIcon(i)}
                style={{
                  width: 30, height: 30, borderRadius: 6,
                  border: `1px solid ${newIcon === i ? "var(--accent)" : "var(--border)"}`,
                  background: newIcon === i ? "var(--accent-tint)" : "var(--bg)",
                  fontSize: 15, cursor: "pointer",
                }}
              >{i}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="form-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
              placeholder={t("routine.item.ph")}
              style={{ flex: 1, padding: "6px 10px", fontSize: 12 }}
            />
            <button
              onClick={addItem}
              disabled={busy || !newName.trim()}
              className="btn btn-primary"
              style={{ padding: "6px 12px", fontSize: 12 }}
            >+</button>
          </div>
        </div>
      )}

      <button
        onClick={() => setEditing((s) => !s)}
        className="btn btn-ghost"
        style={{ marginTop: 8, fontSize: 11, padding: "6px 12px", width: "100%" }}
      >
        {editing ? `✓ ${t("habits.done")}` : `⚙ ${t("habits.manage")}`}
      </button>
    </div>
  );
}
