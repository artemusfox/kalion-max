import { createClient } from "@/lib/supabase-server";
import { levelFromXp } from "@/lib/types";
import DashboardContent from "@/components/DashboardContent";

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

  const xp = profile?.xp || 0;
  const levelInfo = levelFromXp(xp);

  return (
    <DashboardContent
      displayName={profile?.display_name || "Athlete"}
      hour={new Date().getHours()}
      xp={xp}
      level={levelInfo.level}
      levelProgress={levelInfo.progress}
      currentLevelXp={levelInfo.currentLevelXp}
      nextLevelXp={levelInfo.nextLevelXp}
      workoutCount={workoutCount || 0}
      prCount={prCount || 0}
      currentStreak={profile?.current_streak || 0}
      bestStreak={profile?.best_streak || 0}
      recentWorkouts={recentWorkouts || []}
      activePlan={activePlan}
    />
  );
}
