/**
 * KALION MAX — Beta-User Live-Presence Heartbeat
 *
 * Hält per Cron eine rotierende Auswahl von Beta-Usern "online".
 * Damit ist im Community-Feed/Dashboard immer mindestens 1 User
 * "online jetzt" sichtbar.
 *
 * AUSFÜHRUNG (lokal als Test):
 *   npx tsx scripts/beta-heartbeat.ts
 *
 * AUSFÜHRUNG (production):
 *   Vercel-Cron alle 4 Minuten an /api/beta/heartbeat
 *   ODER manuell ab und zu, ODER ein eigener Cron auf irgendeinem Server.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Wie viele Beta-User sollen "jetzt" online sein?
const ACTIVE_COUNT = 8;

export async function runHeartbeat() {
  // Alle Beta-User IDs holen
  const { data: betas, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("is_beta", true);

  if (error) throw error;
  if (!betas || betas.length === 0) {
    console.log("Keine Beta-User gefunden");
    return { updated: 0 };
  }

  // Zufällige Auswahl
  const shuffled = [...betas].sort(() => Math.random() - 0.5);
  const active = shuffled.slice(0, Math.min(ACTIVE_COUNT, shuffled.length));
  const ids = active.map((u) => u.id);

  // Alle markierten User auf last_seen_at = jetzt setzen
  const { error: updErr } = await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .in("id", ids);

  if (updErr) throw updErr;

  console.log(`✓ ${ids.length} Beta-User auf "online jetzt" gesetzt:`);
  for (const u of active) console.log(`  · ${u.display_name}`);
  return { updated: ids.length, names: active.map((u) => u.display_name) };
}

// Direct execution
if (require.main === module) {
  runHeartbeat()
    .then((r) => console.log("\nDone:", r))
    .catch((e) => { console.error("✗", e); process.exit(1); });
}
