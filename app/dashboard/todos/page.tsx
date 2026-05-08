"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/components/LanguageProvider";

type List = {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
};

type Item = {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: number;
  position: number;
  completed_at: string | null;
};

const ICON_OPTIONS = ["📝", "✅", "📅", "🎬", "📚", "🎵", "🎮", "✈️", "🛒", "💼", "🏠", "💡", "🎯", "🌟", "🍳"];
const COLORS = ["#22D3EE", "#FF5A6B", "#A78BFA", "#FFB800", "#52D983", "#F472B6", "#FB923C", "#60A5FA"];

export default function TodosPage() {
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const [lists, setLists] = useState<List[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewList, setShowNewList] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListIcon, setNewListIcon] = useState("📝");
  const [newListColor, setNewListColor] = useState(COLORS[0]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [{ data: ls }, { data: its }] = await Promise.all([
      supabase.from("todo_lists").select("*").eq("is_archived", false).order("position"),
      supabase.from("todo_items").select("*").order("position"),
    ]);
    setLists((ls as List[]) || []);
    setItems((its as Item[]) || []);
    if (!activeListId && ls && ls.length > 0) setActiveListId(ls[0].id);
    setLoading(false);
  }

  async function addList() {
    if (!newListName.trim()) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const { data } = await supabase.from("todo_lists").insert({
      user_id: user.id,
      name: newListName.trim(),
      icon: newListIcon,
      color: newListColor,
      position: lists.length,
    }).select().single();
    setBusy(false);
    setNewListName("");
    setShowNewList(false);
    if (data) setActiveListId(data.id);
    load();
  }

  async function deleteList(id: string) {
    if (!confirm(t("todos.delete.list"))) return;
    const supabase = createClient();
    await supabase.from("todo_lists").delete().eq("id", id);
    setActiveListId(lists.find((l) => l.id !== id)?.id ?? null);
    load();
  }

  async function addItem() {
    if (!newItemTitle.trim() || !activeListId) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("todo_items").insert({
      user_id: user.id,
      list_id: activeListId,
      title: newItemTitle.trim(),
      position: items.filter((i) => i.list_id === activeListId).length,
    }).select().single();
    if (data) setItems((s) => [...s, data as Item]);
    setNewItemTitle("");
  }

  async function toggleItem(item: Item) {
    const supabase = createClient();
    const newCompletedAt = item.completed_at ? null : new Date().toISOString();
    setItems((s) => s.map((i) => i.id === item.id ? { ...i, completed_at: newCompletedAt } : i));
    await supabase.from("todo_items").update({ completed_at: newCompletedAt }).eq("id", item.id);
    if (newCompletedAt && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
  }

  async function deleteItem(id: string) {
    const supabase = createClient();
    await supabase.from("todo_items").delete().eq("id", id);
    setItems((s) => s.filter((i) => i.id !== id));
  }

  async function setPriority(item: Item, priority: number) {
    const supabase = createClient();
    setItems((s) => s.map((i) => i.id === item.id ? { ...i, priority } : i));
    await supabase.from("todo_items").update({ priority }).eq("id", item.id);
  }

  async function setDueDate(item: Item, due_date: string | null) {
    const supabase = createClient();
    setItems((s) => s.map((i) => i.id === item.id ? { ...i, due_date } : i));
    await supabase.from("todo_items").update({ due_date }).eq("id", item.id);
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  }

  const activeList = lists.find((l) => l.id === activeListId);
  const listItems = items.filter((i) => i.list_id === activeListId);
  const visibleItems = showCompleted ? listItems : listItems.filter((i) => !i.completed_at);
  const completedCount = listItems.filter((i) => i.completed_at).length;
  const openCount = listItems.length - completedCount;

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>{t("todos.title")}</h1>
      <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 18 }}>{t("todos.desc")}</p>

      {/* Listen-Tabs */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto", marginBottom: 16,
        paddingBottom: 4, scrollbarWidth: "thin",
      }}>
        {lists.map((l) => {
          const active = l.id === activeListId;
          const open = items.filter((i) => i.list_id === l.id && !i.completed_at).length;
          return (
            <button
              key={l.id}
              onClick={() => setActiveListId(l.id)}
              style={{
                padding: "8px 14px", borderRadius: 999, whiteSpace: "nowrap",
                border: active ? `2px solid ${l.color}` : "1px solid var(--border)",
                background: active ? `${l.color}1A` : "var(--bg-elevated)",
                color: active ? l.color : "var(--text)",
                cursor: "pointer", fontFamily: "inherit",
                fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", gap: 6,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 16 }}>{l.icon}</span>
              <span>{l.name}</span>
              {open > 0 && (
                <span style={{
                  fontSize: 10, padding: "1px 6px",
                  background: active ? l.color : "var(--surface)",
                  color: active ? "#0a0a10" : "var(--text-muted)",
                  borderRadius: 999, fontWeight: 800, marginLeft: 2,
                }}>{open}</span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => setShowNewList(true)}
          style={{
            padding: "8px 14px", borderRadius: 999, whiteSpace: "nowrap",
            border: "1px dashed var(--border-active)", background: "transparent",
            color: "var(--text-muted)", cursor: "pointer",
            fontFamily: "inherit", fontSize: 12, fontWeight: 700,
            flexShrink: 0,
          }}
        >+ {lang === "en" ? "List" : "Liste"}</button>
      </div>

      {/* Neue Liste anlegen */}
      {showNewList && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{t("todos.list.new")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {ICON_OPTIONS.map((i) => (
              <button key={i} onClick={() => setNewListIcon(i)} style={{
                width: 36, height: 36, borderRadius: 8,
                border: `1px solid ${newListIcon === i ? "var(--accent)" : "var(--border)"}`,
                background: newListIcon === i ? "var(--accent-tint)" : "var(--bg-elevated)",
                fontSize: 18, cursor: "pointer",
              }}>{i}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {COLORS.map((c) => (
              <button key={c} onClick={() => setNewListColor(c)} style={{
                width: 28, height: 28, borderRadius: "50%",
                background: c, cursor: "pointer",
                border: newListColor === c ? "3px solid var(--text)" : "1px solid var(--border)",
              }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              autoFocus
              className="form-input"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addList(); } }}
              placeholder={t("todos.list.name.ph")}
              style={{ flex: 1, padding: "8px 10px", fontSize: 13 }}
            />
            <button onClick={addList} disabled={busy} className="btn btn-primary" style={{ padding: "8px 14px" }}>{t("common.add")}</button>
            <button onClick={() => { setShowNewList(false); setNewListName(""); }} className="btn">{t("common.cancel")}</button>
          </div>
        </div>
      )}

      {/* Aktive Liste */}
      {activeList && (
        <div className="card" style={{
          background: `linear-gradient(135deg, ${activeList.color}10, var(--bg-raised))`,
          borderColor: `${activeList.color}40`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 28 }}>{activeList.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{activeList.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: 2 }}>
                {openCount} {lang === "en" ? "open" : "offen"} · {completedCount} {t("todos.completed")}
              </div>
            </div>
            <button onClick={() => deleteList(activeList.id)} style={{
              background: "transparent", border: "none", color: "var(--red)",
              cursor: "pointer", fontSize: 16, padding: 6,
            }}>🗑</button>
          </div>

          {/* Quick-Add */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <input
              className="form-input"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
              placeholder={t("todos.item.add.ph")}
              style={{ flex: 1, padding: "10px 12px" }}
            />
            <button onClick={addItem} disabled={!newItemTitle.trim()} className="btn btn-primary">+</button>
          </div>

          {/* Items */}
          {visibleItems.length === 0 ? (
            <div style={{
              padding: 24, textAlign: "center", color: "var(--text-muted)",
              fontSize: 12, background: "var(--bg-elevated)", borderRadius: 10,
              border: "1px dashed var(--border)",
            }}>{t("todos.empty")}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {visibleItems.map((it) => (
                <ItemRow
                  key={it.id}
                  item={it}
                  color={activeList.color}
                  onToggle={() => toggleItem(it)}
                  onDelete={() => deleteItem(it.id)}
                  onPriority={(p) => setPriority(it, p)}
                  onDue={(d) => setDueDate(it, d)}
                  lang={lang}
                />
              ))}
            </div>
          )}

          {completedCount > 0 && (
            <button
              onClick={() => setShowCompleted((s) => !s)}
              className="btn btn-ghost"
              style={{ marginTop: 10, fontSize: 11, width: "100%" }}
            >
              {showCompleted ? `↑ ${t("todos.hide.completed")}` : `↓ ${t("todos.show.completed")} (${completedCount})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, color, onToggle, onDelete, onPriority, onDue, lang }: {
  item: Item; color: string;
  onToggle: () => void; onDelete: () => void;
  onPriority: (p: number) => void;
  onDue: (d: string | null) => void;
  lang: "de" | "en";
}) {
  const done = !!item.completed_at;
  const [expanded, setExpanded] = useState(false);
  const due = item.due_date ? new Date(item.due_date) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const overdue = due && due < today && !done;
  const dueToday = due && due.toDateString() === today.toDateString();

  const prioColor = ["transparent", "#60A5FA", "#FFB800", "#FF5A6B"][item.priority];
  const prioLabel = lang === "en"
    ? ["—", "Low", "Med", "High"][item.priority]
    : ["—", "Niedrig", "Mittel", "Hoch"][item.priority];

  return (
    <div style={{
      background: done ? "var(--surface-2)" : "var(--bg-elevated)",
      border: `1px solid ${overdue ? "rgba(255,90,107,0.4)" : "var(--border)"}`,
      borderRadius: 10, padding: 10,
      borderLeft: item.priority > 0 ? `3px solid ${prioColor}` : `1px solid ${overdue ? "rgba(255,90,107,0.4)" : "var(--border)"}`,
      transition: "all 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onToggle}
          style={{
            width: 24, height: 24, borderRadius: "50%",
            border: `2px solid ${done ? color : "var(--border-strong)"}`,
            background: done ? color : "transparent",
            color: done ? "#0a0a10" : "transparent",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 12, fontWeight: 900,
          }}
        >{done ? "✓" : ""}</button>

        <div
          onClick={() => setExpanded((s) => !s)}
          style={{
            flex: 1, cursor: "pointer", minWidth: 0,
          }}
        >
          <div style={{
            fontSize: 13, fontWeight: 700,
            textDecoration: done ? "line-through" : "none",
            color: done ? "var(--text-dim)" : "var(--text)",
            wordBreak: "break-word",
          }}>{item.title}</div>
          {due && (
            <div style={{
              fontSize: 10, fontWeight: 800,
              color: overdue ? "var(--red)" : dueToday ? "var(--accent)" : "var(--text-muted)",
              marginTop: 2,
            }}>
              {overdue ? "⚠ " : ""}{due.toLocaleDateString(lang === "en" ? "en-US" : "de-DE", { day: "2-digit", month: "short" })}
              {overdue && (lang === "en" ? " — overdue" : " — überfällig")}
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          style={{
            background: "transparent", border: "none",
            color: "var(--text-muted)", cursor: "pointer",
            fontSize: 14, padding: 4, flexShrink: 0,
          }}
        >×</button>
      </div>

      {expanded && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {/* Priority-Toggle */}
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => onPriority(p)}
                title={["—", "Low", "Med", "High"][p]}
                style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: p === item.priority ? ["var(--surface)", "#60A5FA", "#FFB800", "#FF5A6B"][p] : "var(--surface)",
                  border: `1px solid ${p === item.priority ? ["var(--border)", "#60A5FA", "#FFB800", "#FF5A6B"][p] : "var(--border)"}`,
                  color: p === item.priority && p > 0 ? "#0a0a10" : "var(--text-muted)",
                  cursor: "pointer", fontSize: 11, fontWeight: 800,
                }}
              >{p === 0 ? "—" : "!".repeat(p)}</button>
            ))}
          </div>
          {/* Due-Date */}
          <input
            type="date"
            value={item.due_date || ""}
            onChange={(e) => onDue(e.target.value || null)}
            className="form-input"
            style={{ flex: 1, minWidth: 130, padding: "5px 8px", fontSize: 11 }}
          />
        </div>
      )}
    </div>
  );
}
