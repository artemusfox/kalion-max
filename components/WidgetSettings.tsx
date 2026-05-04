"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/components/LanguageProvider";
import { ALL_WIDGETS, DEFAULT_WIDGETS, readWidgetSettings, type WidgetId } from "@/lib/widgets";
import type { TKey } from "@/lib/i18n";

const ICONS: Record<WidgetId, string> = {
  hero: "👋",
  activity: "🌍",
  active_plan: "📋",
  routine_morning: "🌅",
  habits: "✅",
  routine_evening: "🌙",
  level_stats: "⭐",
  recent: "💪",
  features: "✨",
};

const T_KEYS: Record<WidgetId, TKey> = {
  hero: "widget.hero",
  activity: "widget.activity",
  active_plan: "widget.active_plan",
  routine_morning: "widget.routine_morning",
  habits: "widget.habits",
  routine_evening: "widget.routine_evening",
  level_stats: "widget.level_stats",
  recent: "widget.recent",
  features: "widget.features",
};

export default function WidgetSettings() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [widgets, setWidgets] = useState<Record<WidgetId, boolean>>(DEFAULT_WIDGETS);
  const [order, setOrder] = useState<WidgetId[]>([...ALL_WIDGETS]);
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<WidgetId | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase.from("profiles").select("settings").single();
      setWidgets(readWidgetSettings(data?.settings));
      const storedOrder = data?.settings?.dashboard_widgets_order as WidgetId[] | undefined;
      if (Array.isArray(storedOrder) && storedOrder.length > 0) {
        // Stelle sicher, dass alle vorhandenen Widgets in der Order sind (für neue Widget-IDs)
        const known = new Set<WidgetId>(storedOrder.filter((w) => ALL_WIDGETS.includes(w)));
        const missing = ALL_WIDGETS.filter((w) => !known.has(w));
        setOrder([...storedOrder.filter((w) => ALL_WIDGETS.includes(w)), ...missing]);
      }
    })();
  }, []);

  async function persistOrder(nextOrder: WidgetId[]) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: prof } = await supabase.from("profiles").select("settings").single();
    const settings = { ...(prof?.settings || {}), dashboard_widgets_order: nextOrder };
    await supabase.from("profiles").update({ settings }).eq("id", user.id);
  }

  async function persistVisibility(next: Record<WidgetId, boolean>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: prof } = await supabase.from("profiles").select("settings").single();
    const settings = { ...(prof?.settings || {}), dashboard_widgets: next };
    await supabase.from("profiles").update({ settings }).eq("id", user.id);
  }

  async function toggle(id: WidgetId) {
    const next = { ...widgets, [id]: !widgets[id] };
    setWidgets(next);
    setBusy(true);
    await persistVisibility(next);
    setBusy(false);
  }

  async function reset() {
    setWidgets(DEFAULT_WIDGETS);
    setOrder([...ALL_WIDGETS]);
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from("profiles").select("settings").single();
      const settings = {
        ...(prof?.settings || {}),
        dashboard_widgets: DEFAULT_WIDGETS,
        dashboard_widgets_order: ALL_WIDGETS,
      };
      await supabase.from("profiles").update({ settings }).eq("id", user.id);
    }
    setBusy(false);
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const arr = [...order];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setOrder(arr);
    persistOrder(arr);
  }

  function moveUp(idx: number) { if (idx > 0) reorder(idx, idx - 1); }
  function moveDown(idx: number) { if (idx < order.length - 1) reorder(idx, idx + 1); }

  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
        {lang === "en"
          ? "Drag to reorder · tap toggle to show/hide · ↑↓ buttons for keyboard"
          : "Ziehen zum Sortieren · Tippen schaltet ein/aus · ↑↓ für Tastatur"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {order.map((id, idx) => {
          const on = widgets[id];
          const dragging = dragId === id;
          return (
            <div
              key={id}
              draggable
              onDragStart={(e) => { setDragId(id); e.dataTransfer.effectAllowed = "move"; }}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
              onDrop={(e) => {
                e.preventDefault();
                if (!dragId || dragId === id) return;
                const fromIdx = order.indexOf(dragId);
                const toIdx = order.indexOf(id);
                reorder(fromIdx, toIdx);
                setDragId(null);
              }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                background: on ? "var(--accent-tint)" : "var(--bg-elevated)",
                border: `1px solid ${on ? "var(--accent-border)" : "var(--border)"}`,
                borderRadius: 10,
                opacity: dragging ? 0.4 : 1,
                cursor: "grab",
                transition: "all 0.15s",
              }}
            >
              {/* Drag-Handle */}
              <span style={{
                color: "var(--text-muted)", fontSize: 18,
                cursor: "grab", flexShrink: 0,
              }} aria-hidden>⋮⋮</span>

              <span style={{ fontSize: 22, flexShrink: 0 }}>{ICONS[id]}</span>

              <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>
                {t(T_KEYS[id])}
              </span>

              {/* Up/Down Buttons (Keyboard-Fallback) */}
              <button
                onClick={() => moveUp(idx)}
                disabled={idx === 0 || busy}
                aria-label="Move up"
                style={btnArrow(idx === 0)}
              >↑</button>
              <button
                onClick={() => moveDown(idx)}
                disabled={idx === order.length - 1 || busy}
                aria-label="Move down"
                style={btnArrow(idx === order.length - 1)}
              >↓</button>

              {/* Toggle */}
              <button
                onClick={() => toggle(id)}
                aria-label={on ? "Hide" : "Show"}
                style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: on ? "var(--accent)" : "var(--surface-2)",
                  border: "none", padding: 0, cursor: "pointer",
                  position: "relative", flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                <span style={{
                  position: "absolute",
                  width: 14, height: 14, borderRadius: "50%",
                  background: "white",
                  top: 3, left: on ? 19 : 3,
                  transition: "left 0.2s",
                }} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={reset}
        disabled={busy}
        className="btn btn-ghost"
        style={{ marginTop: 12, width: "100%", fontSize: 11 }}
      >↻ Reset</button>
    </div>
  );
}

function btnArrow(disabled: boolean): React.CSSProperties {
  return {
    width: 24, height: 24, padding: 0,
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer",
    color: disabled ? "var(--text-muted)" : "var(--text)",
    opacity: disabled ? 0.4 : 1,
    fontSize: 11, fontWeight: 800,
    flexShrink: 0,
  };
}
