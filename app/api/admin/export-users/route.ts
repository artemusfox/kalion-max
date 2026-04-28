import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) return new NextResponse("Forbidden", { status: 403 });

  await supabase.rpc("log_admin_action", { p_action: "export_users_csv", p_target_user_id: null, p_details: {} });

  const [{ data: profiles }, { data: emails }, { data: workouts }] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.rpc("admin_user_emails"),
    supabase.from("workouts").select("user_id"),
  ]);

  const emailMap: Record<string, any> = {};
  for (const e of (emails || []) as any[]) emailMap[e.id] = e;
  const wcount: Record<string, number> = {};
  for (const w of (workouts || []) as any[]) wcount[w.user_id] = (wcount[w.user_id] || 0) + 1;

  const header = ["id","email","display_name","is_admin","created_at","last_sign_in_at","workouts","current_streak","best_streak","xp","level"];
  const rows = (profiles || []).map((p: any) => {
    const e = emailMap[p.id] || {};
    return [
      p.id,
      e.email || "",
      p.display_name || "",
      p.is_admin ? "1" : "0",
      e.created_at || "",
      e.last_sign_in_at || "",
      wcount[p.id] || 0,
      p.current_streak || 0,
      p.best_streak || 0,
      p.xp || 0,
      p.level || 1,
    ].map(csvEscape).join(",");
  });
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kalion-users-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}

function csvEscape(v: any): string {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
