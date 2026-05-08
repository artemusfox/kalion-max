"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/components/LanguageProvider";

type Item = {
  id: string;
  list_id: string;
  title: string;
  due_date: string | null;
  priority: number;
  completed_at: string | null;
};

type ListInfo = { id: string; name: string; icon: string; color: string };

export default function DailyPlanner() {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [lists, setLists] = useState<Record<string, ListInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    // Heute + 6 Tage Window für "Demnächst"
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().slice(0, 10);
    const weekFromNow = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);

    const [{ data: its }, { data: ls }] = await Promise.all([
      supabase.from("todo_items")
        .select("id, list_id, title, due_date, priority, completed_at")
        .is("completed_at", null)
        .or(`due_date.lte.${weekFromNow},priority.gte.2`)
        .order("priority", { ascending: false })
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase.from("todo_lists").select("id, name, icon, color"),
    ]);

    setItems((its as Item[]) || []);
    const lmap: Record<string, ListInfo> = {};
    for (const l of (ls || []) as ListInfo[]) lmap[l.id] = l;
    setLists(lmap);
    setLoading(false);
  }

  async function toggle(item: Item) {
    const supabase = createClient();
    const newCompletedAt = new Date().toISOString();
    setItems((s) => s.filter((i) => i.id !== item.id));
    await supabase.from("todo_items").update({ completed_at: newCompletedAt }).eq("id", item.id);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
  }

  if (loading) {
    return <div style={{ padding: 30, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const buckets = {
    overdue: [] as Item[],
    today: [] as Item[],
    upcoming: [] as Item[],
    priority: [] as Item[],
  };

  for (const it of items) {
    const due = it.due_date ? new Date(it.due_date) : null;
    if (due) {
      if (due < today) buckets.overdue.push(it);
      else if (due.toDateString() === today.toDateString()) buckets.today.push(it);
      else buckets.upcoming.push(it);
    } else if (it.priority >= 2) {
      buckets.priority.push(it);
    }
  }

  const totalShown =
    buckets.overdue.length + buckets.today.length +
    buckets.upcoming.length + buckets.priority.length;

  if (totalShown === 0) {
    return (
      <div style={{
        padding: 24, textAlign: "center", color: "var(--text-muted)",
        background: "var(--bg-elevated)", borderRadius: 10,
        border: "1px dashed var(--border)",
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
        <div style={{ fontSize: 12 }}>{t("planner.no.priority")}</div>
        <Link href="/dashboard/todos" className="btn btn-ghost" style={{ marginTop: 10, fontSize: 11, padding: "6px 12px", display: "inline-block" }}>
          {lang === "en" ? "Open lists →" : "Listen öffnen →"}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {buckets.overdue.length > 0 && (
        <Bucket
          title={t("planner.overdue")}
          icon="⚠"
          color="var(--red)"
          items={buckets.overdue}
          lists={lists}
          onToggle={toggle}
          lang={lang}
        />
      )}
      {buckets.today.length > 0 && (
        <Bucket
          title={t("planner.today")}
          icon="📍"
          color="var(--accent)"
          items={buckets.today}
          lists={lists}
          onToggle={toggle}
          lang={lang}
        />
      )}
      {buckets.priority.length > 0 && (
        <Bucket
          title={lang === "en" ? "High priority" : "Hohe Priorität"}
          icon="🔥"
          color="var(--amber)"
          items={buckets.priority}
          lists={lists}
          onToggle={toggle}
          lang={lang}
        />
      )}
      {buckets.upcoming.length > 0 && (
        <Bucket
          title={t("planner.upcoming")}
          icon="📅"
          color="var(--text-dim)"
          items={buckets.upcoming.slice(0, 5)}
          lists={lists}
          onToggle={toggle}
          lang={lang}
        />
      )}

      <Link
        href="/dashboard/todos"
        className="btn btn-ghost btn-block"
        style={{ fontSize: 11, marginTop: 8 }}
      >
        {lang === "en" ? "All lists →" : "Alle Listen →"}
      </Link>
    </div>
  );
}

function Bucket({ title, icon, color, items, lists, onToggle, lang }: {
  title: string; icon: string; color: string;
  items: Item[];
  lists: Record<string, ListInfo>;
  onToggle: (i: Item) => void;
  lang: "de" | "en";
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 10, color, letterSpacing: 1.5, fontWeight: 800, textTransform: "uppercase",
        marginBottom: 6,
      }}>
        {icon} {title} <span style={{ color: "var(--text-muted)" }}>· {items.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it) => {
          const list = lists[it.list_id];
          const due = it.due_date ? new Date(it.due_date) : null;
          return (
            <div key={it.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)", borderRadius: 8,
              borderLeft: it.priority > 0 ? `3px solid ${["transparent","#60A5FA","#FFB800","#FF5A6B"][it.priority]}` : `1px solid var(--border)`,
            }}>
              <button
                onClick={() => onToggle(it)}
                style={{
                  width: 22, height: 22, borderRadius: "50%",
                  border: `2px solid var(--border-strong)`,
                  background: "transparent", cursor: "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, wordBreak: "break-word" }}>{it.title}</div>
                {(list || due) && (
                  <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 1, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {list && <span>{list.icon} {list.name}</span>}
                    {due && <span>· {due.toLocaleDateString(lang === "en" ? "en-US" : "de-DE", { day: "2-digit", month: "short" })}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
