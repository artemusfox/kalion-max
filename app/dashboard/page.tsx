import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { SPORT_LABELS, SPORT_ICONS, SPORT_COLORS, levelFromXp, type Sport } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
  const { count: workoutCount } = await supabase.from("workouts").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
  const { data: recentWorkouts } = await supabase.from("workouts").select("*")
    .eq("user_id", user!.id).order("started_at", { ascending: false }).limit(3);
  const { count: prCount } = await supabase.from("personal_records").select("*", { count: "exact", head: true }).eq("user_id", user!.id);

  let activePlan = null;
  if (profile?.active_plan_id) {
    const { data } = await supabase.from("user_plans").select("*").eq("id", profile.active_plan_id).single();
    activePlan = data;
  }

  const displayName = profile?.display_name || "Athlete";
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Nachtschicht" : hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
  const xp = profile?.xp || 0;
  const levelInfo = levelFromXp(xp);

  // Quotes
  const quotes = [
    "Stärke kommt durch Konstanz.",
    "Jede Wiederholung bringt dich näher.",
    "Der einzige schlechte Trainingstag ist der, den du aussetzt.",
    "Dein einziger Konkurrent ist die Person von gestern.",
    "Progress over perfection.",
    "Disziplin schlägt Motivation.",
  ];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quote = quotes[dayOfYear % quotes.length];

  return (
    <div>
      {/* Hero greeting */}
      <div className="card" style={{
        background: "linear-gradient(135deg, var(--accent-tint), transparent)",
        borderColor: "var(--accent-border)",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 800, marginBottom: 6 }}>
          {greeting}
        </div>
        <h1 style={{ fontSize: 32, fontStyle: "italic", color: "var(--accent)", marginBottom: 10, letterSpacing: -1 }}>
          Hey, {displayName}! ⚡
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: 15, marginBottom: 0, fontStyle: "italic" }}>
          "{quote}"
        </p>
      </div>

      {/* Active plan */}
      {activePlan ? (
        <div className="card" style={{
          background: `linear-gradient(135deg, ${SPORT_COLORS[activePlan.sport as Sport]}15, transparent)`,
          borderColor: `${SPORT_COLORS[activePlan.sport as Sport]}30`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 44 }}>{SPORT_ICONS[activePlan.sport as Sport]}</div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800, textTransform: "uppercase" }}>
                Aktiver Plan
              </div>
              <h3 style={{ fontSize: 20, fontStyle: "italic", marginTop: 4, marginBottom: 4 }}>{activePlan.name}</h3>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                {SPORT_LABELS[activePlan.sport as Sport]} · {activePlan.duration_weeks} Wochen
              </div>
            </div>
            <Link href="/dashboard/training" className="btn btn-primary">▶ Training starten</Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Kein aktiver Plan</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>
            Wähle eine Vorlage oder erstelle deinen eigenen Trainingsplan.
          </div>
          <Link href="/dashboard/plans" className="btn btn-primary">Plan auswählen →</Link>
        </div>
      )}

      {/* Level + Stats */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#0a0a10", fontSize: 24, fontFamily: "var(--font-display)",
            fontStyle: "italic", fontWeight: 800, boxShadow: "0 4px 20px var(--accent-glow)",
            flexShrink: 0,
          }}>{levelInfo.level}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800, textTransform: "uppercase" }}>Level {levelInfo.level}</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{xp} XP</div>
            <div style={{ height: 5, background: "var(--surface)", borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
              <div style={{ height: "100%", background: "var(--accent)", width: `${levelInfo.progress * 100}%`, transition: "width 0.4s" }} />
            </div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
              {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          <Stat label="Workouts" value={workoutCount || 0} color="var(--coral)" icon="💪" />
          <Stat label="Streak" value={profile?.current_streak || 0} color="var(--red)" icon="🔥" />
          <Stat label="Best" value={profile?.best_streak || 0} color="var(--amber)" icon="👑" />
          <Stat label="Records" value={prCount || 0} color="var(--teal)" icon="🏆" />
        </div>
      </div>

      {/* Recent workouts */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>📋 Letzte Workouts</div>
        {recentWorkouts && recentWorkouts.length > 0 ? (
          recentWorkouts.map((w: any) => {
            const d = new Date(w.started_at);
            const mm = w.duration_sec ? Math.floor(w.duration_sec / 60) : null;
            const sportIcon = w.sport ? SPORT_ICONS[w.sport as Sport] : "💪";
            return (
              <div key={w.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 0", borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ width: 48, textAlign: "center", padding: 8, background: "var(--bg-elevated)", borderRadius: 10 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 18, fontWeight: 800 }}>{d.getDate()}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1 }}>
                    {["JAN","FEB","MRZ","APR","MAI","JUN","JUL","AUG","SEP","OKT","NOV","DEZ"][d.getMonth()]}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{sportIcon} {w.day_name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    {w.completed_sets}/{w.total_sets} Sätze · {w.total_reps || 0} Wdh.{mm !== null ? ` · ${mm}min` : ""}
                  </div>
                </div>
                <div style={{ fontSize: 20 }}>{w.completed_sets === w.total_sets ? "✅" : "⚡"}</div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏋️</div>
            <div style={{ fontSize: 13 }}>Noch keine Workouts — starte dein erstes!</div>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>✨ Features</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <FeatureLink href="/dashboard/plans" icon="📋" label="Pläne" desc="Templates + eigene Pläne" />
          <FeatureLink href="/dashboard/progress" icon="📊" label="Stats & Tools" desc="PRs, 1RM, Recovery" />
          <FeatureLink href="/dashboard/body" icon="📏" label="Körpermaße" desc="Gewicht, Umfänge, Fotos" />
          <FeatureLink href="/dashboard/nutrition" icon="🥗" label="Ernährung" desc="Mahlzeiten, Supplements, Wasser" />
          <FeatureLink href="/dashboard/goals" icon="🎯" label="Ziele" desc="Challenges & Badges" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color, icon }: any) {
  return (
    <div style={{ padding: 14, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12 }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function FeatureLink({ href, icon, label, desc }: any) {
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
