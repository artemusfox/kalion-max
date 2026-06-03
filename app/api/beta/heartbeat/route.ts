// Vercel-Cron-Endpoint: hält ~8 Beta-User permanent "online"
// Cron-Konfiguration in vercel.json: alle 4 Minuten
// Schutz: CRON_SECRET-Header muss passen

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const ACTIVE_COUNT = 8;

export async function GET(req: Request) {
  // Vercel Cron schickt Authorization: Bearer ${CRON_SECRET}
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Missing env" }, { status: 500 });
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: betas, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("is_beta", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!betas || betas.length === 0) {
    return NextResponse.json({ updated: 0, message: "no beta users" });
  }

  const shuffled = [...betas].sort(() => Math.random() - 0.5);
  const active = shuffled.slice(0, Math.min(ACTIVE_COUNT, shuffled.length));
  const ids = active.map((u: any) => u.id);

  const { error: updErr } = await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .in("id", ids);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({
    updated: ids.length,
    timestamp: new Date().toISOString(),
  });
}
