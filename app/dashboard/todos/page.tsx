"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/components/LanguageProvider";
import { nextOccurrence, recurrenceLabel, RECURRENCE_OPTIONS } from "@/lib/recurrence";
import { markdownToHtml } from "@/lib/markdown";

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
  parent_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: number;
  position: number;
  completed_at: string | null;
  recurrence: string | null;
  recurrence_until: string | null;
};

type Attachment = {
  id: string;
  item_id: string;
  filename: string | null;
  file_url: string | null;
  storage_path: string | null;
  size_bytes: number | null;
  signed_url?: string | null;
};

const ICON_OPTIONS = ["📝", "✅", "📅", "🎬", "📚", "🎵", "🎮", "✈️", "🛒", "💼", "🏠", "💡", "🎯", "🌟", "🍳"];
const COLORS = ["#22D3EE", "#FF5A6B", "#A78BFA", "#FFB800", "#52D983", "#F472B6", "#FB923C", "#60A5FA"];

export default function TodosPage() {
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const [lists, setLists] = useState<List[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [attachments, setAttachments] = useState<Record<string, Attachment[]>>({});
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewList, setShowNewList] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListIcon, setNewListIcon] = useState("📝");
  const [newListColor, setNewListColor] = useState(COLORS[0]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [{ data: ls }, { data: its }, { data: atts }] = await Promise.all([
      supabase.from("todo_lists").select("*").eq("is_archived", false).order("position"),
      supabase.from("todo_items").select("*").order("position"),
      supabase.from("todo_attachments").select("*"),
    ]);
    setLists((ls as List[]) || []);
    setItems((its as Item[]) || []);
    // Attachments nach item_id gruppieren
    const aMap: Record<string, Attachment[]> = {};
    for (const a of (atts || []) as Attachment[]) {
      if (!aMap[a.item_id]) aMap[a.item_id] = [];
      aMap[a.item_id].push(a);
    }
    setAttachments(aMap);
    if (!activeListId && ls && ls.length > 0) setActiveListId(ls[0].id);
    setLoading(false);
  }

  // ── List CRUD ──
  async function addList() {
    if (!newListName.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("todo_lists").insert({
      user_id: user.id, name: newListName.trim(),
      icon: newListIcon, color: newListColor, position: lists.length,
    }).select().single();
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

  // ── Item CRUD ──
  async function addItem(parentId: string | null = null) {
    const title = parentId ? prompt(lang === "en" ? "Sub-task title:" : "Sub-Task-Titel:") : newItemTitle.trim();
    if (!title || !activeListId) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const siblingsCount = items.filter((i) => i.list_id === activeListId && i.parent_id === parentId).length;
    const { data } = await supabase.from("todo_items").insert({
      user_id: user.id, list_id: activeListId, parent_id: parentId,
      title, position: siblingsCount,
    }).select().single();
    if (data) setItems((s) => [...s, data as Item]);
    if (!parentId) setNewItemTitle("");
  }

  async function patchItem(id: string, patch: Partial<Item>) {
    const supabase = createClient();
    setItems((s) => s.map((i) => i.id === id ? { ...i, ...patch } : i));
    await supabase.from("todo_items").update(patch).eq("id", id);
  }

  async function deleteItem(id: string) {
    const supabase = createClient();
    await supabase.from("todo_items").delete().eq("id", id);
    setItems((s) => s.filter((i) => i.id !== id && i.parent_id !== id));
  }

  async function toggleItem(item: Item) {
    if (item.completed_at) {
      await patchItem(item.id, { completed_at: null });
      return;
    }
    const supabase = createClient();
    const newCompletedAt = new Date().toISOString();
    setItems((s) => s.map((i) => i.id === item.id ? { ...i, completed_at: newCompletedAt } : i));
    await supabase.from("todo_items").update({ completed_at: newCompletedAt }).eq("id", item.id);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);

    // Wiederkehrend? → nächste Occurrence anlegen
    if (item.recurrence) {
      const fromDate = item.due_date ? new Date(item.due_date) : new Date();
      const until = item.recurrence_until ? new Date(item.recurrence_until) : null;
      const next = nextOccurrence(item.recurrence, fromDate, until);
      if (next) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("todo_items").insert({
            user_id: user.id, list_id: item.list_id, parent_id: item.parent_id,
            title: item.title, description: item.description, priority: item.priority,
            position: items.filter((i) => i.list_id === item.list_id && i.parent_id === item.parent_id).length,
            due_date: next, recurrence: item.recurrence,
            recurrence_until: item.recurrence_until,
            last_recurrence_origin: item.id,
          }).select().single();
          if (data) {
            setItems((s) => [...s, data as Item]);
            toast(lang === "en" ? "🔁 Next occurrence created" : "🔁 Nächste Wiederholung angelegt", { type: "success" });
          }
        }
      }
    }
  }

  // ── Drag-Reorder ──
  function onDragStart(id: string) { setDragId(id); }
  async function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const drag = items.find((i) => i.id === dragId);
    const target = items.find((i) => i.id === targetId);
    if (!drag || !target) { setDragId(null); return; }
    // Nur innerhalb gleicher Liste + gleicher Parent
    if (drag.list_id !== target.list_id || drag.parent_id !== target.parent_id) {
      setDragId(null);
      return;
    }
    const siblings = items
      .filter((i) => i.list_id === drag.list_id && i.parent_id === drag.parent_id)
      .sort((a, b) => a.position - b.position);
    const fromIdx = siblings.findIndex((i) => i.id === drag.id);
    const toIdx = siblings.findIndex((i) => i.id === target.id);
    siblings.splice(fromIdx, 1);
    siblings.splice(toIdx, 0, drag);

    // Neu durchnummerieren
    const supabase = createClient();
    const updates = siblings.map((it, idx) => ({ id: it.id, position: idx }));
    setItems((s) => s.map((i) => {
      const upd = updates.find((u) => u.id === i.id);
      return upd ? { ...i, position: upd.position } : i;
    }));
    for (const u of updates) {
      await supabase.from("todo_items").update({ position: u.position }).eq("id", u.id);
    }
    setDragId(null);
  }

  // ── Attachments ──
  async function addAttachment(itemId: string, file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast(lang === "en" ? "Max 10 MB" : "Max 10 MB", { type: "error" });
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = `${user.id}/${itemId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("todo-attachments").upload(path, file);
    if (upErr) { toast(upErr.message, { type: "error" }); return; }
    const { data: signed } = await supabase.storage.from("todo-attachments")
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 Tage gültig

    const { data } = await supabase.from("todo_attachments").insert({
      user_id: user.id, item_id: itemId,
      file_url: signed?.signedUrl || "", storage_path: path,
      filename: file.name, mime_type: file.type, size_bytes: file.size,
    }).select().single();

    if (data) {
      const att: Attachment = { ...(data as Attachment), signed_url: signed?.signedUrl };
      setAttachments((s) => ({ ...s, [itemId]: [...(s[itemId] || []), att] }));
    }
  }

  async function deleteAttachment(att: Attachment) {
    const supabase = createClient();
    if (att.storage_path) await supabase.storage.from("todo-attachments").remove([att.storage_path]);
    await supabase.from("todo_attachments").delete().eq("id", att.id);
    setAttachments((s) => ({
      ...s,
      [att.item_id]: (s[att.item_id] || []).filter((a) => a.id !== att.id),
    }));
  }

  // ── Sichtbare Items für aktive Liste ──
  const activeList = lists.find((l) => l.id === activeListId);
  const allListItems = useMemo(
    () => items.filter((i) => i.list_id === activeListId),
    [items, activeListId]
  );
  const topLevelItems = useMemo(
    () => allListItems
      .filter((i) => !i.parent_id)
      .sort((a, b) => a.position - b.position),
    [allListItems]
  );
  const visibleTopLevel = showCompleted ? topLevelItems : topLevelItems.filter((i) => !i.completed_at);
  const completedCount = topLevelItems.filter((i) => i.completed_at).length;
  const openCount = topLevelItems.length - completedCount;

  function getChildren(parentId: string): Item[] {
    return allListItems
      .filter((i) => i.parent_id === parentId)
      .sort((a, b) => a.position - b.position);
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
        <h1 style={{ fontSize: 22 }}>{t("todos.title")}</h1>
        <a href="/api/calendar/ics" download className="btn btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }}>
          📅 {lang === "en" ? "Calendar export (.ics)" : "Kalender-Export (.ics)"}
        </a>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 18 }}>{t("todos.desc")}</p>

      {/* Listen-Tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {lists.map((l) => {
          const active = l.id === activeListId;
          const open = items.filter((i) => i.list_id === l.id && !i.parent_id && !i.completed_at).length;
          return (
            <button key={l.id} onClick={() => setActiveListId(l.id)} style={{
              padding: "8px 14px", borderRadius: 999, whiteSpace: "nowrap",
              border: active ? `2px solid ${l.color}` : "1px solid var(--border)",
              background: active ? `${l.color}1A` : "var(--bg-elevated)",
              color: active ? l.color : "var(--text)",
              cursor: "pointer", fontFamily: "inherit",
              fontSize: 12, fontWeight: 800,
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            }}>
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
        <button onClick={() => setShowNewList(true)} style={{
          padding: "8px 14px", borderRadius: 999, whiteSpace: "nowrap",
          border: "1px dashed var(--border-active)", background: "transparent",
          color: "var(--text-muted)", cursor: "pointer",
          fontFamily: "inherit", fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>+ {lang === "en" ? "List" : "Liste"}</button>
      </div>

      {/* Neue Liste */}
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
            <input autoFocus className="form-input" value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addList(); } }}
              placeholder={t("todos.list.name.ph")}
              style={{ flex: 1, padding: "8px 10px", fontSize: 13 }} />
            <button onClick={addList} className="btn btn-primary">{t("common.add")}</button>
            <button onClick={() => { setShowNewList(false); setNewListName(""); }} className="btn">{t("common.cancel")}</button>
          </div>
        </div>
      )}

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

          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <input className="form-input" value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
              placeholder={t("todos.item.add.ph")}
              style={{ flex: 1, padding: "10px 12px" }} />
            <button onClick={() => addItem()} disabled={!newItemTitle.trim()} className="btn btn-primary">+</button>
          </div>

          {visibleTopLevel.length === 0 ? (
            <div style={{
              padding: 24, textAlign: "center", color: "var(--text-muted)",
              fontSize: 12, background: "var(--bg-elevated)", borderRadius: 10,
              border: "1px dashed var(--border)",
            }}>{t("todos.empty")}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {visibleTopLevel.map((it) => (
                <ItemRow
                  key={it.id}
                  item={it}
                  children={getChildren(it.id)}
                  attachments={attachments[it.id] || []}
                  color={activeList.color}
                  expanded={expandedId === it.id}
                  onExpand={() => setExpandedId(expandedId === it.id ? null : it.id)}
                  onToggle={() => toggleItem(it)}
                  onDelete={() => deleteItem(it.id)}
                  onPatch={(p) => patchItem(it.id, p)}
                  onAddSub={() => addItem(it.id)}
                  onToggleSub={(child) => toggleItem(child)}
                  onDeleteSub={(child) => deleteItem(child.id)}
                  onAttach={(file) => addAttachment(it.id, file)}
                  onDeleteAttach={deleteAttachment}
                  onDragStart={() => onDragStart(it.id)}
                  onDrop={() => onDrop(it.id)}
                  isDragging={dragId === it.id}
                  lang={lang}
                />
              ))}
            </div>
          )}

          {completedCount > 0 && (
            <button onClick={() => setShowCompleted((s) => !s)}
              className="btn btn-ghost"
              style={{ marginTop: 10, fontSize: 11, width: "100%" }}>
              {showCompleted ? `↑ ${t("todos.hide.completed")}` : `↓ ${t("todos.show.completed")} (${completedCount})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ItemRow({
  item, children: childItems, attachments,
  color, expanded, onExpand,
  onToggle, onDelete, onPatch,
  onAddSub, onToggleSub, onDeleteSub,
  onAttach, onDeleteAttach,
  onDragStart, onDrop, isDragging,
  lang,
}: {
  item: Item;
  children: Item[];
  attachments: Attachment[];
  color: string;
  expanded: boolean;
  onExpand: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onPatch: (p: Partial<Item>) => void;
  onAddSub: () => void;
  onToggleSub: (c: Item) => void;
  onDeleteSub: (c: Item) => void;
  onAttach: (f: File) => void;
  onDeleteAttach: (a: Attachment) => void;
  onDragStart: () => void;
  onDrop: () => void;
  isDragging: boolean;
  lang: "de" | "en";
}) {
  const done = !!item.completed_at;
  const due = item.due_date ? new Date(item.due_date) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const overdue = due && due < today && !done;
  const dueToday = due && due.toDateString() === today.toDateString();
  const prioColor = ["transparent", "#60A5FA", "#FFB800", "#FF5A6B"][item.priority];

  const childOpenCount = childItems.filter((c) => !c.completed_at).length;
  const childTotalCount = childItems.length;

  return (
    <div
      draggable={!expanded}
      onDragStart={(e) => { onDragStart(); e.dataTransfer.effectAllowed = "move"; }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
      style={{
        background: done ? "var(--surface-2)" : "var(--bg-elevated)",
        border: `1px solid ${overdue ? "rgba(255,90,107,0.4)" : "var(--border)"}`,
        borderRadius: 10, padding: 10,
        borderLeft: item.priority > 0 ? `3px solid ${prioColor}` : `1px solid ${overdue ? "rgba(255,90,107,0.4)" : "var(--border)"}`,
        opacity: isDragging ? 0.5 : 1,
        cursor: expanded ? "default" : "grab",
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onToggle} style={{
          width: 24, height: 24, borderRadius: "50%",
          border: `2px solid ${done ? color : "var(--border-strong)"}`,
          background: done ? color : "transparent",
          color: done ? "#0a0a10" : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: 12, fontWeight: 900,
        }}>{done ? "✓" : ""}</button>

        <div onClick={onExpand} style={{ flex: 1, cursor: "pointer", minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 700,
            textDecoration: done ? "line-through" : "none",
            color: done ? "var(--text-dim)" : "var(--text)",
            wordBreak: "break-word",
          }}>{item.title}</div>
          <div style={{ display: "flex", gap: 8, fontSize: 10, marginTop: 2, color: "var(--text-muted)", flexWrap: "wrap" }}>
            {due && (
              <span style={{ color: overdue ? "var(--red)" : dueToday ? "var(--accent)" : "var(--text-muted)", fontWeight: 800 }}>
                {overdue ? "⚠ " : ""}{due.toLocaleDateString(lang === "en" ? "en-US" : "de-DE", { day: "2-digit", month: "short" })}
              </span>
            )}
            {item.recurrence && <span>🔁 {recurrenceLabel(item.recurrence, lang)}</span>}
            {childTotalCount > 0 && <span>📁 {childOpenCount} / {childTotalCount}</span>}
            {attachments.length > 0 && <span>📎 {attachments.length}</span>}
            {item.description && <span>📄</span>}
          </div>
        </div>

        <button onClick={onDelete} style={{
          background: "transparent", border: "none", color: "var(--text-muted)",
          cursor: "pointer", fontSize: 14, padding: 4, flexShrink: 0,
        }}>×</button>
      </div>

      {/* Sub-Tasks immer sichtbar wenn welche vorhanden */}
      {childItems.length > 0 && (
        <div style={{ marginTop: 8, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 3 }}>
          {childItems.map((c) => (
            <SubItemRow
              key={c.id}
              item={c}
              color={color}
              onToggle={() => onToggleSub(c)}
              onDelete={() => onDeleteSub(c)}
              lang={lang}
            />
          ))}
        </div>
      )}

      {/* Erweitert: Details + Editor */}
      {expanded && (
        <div style={{ marginTop: 12, padding: 10, background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
          {/* Priorität */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", minWidth: 70 }}>
              {lang === "en" ? "Priority" : "Priorität"}
            </span>
            {[0, 1, 2, 3].map((p) => (
              <button key={p} onClick={() => onPatch({ priority: p })} style={{
                width: 26, height: 26, borderRadius: 6,
                background: p === item.priority ? ["var(--surface)", "#60A5FA", "#FFB800", "#FF5A6B"][p] : "var(--surface)",
                border: `1px solid ${p === item.priority ? ["var(--border)", "#60A5FA", "#FFB800", "#FF5A6B"][p] : "var(--border)"}`,
                color: p === item.priority && p > 0 ? "#0a0a10" : "var(--text-muted)",
                cursor: "pointer", fontSize: 11, fontWeight: 800,
              }}>{p === 0 ? "—" : "!".repeat(p)}</button>
            ))}
          </div>

          {/* Fälligkeit */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", minWidth: 70 }}>
              {lang === "en" ? "Due" : "Fällig"}
            </span>
            <input type="date" value={item.due_date || ""}
              onChange={(e) => onPatch({ due_date: e.target.value || null })}
              className="form-input"
              style={{ flex: 1, padding: "5px 8px", fontSize: 11 }} />
            {item.due_date && (
              <button onClick={() => onPatch({ due_date: null })} className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }}>×</button>
            )}
          </div>

          {/* Wiederholung */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", minWidth: 70 }}>
              {lang === "en" ? "Repeat" : "Wiederh."}
            </span>
            <select value={item.recurrence || ""}
              onChange={(e) => onPatch({ recurrence: e.target.value || null })}
              className="form-select"
              style={{ flex: 1, padding: "5px 8px", fontSize: 11 }}>
              {RECURRENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{lang === "en" ? o.label_en : o.label_de}</option>
              ))}
            </select>
          </div>

          {/* Markdown-Beschreibung */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              {lang === "en" ? "Notes (Markdown)" : "Notizen (Markdown)"}
            </div>
            <textarea value={item.description || ""}
              onChange={(e) => onPatch({ description: e.target.value })}
              placeholder={lang === "en"
                ? "**bold** *italic* `code` [link](https://...) — bullet"
                : "**fett** *kursiv* `code` [link](https://...) — Stichpunkt"}
              className="form-textarea"
              rows={3}
              style={{ width: "100%", fontSize: 12, padding: 8, fontFamily: "var(--font-mono)" }} />
            {item.description && (
              <div style={{
                marginTop: 8, padding: 10, background: "var(--bg-elevated)",
                border: "1px solid var(--border)", borderRadius: 8,
                fontSize: 12,
              }} dangerouslySetInnerHTML={{ __html: markdownToHtml(item.description) }} />
            )}
          </div>

          {/* Sub-Task hinzufügen */}
          <button onClick={onAddSub} className="btn btn-ghost"
            style={{ fontSize: 11, padding: "6px 10px", marginRight: 6 }}>
            + {lang === "en" ? "Sub-task" : "Sub-Task"}
          </button>

          {/* Attachment-Upload */}
          <label style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 10px", fontSize: 11, fontWeight: 700,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, cursor: "pointer",
          }}>
            📎 {lang === "en" ? "Attach" : "Anhang"}
            <input type="file" style={{ display: "none" }}
              onChange={(e) => { if (e.target.files?.[0]) onAttach(e.target.files[0]); e.target.value = ""; }} />
          </label>

          {/* Attachments-Liste */}
          {attachments.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
              {attachments.map((a) => (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 10px", background: "var(--bg-elevated)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 11,
                }}>
                  <span>📎</span>
                  <a href={a.signed_url || a.file_url || "#"} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, color: "var(--accent)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.filename || "Attachment"}
                  </a>
                  {a.size_bytes && (
                    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {(a.size_bytes / 1024).toFixed(0)} KB
                    </span>
                  )}
                  <button onClick={() => onDeleteAttach(a)} style={{
                    background: "transparent", border: "none", color: "var(--text-muted)",
                    cursor: "pointer", fontSize: 14,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubItemRow({ item, color, onToggle, onDelete, lang }: {
  item: Item; color: string;
  onToggle: () => void; onDelete: () => void; lang: "de" | "en";
}) {
  const done = !!item.completed_at;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "5px 8px",
      background: done ? "transparent" : "var(--surface)",
      borderRadius: 6, border: "1px solid var(--border)",
      borderLeft: `2px solid ${color}40`,
    }}>
      <button onClick={onToggle} style={{
        width: 18, height: 18, borderRadius: "50%",
        border: `2px solid ${done ? color : "var(--border-strong)"}`,
        background: done ? color : "transparent",
        color: done ? "#0a0a10" : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 9, fontWeight: 900,
      }}>{done ? "✓" : ""}</button>
      <div style={{
        flex: 1, fontSize: 11, fontWeight: 600,
        textDecoration: done ? "line-through" : "none",
        color: done ? "var(--text-dim)" : "var(--text-2)",
      }}>{item.title}</div>
      <button onClick={onDelete} style={{
        background: "transparent", border: "none", color: "var(--text-muted)",
        cursor: "pointer", fontSize: 12, padding: 2,
      }}>×</button>
    </div>
  );
}
