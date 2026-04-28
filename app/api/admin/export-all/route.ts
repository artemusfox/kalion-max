import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) return new NextResponse("Forbidden", { status: 403 });

  await supabase.rpc("log_admin_action", { p_action: "export_database", p_target_user_id: null, p_details: {} });

  const tables = [
    "profiles", "custom_exercises", "user_plans", "workouts",
    "personal_records", "body_measurements", "progress_photos",
    "goals", "user_badges", "nutrition_logs", "foods",
    "meal_entries", "supplements", "supplement_logs", "admin_audit_log",
  ];

  const dump: Record<string, any[]> = {};
  for (const t of tables) {
    const { data } = await supabase.from(t).select("*");
    dump[t] = data || [];
  }
  const { data: emails } = await supabase.rpc("admin_user_emails");
  dump["auth_users_summary"] = (emails || []) as any[];

  const bundle = {
    exported_at: new Date().toISOString(),
    exported_by: user.email,
    schema_version: "1.0",
    counts: Object.fromEntries(Object.entries(dump).map(([k, v]) => [k, v.length])),
    data: dump,
  };

  return new NextResponse(JSON.stringify(bundle, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="kalion-database-${new Date().toISOString().slice(0,10)}.json"`,
    },
  });
}
