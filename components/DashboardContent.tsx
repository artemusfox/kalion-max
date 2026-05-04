"use client";

import Link from "next/link";
import { SPORT_ICONS, SPORT_COLORS, type Sport } from "@/lib/types";
import { sportLabel } from "@/lib/labels";
import { useLanguage } from "@/components/LanguageProvider";
import StreakFlame from "@/components/StreakFlame";
import ActivityFeed from "@/components/ActivityFeed";
import HabitTracker from "@/components/HabitTracker";
import RoutineChecklist from "@/components/RoutineChecklist";
import { readWidgetSettings, type WidgetId } from "@/lib/widgets";

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
  const widgets = readWidgetSettings(p.profileSettings);
  const show = (id: WidgetId) => widgets[id];

  const greeting =
    p.hour < 5  ? t("dash.greeting.night") :
    p.hour < 12 ? t("dash.greeting.morning") :
    p.hour < 18 ? t("dash.greeting.day") : t("dash.greeting.evening");

  const quotes = lang === "en" ? QUOTES_EN : QUOTES_DE;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quote = quotes[dayOfYear % quotes.length];
  const months = lang === "en" ? MONTHS_EN : MONTHS_DE;

  return (
    <div>
      {show("hero") && (
      <div className="card" style={{
        background: "linear-gradient(135deg, var(--accent-tint), transparent)",
        borderColor: "var(--accent-border)",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 800, marginBottom: 6 }}>
          {greeting}
        </div>
        <h1 style={{ fontSize: 32, color: "var(--accent)", marginBottom: 10, letterSpacing: -1 }}>
          {t("dash.hey")} {p.displayName}! ⚡
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: 15, marginBottom: 0 }}>
          &ldquo;{quote}&rdquo;
        </p>
      </div>
      )}

      {show("active_plan") && (p.activePlan ? (
        <div className="card" style={{
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
      ))}

      {show("routine_morning") && <RoutineChecklist type="morning" />}

      {show("habits") && (
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{t("habits.title")}</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14 }}>{t("habits.desc")}</div>
          <HabitTracker />
        </div>
      )}

      {show("routine_evening") && <RoutineChecklist type="evening" />}

      {show("activity") && (
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
      )}

      {show("level_stats") && (
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
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{p.xp} {t("dash.xp")}</div>
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
      )}

      {show("recent") && (
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
      )}

      {show("features") && (
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
      )}
    </div>
  );
}

function Stat({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <div style={{ padding: 14, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12 }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, marginTop: 4 }}>{value}</div>
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
