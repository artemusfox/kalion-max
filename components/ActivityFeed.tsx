"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/components/LanguageProvider";
import { sportLabel } from "@/lib/labels";
import { flagEmoji } from "@/lib/countries";
import { SPORT_ICONS, type Sport } from "@/lib/types";

const REFRESH_MS = 60_000;

type Stats = {
  workouts_today: number;
  prs_today: number;
  new_users_week: number;
  active_streaks: number;
  total_volume_today: number;
  online_now: number;
};

type Event = {
  event_type: "workout" | "pr" | "signup";
  country: string | null;
  sport: string | null;
  exercise_name: string | null;
  value: number | null;
  unit: string | null;
  occurred_at: string;
};

export default function ActivityFeed({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [feed, setFeed] = useState<Event[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const [{ data: s }, { data: f }] = await Promise.all([
        supabase.rpc("get_global_activity_stats"),
        supabase.rpc("get_global_activity_feed", { p_limit: compact ? 5 : 10 }),
      ]);
      if (cancelled) return;
      const row = Array.isArray(s) && s[0] ? s[0] : null;
      if (row) {
        setStats({
          workouts_today: Number(row.workouts_today) || 0,
          prs_today: Number(row.prs_today) || 0,
          new_users_week: Number(row.new_users_week) || 0,
          active_streaks: Number(row.active_streaks) || 0,
          total_volume_today: Number(row.total_volume_today) || 0,
          online_now: Number(row.online_now) || 0,
        });
      }
      setFeed((f as Event[]) || []);
    }
    load();
    const iv = setInterval(load, REFRESH_MS);
    return () => { cancelled = true; clearInterval(iv); };
  }, [compact]);

  if (!stats || !feed) {
    return <div style={{ padding: 30, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  }

  return (
    <div>
      {/* Stats-Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
        gap: 8, marginBottom: 14,
      }}>
        <Pulse label={lang === "en" ? "Workouts today" : "Workouts heute"} value={stats.workouts_today} icon="💪" color="var(--coral)" />
        <Pulse label={lang === "en" ? "PRs today" : "PRs heute"}             value={stats.prs_today}      icon="🏆" color="var(--amber)" />
        <Pulse label={lang === "en" ? "Online now" : "Gerade online"}        value={stats.online_now}     icon="🟢" color="var(--green)" pulse />
        <Pulse label={lang === "en" ? "On streak ≥7" : "Streak ≥7"}          value={stats.active_streaks} icon="🔥" color="var(--red)" />
        {stats.total_volume_today > 0 && (
          <Pulse
            label={lang === "en" ? "Volume today" : "Volumen heute"}
            value={`${(stats.total_volume_today / 1000).toFixed(1)}t`}
            icon="🏋️" color="var(--accent)"
          />
        )}
        <Pulse label={lang === "en" ? "New this week" : "Neu diese Woche"}   value={stats.new_users_week} icon="✨" color="var(--purple)" />
      </div>

      {/* Live-Feed */}
      {feed.length === 0 ? (
        <div style={{
          padding: 24, textAlign: "center", color: "var(--text-muted)",
          background: "var(--bg-elevated)", borderRadius: 10, border: "1px dashed var(--border)",
          fontSize: 12,
        }}>
          {lang === "en" ? "No activity in the last 24h yet — be the first!" : "Letzte 24h ruhig — sei der erste!"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {feed.map((e, i) => (
            <FeedRow key={`${e.event_type}-${e.occurred_at}-${i}`} event={e} lang={lang} />
          ))}
        </div>
      )}

      <div style={{
        marginTop: 10, fontSize: 10, color: "var(--text-muted)",
        textAlign: "center", lineHeight: 1.5,
      }}>
        {lang === "en"
          ? "Anonymized · auto-refresh every 60s · last 24h"
          : "Anonymisiert · Auto-Refresh alle 60s · letzte 24h"}
      </div>
    </div>
  );
}

function Pulse({ label, value, icon, color, pulse }: {
  label: string; value: number | string; icon: string; color: string; pulse?: boolean;
}) {
  return (
    <div style={{
      padding: "10px 12px",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      position: "relative",
      overflow: "hidden",
    }}>
      {pulse && (
        <>
          <style>{`
            @keyframes kalion-feed-pulse {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50%      { opacity: 0.6; transform: scale(1.4); }
            }
          `}</style>
          <div style={{
            position: "absolute", top: 8, right: 8,
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--green)",
            animation: "kalion-feed-pulse 2s ease-in-out infinite",
          }} />
        </>
      )}
      <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
      <div style={{
        fontSize: 9, color: "var(--text-muted)", letterSpacing: 1.2,
        fontWeight: 800, textTransform: "uppercase",
      }}>{label}</div>
      <div style={{
        fontSize: 20, fontWeight: 800, color, lineHeight: 1, marginTop: 3,
        fontVariantNumeric: "tabular-nums",
      }}>{value}</div>
    </div>
  );
}

function FeedRow({ event, lang }: { event: Event; lang: "de" | "en" }) {
  const ago = timeAgo(new Date(event.occurred_at), lang);
  const flag = event.country ? flagEmoji(event.country) : "🌍";

  let icon = "💪";
  let text = "";
  let color = "var(--text)";

  if (event.event_type === "workout") {
    icon = event.sport ? (SPORT_ICONS[event.sport as Sport] || "💪") : "💪";
    const sportName = event.sport ? sportLabel(event.sport as Sport, lang) : "";
    text = lang === "en"
      ? `Athlete completed ${event.exercise_name || "a workout"}${sportName ? ` (${sportName})` : ""}`
      : `Athlet hat ${event.exercise_name || "ein Workout"}${sportName ? ` (${sportName})` : ""} abgeschlossen`;
  } else if (event.event_type === "pr") {
    icon = "🏆";
    color = "var(--amber)";
    const valueStr = event.value && event.unit ? ` — ${event.value} ${event.unit}` : "";
    text = lang === "en"
      ? `New PR: ${event.exercise_name || "exercise"}${valueStr}`
      : `Neuer PR: ${event.exercise_name || "Übung"}${valueStr}`;
  } else if (event.event_type === "signup") {
    icon = "✨";
    color = "var(--accent)";
    text = lang === "en"
      ? "New athlete joined the community"
      : "Neuer Athlet ist beigetreten";
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      fontSize: 12,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 16, flexShrink: 0 }} title={event.country || ""}>{flag}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color, fontWeight: 700,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{text}</div>
      </div>
      <span style={{
        fontSize: 10, color: "var(--text-muted)",
        fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0,
      }}>{ago}</span>
    </div>
  );
}

function timeAgo(date: Date, lang: "de" | "en"): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return lang === "en" ? `${sec}s ago` : `vor ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return lang === "en" ? `${min}m ago` : `vor ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return lang === "en" ? `${h}h ago` : `vor ${h}h`;
  const d = Math.floor(h / 24);
  return lang === "en" ? `${d}d ago` : `vor ${d}T`;
}
