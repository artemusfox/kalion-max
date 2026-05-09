"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SPORT_ICONS, SPORT_COLORS, type Sport } from "@/lib/types";
import { sportLabel } from "@/lib/labels";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase-client";
import StreakFlame from "@/components/StreakFlame";
import ActivityFeed from "@/components/ActivityFeed";
import AnimatedNumber from "@/components/AnimatedNumber";
import ScrollHero from "@/components/ScrollHero";
import HabitTracker from "@/components/HabitTracker";
import RoutineChecklist from "@/components/RoutineChecklist";
import DailyPlanner from "@/components/DailyPlanner";
import UserAvatar from "@/components/UserAvatar";
import TrialBanner from "@/components/TrialBanner";
import { readWidgetSettings, readWidgetOrder, ALL_WIDGETS, type WidgetId } from "@/lib/widgets";
import type { ProfileSubscription } from "@/lib/premium";

type Props = {
  displayName: string;
  hour: number;
  xp: number;
  level: number;
  levelProgress: number;
  currentLevelXp: number;
  nextLevelXp: number;
  workoutCount: number;
  prCount: number;
  currentStreak: number;
  bestStreak: number;
  recentWorkouts: any[];
  activePlan: any;
  profileSettings: any;
  avatarUrl?: string | null;
  subscription?: ProfileSubscription | null;
};

const QUOTES_DE = [
  "Stärke kommt durch Konstanz.",
  "Jede Wiederholung bringt dich näher.",
  "Der einzige schlechte Trainingstag ist der, den du aussetzt.",
  "Dein einziger Konkurrent ist die Person von gestern.",
  "Progress over perfection.",
  "Disziplin schlägt Motivation.",
];
const QUOTES_EN = [
  "Strength comes through consistency.",
  "Every rep brings you closer.",
  "The only bad workout is the one you skip.",
  "Your only competitor is yesterday's you.",
  "Progress over perfection.",
  "Discipline beats motivation.",
];
const MONTHS_DE = ["JAN","FEB","MRZ","APR","MAI","JUN","JUL","AUG","SEP","OKT","NOV","DEZ"];
const MONTHS_EN = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

export default function DashboardContent(p: Props) {
  const { t, lang } = useLanguage();
  const [widgets, setWidgets] = useState<Record<WidgetId, boolean>>(() => readWidgetSettings(p.profileSettings));
  const [order, setOrder] = useState<WidgetId[]>(() => readWidgetOrder(p.profileSettings));
  const [editing, setEditing] = useState(false);
  const [dragId, setDragId] = useState<WidgetId | null>(null);

  // Falls Settings sich ändern (z.B. nach Server-Refresh), übernehmen
  useEffect(() => {
    setWidgets(readWidgetSettings(p.profileSettings));
    setOrder(readWidgetOrder(p.profileSettings));
  }, [p.profileSettings]);

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

  function reorder(from: WidgetId, to: WidgetId) {
    if (from === to) return;
    const arr = [...order];
    const fromIdx = arr.indexOf(from);
    const toIdx = arr.indexOf(to);
    if (fromIdx === -1 || toIdx === -1) return;
    arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, from);
    setOrder(arr);
    persistOrder(arr);
  }

  function hide(id: WidgetId) {
    const next = { ...widgets, [id]: false };
    setWidgets(next);
    persistVisibility(next);
  }

  function showAll() {
    const next: Record<WidgetId, boolean> = { ...widgets };
    for (const id of ALL_WIDGETS) next[id] = true;
    setWidgets(next);
    persistVisibility(next);
  }

  const greeting =
    p.hour < 5  ? t("dash.greeting.night") :
    p.hour < 12 ? t("dash.greeting.morning") :
    p.hour < 18 ? t("dash.greeting.day") : t("dash.greeting.evening");

  const quotes = lang === "en" ? QUOTES_EN : QUOTES_DE;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quote = quotes[dayOfYear % quotes.length];
  const months = lang === "en" ? MONTHS_EN : MONTHS_DE;

  const widgetRenderers: Record<WidgetId, () => React.ReactNode> = {
    hero: () => (
      <ScrollHero>
      <div className="card" data-tour="hero" style={{
        background: "linear-gradient(135deg, var(--accent-tint), transparent)",
        borderColor: "var(--accent-border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <UserAvatar avatarUrl={p.avatarUrl} displayName={p.displayName} size={56} ring />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 800 }}>
              {greeting}
            </div>
            <h1 style={{ fontSize: 28, color: "var(--accent)", letterSpacing: -1, marginTop: 2, marginBottom: 0 }}>
              {t("dash.hey")} {p.displayName}! ⚡
            </h1>
          </div>
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: 15, marginBottom: 0 }}>
          &ldquo;{quote}&rdquo;
        </p>
      </div>
      </ScrollHero>
    ),
    active_plan: () => (p.activePlan ? (
        <div className="card" data-tour="active-plan" style={{
          background: `linear-gradient(135deg, ${SPORT_COLORS[p.activePlan.sport as Sport]}15, transparent)`,
          borderColor: `${SPORT_COLORS[p.activePlan.sport as Sport]}30`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 44 }}>{SPORT_ICONS[p.activePlan.sport as Sport]}</div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800, textTransform: "uppercase" }}>
                {t("dash.activeplan")}
              </div>
              <h3 style={{ fontSize: 20, marginTop: 4, marginBottom: 4 }}>{p.activePlan.name}</h3>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                {sportLabel(p.activePlan.sport, lang)} · {p.activePlan.duration_weeks} {t("dash.weeks")}
              </div>
            </div>
            <Link href="/dashboard/training" className="btn btn-primary">{t("dash.start.training")}</Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{t("dash.no.plan")}</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>
            {t("dash.no.plan.desc")}
          </div>
          <Link href="/dashboard/plans" className="btn btn-primary">{t("dash.choose.plan")}</Link>
        </div>
      )),
    routine_morning: () => <RoutineChecklist type="morning" />,
    planner: () => (
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{t("planner.title")}</div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14 }}>{t("planner.desc")}</div>
        <DailyPlanner />
      </div>
    ),
    habits: () => (
      <div className="card" data-tour="habits">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{t("habits.title")}</div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14 }}>{t("habits.desc")}</div>
        <HabitTracker />
      </div>
    ),
    routine_evening: () => <RoutineChecklist type="evening" />,
    activity: () => (
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
          🌍 {lang === "en" ? "Live activity" : "Live-Aktivität"}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14 }}>
          {lang === "en"
            ? "What's happening right now in the community"
            : "Was gerade in der Community passiert"}
        </div>
        <ActivityFeed compact />
      </div>
    ),
    level_stats: () => (
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#0a0a10", fontSize: 24, fontFamily: "var(--font-display)",
            fontWeight: 800, boxShadow: "0 4px 20px var(--accent-glow)",
            flexShrink: 0,
          }}>{p.level}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800, textTransform: "uppercase" }}>{t("dash.level")} {p.level}</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
              <AnimatedNumber value={p.xp} /> {t("dash.xp")}
            </div>
            <div style={{ height: 5, background: "var(--surface)", borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
              <div style={{ height: "100%", background: "var(--accent)", width: `${p.levelProgress * 100}%`, transition: "width 0.4s" }} />
            </div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
              {p.currentLevelXp} / {p.nextLevelXp} {t("dash.xp")}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          <Stat label={t("dash.stat.workouts")} value={p.workoutCount} color="var(--coral)" icon="💪" />
          <StreakStat streak={p.currentStreak} />
          <Stat label={t("dash.stat.best")} value={p.bestStreak} color="var(--amber)" icon="👑" />
          <Stat label={t("dash.stat.records")} value={p.prCount} color="var(--teal)" icon="🏆" />
        </div>
      </div>
    ),
    recent: () => (
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>{t("dash.recent")}</div>
        {p.recentWorkouts && p.recentWorkouts.length > 0 ? (
          p.recentWorkouts.map((w: any) => {
            const d = new Date(w.started_at);
            const mm = w.duration_sec ? Math.floor(w.duration_sec / 60) : null;
            const sportIcon = w.sport ? SPORT_ICONS[w.sport as Sport] : "💪";
            return (
              <div key={w.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 0", borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ width: 48, textAlign: "center", padding: 8, background: "var(--bg-elevated)", borderRadius: 10 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>{d.getDate()}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1 }}>
                    {months[d.getMonth()]}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{sportIcon} {w.day_name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    {w.completed_sets}/{w.total_sets} {t("dash.sets")} · {w.total_reps || 0} {t("dash.reps")}{mm !== null ? ` · ${mm}min` : ""}
                  </div>
                </div>
                <div style={{ fontSize: 20 }}>{w.completed_sets === w.total_sets ? "✅" : "⚡"}</div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏋️</div>
            <div style={{ fontSize: 13 }}>{t("dash.recent.empty")}</div>
          </div>
        )}
      </div>
    ),
    features: () => (
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>{t("dash.features")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <FeatureLink href="/dashboard/plans"     icon="📋" label={t("dash.feat.plans")}     desc={t("dash.feat.plans.desc")} />
          <FeatureLink href="/dashboard/progress"  icon="📊" label={t("dash.feat.stats")}     desc={t("dash.feat.stats.desc")} />
          <FeatureLink href="/dashboard/body"      icon="📏" label={t("dash.feat.body")}      desc={t("dash.feat.body.desc")} />
          <FeatureLink href="/dashboard/nutrition" icon="🥗" label={t("dash.feat.nutrition")} desc={t("dash.feat.nutrition.desc")} />
          <FeatureLink href="/dashboard/goals"     icon="🎯" label={t("dash.feat.goals")}     desc={t("dash.feat.goals.desc")} />
        </div>
      </div>
    ),
  };

  const visibleCount = order.filter((id) => widgets[id]).length;
  const hasHidden = order.some((id) => !widgets[id]);

  return (
    <div className={editing ? "" : "kalion-stagger"}>
      <TrialBanner profile={p.subscription || null} />

      {/* Edit-Toolbar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 14, gap: 8, flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>
          {editing
            ? (lang === "en" ? "Drag cards to reorder · tap × to hide" : "Karten ziehen zum Sortieren · × zum Ausblenden")
            : `${visibleCount} ${lang === "en" ? "modules" : "Module"}`}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {editing && hasHidden && (
            <button onClick={showAll} className="btn btn-ghost" style={{ fontSize: 11, padding: "5px 10px" }}>
              ↻ {lang === "en" ? "Show all" : "Alle zeigen"}
            </button>
          )}
          <button
            onClick={() => setEditing((s) => !s)}
            className="btn btn-ghost"
            style={{
              fontSize: 11, padding: "5px 12px",
              border: editing ? "1px solid var(--accent)" : "1px solid var(--border)",
              color: editing ? "var(--accent)" : "var(--text-dim)",
              background: editing ? "var(--accent-tint)" : "transparent",
            }}
          >
            {editing
              ? `✓ ${lang === "en" ? "Done" : "Fertig"}`
              : `✏ ${lang === "en" ? "Edit" : "Bearbeiten"}`}
          </button>
        </div>
      </div>

      {/* Widget-Liste */}
      {order.map((id) => {
        if (!widgets[id]) return null;
        const render = widgetRenderers[id];
        if (!render) return null;
        const dragging = dragId === id;
        return (
          <div
            key={id}
            draggable={editing}
            onDragStart={(e) => { if (editing) { setDragId(id); e.dataTransfer.effectAllowed = "move"; } }}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => { if (editing && dragId && dragId !== id) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; } }}
            onDrop={(e) => {
              if (!editing || !dragId || dragId === id) return;
              e.preventDefault();
              reorder(dragId, id);
              setDragId(null);
            }}
            style={{
              position: "relative",
              opacity: dragging ? 0.4 : 1,
              cursor: editing ? "grab" : "default",
              transition: "opacity 0.15s",
            }}
          >
            {render()}
            {editing && (
              <>
                {/* Drag-Handle (links oben) */}
                <div style={{
                  position: "absolute", top: 8, left: 8, zIndex: 5,
                  width: 32, height: 32, borderRadius: 8,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--accent)",
                  color: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, pointerEvents: "none",
                }}>⋮⋮</div>
                {/* Hide-Button (rechts oben) */}
                <button
                  onClick={() => hide(id)}
                  aria-label="Hide widget"
                  style={{
                    position: "absolute", top: 8, right: 8, zIndex: 5,
                    width: 32, height: 32, borderRadius: 8,
                    background: "var(--bg-elevated)",
                    border: "1px solid rgba(255,90,107,0.4)",
                    color: "var(--red)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800,
                  }}
                >×</button>
              </>
            )}
          </div>
        );
      })}

      {/* Wenn alles ausgeblendet ist: Einladung zum Reaktivieren */}
      {visibleCount === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🪄</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            {lang === "en" ? "All modules hidden" : "Alle Module ausgeblendet"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
            {lang === "en"
              ? "Activate edit mode and tap 'Show all' to bring them back."
              : "Aktiviere Bearbeiten und tippe auf 'Alle zeigen'."}
          </div>
          <button onClick={() => { setEditing(true); showAll(); }} className="btn btn-primary">
            {lang === "en" ? "↻ Show all" : "↻ Alle zeigen"}
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <div style={{ padding: 14, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12 }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </div>
    </div>
  );
}

function StreakStat({ streak }: { streak: number }) {
  const { t } = useLanguage();
  const label =
    streak === 0    ? t("dash.streak.out") :
    streak < 4      ? t("dash.streak.ember") :
    streak < 14     ? t("dash.streak.flame") :
    streak < 30     ? t("dash.streak.blaze") :
    streak < 100    ? t("dash.streak.inferno") : t("dash.streak.supernova");
  return (
    <div style={{
      padding: 14, background: "var(--bg-elevated)", border: "1px solid var(--border)",
      borderRadius: 12, display: "flex", alignItems: "center", gap: 12,
    }}>
      <StreakFlame streak={streak} size={48} />
      <div>
        <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>
          {t("dash.stat.streak")}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function FeatureLink({ href, icon, label, desc }: { href: string; icon: string; label: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{
        padding: 14, background: "var(--bg-elevated)", borderRadius: 12,
        border: "1px solid var(--border)", cursor: "pointer", height: "100%",
      }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4 }}>{desc}</div>
      </div>
    </Link>
  );
}
