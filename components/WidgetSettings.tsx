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
  const { t } = useLanguage();
  const { toast } = useToast();
  const [widgets, setWidgets] = useState<Record<WidgetId, boolean>>(DEFAULT_WIDGETS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase.from("profiles").select("settings").single();
      setWidgets(readWidgetSettings(data?.settings));
    })();
  }, []);

  async function toggle(id: WidgetId) {
    const next = { ...widgets, [id]: !widgets[id] };
    setWidgets(next);
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const { data: prof } = await supabase.from("profiles").select("settings").single();
    const settings = { ...(prof?.settings || {}), dashboard_widgets: next };
    await supabase.from("profiles").update({ settings }).eq("id", user.id);
    setBusy(false);
  }

  async function reset() {
    setWidgets(DEFAULT_WIDGETS);
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const { data: prof } = await supabase.from("profiles").select("settings").single();
    const settings = { ...(prof?.settings || {}), dashboard_widgets: DEFAULT_WIDGETS };
    await supabase.from("profiles").update({ settings }).eq("id", user.id);
    setBusy(false);
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {ALL_WIDGETS.map((id) => {
          const on = widgets[id];
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              disabled={busy}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px",
                background: on ? "var(--accent-tint)" : "var(--bg-elevated)",
                border: `1px solid ${on ? "var(--accent-border)" : "var(--border)"}`,
                borderRadius: 10, cursor: "pointer",
                fontFamily: "inherit", textAlign: "left", color: "var(--text)",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{ICONS[id]}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{t(T_KEYS[id])}</span>
              <span style={{
                width: 36, height: 20, borderRadius: 10,
                background: on ? "var(--accent)" : "var(--surface-2)",
                position: "relative", flexShrink: 0,
                transition: "background 0.2s",
              }}>
                <span style={{
                  position: "absolute",
                  width: 14, height: 14, borderRadius: "50%",
                  background: "white",
                  top: 3, left: on ? 19 : 3,
                  transition: "left 0.2s",
                }} />
              </span>
            </button>
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
