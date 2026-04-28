import { createClient } from "@/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) return new NextResponse("Forbidden", { status: 403 });

  const targetId = req.nextUrl.searchParams.get("id");
  if (!targetId) return new NextResponse("Missing id", { status: 400 });

  // Audit-Log
  await supabase.rpc("log_admin_action", {
    p_action: "export_user",
    p_target_user_id: targetId,
    p_details: {},
  });

  const [
    { data: profile },
    { data: emails },
    { data: workouts },
    { data: prs },
    { data: measurements },
    { data: photos },
    { data: plans },
    { data: customExercises },
    { data: goals },
    { data: badges },
    { data: nutrition },
    { data: foods },
    { data: meals },
    { data: supplements },
    { data: supplementLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", targetId).single(),
    supabase.rpc("admin_user_emails"),
    supabase.from("workouts").select("*").eq("user_id", targetId),
    supabase.from("personal_records").select("*").eq("user_id", targetId),
    supabase.from("body_measurements").select("*").eq("user_id", targetId),
    supabase.from("progress_photos").select("*").eq("user_id", targetId),
    supabase.from("user_plans").select("*").eq("user_id", targetId),
    supabase.from("custom_exercises").select("*").eq("user_id", targetId),
    supabase.from("goals").select("*").eq("user_id", targetId),
    supabase.from("user_badges").select("*").eq("user_id", targetId),
    supabase.from("nutrition_logs").select("*").eq("user_id", targetId),
    supabase.from("foods").select("*").eq("user_id", targetId),
    supabase.from("meal_entries").select("*").eq("user_id", targetId),
    supabase.from("supplements").select("*").eq("user_id", targetId),
    supabase.from("supplement_logs").select("*").eq("user_id", targetId),
  ]);

  const userMeta = ((emails || []) as any[]).find((e) => e.id === targetId);

  const bundle = {
    exported_at: new Date().toISOString(),
    exported_by: user.email,
    user: { ...profile, email: userMeta?.email, created_at: userMeta?.created_at, last_sign_in_at: userMeta?.last_sign_in_at },
    workouts, personal_records: prs, body_measurements: measurements, progress_photos: photos,
    user_plans: plans, custom_exercises: customExercises, goals, user_badges: badges,
    nutrition_logs: nutrition, foods, meal_entries: meals, supplements, supplement_logs: supplementLogs,
  };

  const filename = `kalion-user-${userMeta?.email || targetId}-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(bundle, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
