/**
 * KALION MAX — Seed-Script für 20 Beta-User
 *
 * Erstellt 20 Random-User in Supabase (16 deutschsprachig, 4 international)
 * mit realistischen Profilen, Workouts, PRs und Cardio-Sessions.
 * Markiert alle als `is_beta = true` für späteres Cleanup.
 *
 * VORAUSSETZUNGEN:
 *   1. supabase/RUN_ME_NOW.sql ist im Supabase SQL-Editor ausgeführt
 *   2. ENV-Variablen sind gesetzt (.env.local):
 *      - NEXT_PUBLIC_SUPABASE_URL
 *      - SUPABASE_SERVICE_ROLE_KEY  (NICHT der anon-Key!)
 *
 * AUSFÜHRUNG (lokal):
 *   npx tsx scripts/seed-beta-users.ts
 *
 * Druckt am Ende eine Credentials-Liste die du an deine Beta-Tester schickst.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// .env.local laden
config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ Bitte NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env.local setzen");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ────────────────────────────────────────────────────────────
// Namens-Pools — realistisch wirkende Vor-/Nachnamen pro Region
// ────────────────────────────────────────────────────────────

const DE_FIRST = [
  "Lukas", "Felix", "Maximilian", "Jonas", "Tobias", "David", "Niklas", "Florian",
  "Sebastian", "Marco", "Lena", "Sarah", "Anna", "Julia", "Sophie", "Marie",
  "Hannah", "Laura", "Lisa", "Mia", "Mathis", "Leon", "Finn", "Paul",
];

const DE_LAST = [
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner",
  "Becker", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf",
  "Schröder", "Neumann", "Schwarz", "Zimmermann", "Braun",
];

const AT_FIRST = ["Stefan", "Andreas", "Michael", "Christoph", "Daniel", "Magdalena", "Theresa", "Verena"];
const AT_LAST  = ["Gruber", "Huber", "Bauer", "Mayer", "Steiner", "Wagner", "Lechner", "Hofer"];

const CH_FIRST = ["Roman", "Beat", "Reto", "Andrea", "Manuela", "Petra", "Ladina", "Levin"];
const CH_LAST  = ["Müller", "Meier", "Keller", "Brunner", "Frei", "Weber", "Lüthi", "Schmid"];

const INTL_FIRST = ["Alex", "Jamie", "Chris", "Sam", "Taylor", "Jordan", "Sophie", "Lucas"];
const INTL_LAST  = ["Smith", "Johnson", "Brown", "Jones", "Garcia", "Martin", "Anderson", "Wilson", "Dubois", "Müller"];

// Country + Locale Mapping
const COUNTRIES = {
  DE: { name: "Deutschland", cities: ["Berlin", "München", "Hamburg", "Köln", "Frankfurt", "Düsseldorf", "Leipzig", "Bremen"] },
  AT: { name: "Österreich", cities: ["Wien", "Graz", "Linz", "Salzburg", "Innsbruck"] },
  CH: { name: "Schweiz", cities: ["Zürich", "Genf", "Basel", "Bern", "Luzern"] },
  US: { name: "USA", cities: ["New York", "Los Angeles", "Austin", "Boston"] },
  CA: { name: "Kanada", cities: ["Toronto", "Vancouver", "Montréal"] },
  FR: { name: "Frankreich", cities: ["Paris", "Lyon"] },
  NL: { name: "Niederlande", cities: ["Amsterdam", "Utrecht"] },
  UK: { name: "Großbritannien", cities: ["London", "Manchester"] },
} as const;

// Sportarten + Themes
const SPORTS = ["strength", "calisthenics", "cardio", "hiit", "mobility"];
const THEMES = ["violet", "cyan", "lime", "purple", "orange", "rose", "mono"];
const SURFACES = ["slate", "black", "blue", "warm", "forest"];

// Avatar-Presets (sollten in lib/avatars.ts existieren)
const AVATAR_PRESETS = [
  "lifter", "runner", "yogi", "boxer", "swimmer", "climber", "cyclist", "warrior",
];

const PR_EXERCISES = [
  { name: "Bench Press",   unit: "kg",  range: [60, 140] },
  { name: "Squat",          unit: "kg",  range: [80, 200] },
  { name: "Deadlift",       unit: "kg",  range: [100, 240] },
  { name: "Overhead Press", unit: "kg",  range: [30, 90] },
  { name: "Pull-up",        unit: "reps", range: [5, 25] },
  { name: "5K Run",         unit: "min", range: [18, 35] },
  { name: "10K Run",        unit: "min", range: [42, 75] },
];

const ACTIVITY_IDS = ["run_road", "run_trail", "bike_road", "bike_mtb", "swim_pool", "hike", "walk_brisk"];

// ────────────────────────────────────────────────────────────
// Helper
// ────────────────────────────────────────────────────────────

const rand = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => Math.random() * (max - min) + min;

function pickName(country: keyof typeof COUNTRIES): { first: string; last: string } {
  if (country === "DE") return { first: rand(DE_FIRST), last: rand(DE_LAST) };
  if (country === "AT") return { first: rand(AT_FIRST), last: rand(AT_LAST) };
  if (country === "CH") return { first: rand(CH_FIRST), last: rand(CH_LAST) };
  return { first: rand(INTL_FIRST), last: rand(INTL_LAST) };
}

// 80/20-Verteilung der 20 User
const COUNTRY_DIST: (keyof typeof COUNTRIES)[] = [
  "DE", "DE", "DE", "DE", "DE", "DE", "DE", "DE",     // 8 DE
  "DE", "DE",                                            // 10 DE
  "AT", "AT", "AT",                                      // 3 AT
  "CH", "CH", "CH",                                      // 3 CH      → Total 16 DACH (80%)
  "US", "CA", "FR", "NL",                                // 4 INTL (20%)
];

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Seeding 20 Beta-User…\n");

  const credentials: { email: string; password: string; name: string; country: string }[] = [];
  const today = new Date();

  for (let i = 0; i < 20; i++) {
    const num = String(i + 1).padStart(2, "0");
    const country = COUNTRY_DIST[i];
    const { first, last } = pickName(country);
    const display = `${first} ${last.slice(0, 1)}.`;
    const email = `beta${num}@kalion-max.app`;
    const password = `KalionBeta${num}!${randInt(100, 999)}`;
    const lang = country === "DE" || country === "AT" || country === "CH" ? "de" : "en";

    process.stdout.write(`[${num}/20] ${display} (${country})… `);

    // 1) Auth-User anlegen
    const { data: created, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: display, country, is_beta: true },
    });

    if (authErr || !created?.user) {
      console.log(`✗ ${authErr?.message}`);
      continue;
    }

    const userId = created.user.id;

    // 2) Profile updaten (handle_new_user-Trigger hat schon eine Zeile erstellt)
    const xp = randInt(500, 8000);
    const level = Math.floor(Math.log(xp / 100 + 1) / Math.log(1.5)) + 1;
    const streak = randInt(0, 45);
    const totalWorkouts = randInt(8, 120);

    const profileData = {
      display_name: display,
      country,
      country_name: COUNTRIES[country].name,
      city: rand(COUNTRIES[country].cities),
      avatar_url: `preset:${rand(AVATAR_PRESETS)}`,
      active_sport: rand(SPORTS),
      xp,
      level,
      current_streak: streak,
      best_streak: Math.max(streak, randInt(7, 60)),
      total_workouts: totalWorkouts,
      last_workout_date: new Date(today.getTime() - randInt(0, 3) * 86400000).toISOString().slice(0, 10),
      last_seen_at: new Date(today.getTime() - randInt(0, 60) * 60000).toISOString(),
      is_beta: true,
      settings: { theme: rand(THEMES), surface: rand(SURFACES), lang },
    };

    const { error: profErr } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", userId);

    if (profErr) {
      console.log(`✗ profile: ${profErr.message}`);
      continue;
    }

    // 3) Workouts (3-15 in den letzten 30 Tagen)
    const workoutCount = randInt(3, 15);
    const workouts: any[] = [];
    for (let w = 0; w < workoutCount; w++) {
      const daysAgo = randInt(0, 30);
      const startedAt = new Date(today.getTime() - daysAgo * 86400000 - randInt(8, 20) * 3600000);
      const completedAt = new Date(startedAt.getTime() + randInt(40, 90) * 60000);
      workouts.push({
        user_id: userId,
        day_name: rand(["Push Day", "Pull Day", "Leg Day", "Full Body", "Upper", "Lower", "Cardio + Core"]),
        sport: rand(SPORTS),
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        total_volume: randInt(2000, 12000),
        total_sets: randInt(8, 24),
        completed_sets: randInt(8, 24),
      });
    }
    if (workouts.length > 0) {
      await supabase.from("workouts").insert(workouts);
    }

    // 4) Personal Records (2-5)
    const prCount = randInt(2, 5);
    const prs: any[] = [];
    const usedEx = new Set<string>();
    for (let p = 0; p < prCount; p++) {
      const ex = rand(PR_EXERCISES);
      if (usedEx.has(ex.name)) continue;
      usedEx.add(ex.name);
      prs.push({
        user_id: userId,
        exercise_name: ex.name,
        value: randFloat(ex.range[0], ex.range[1]),
        unit: ex.unit,
        recorded_at: new Date(today.getTime() - randInt(0, 14) * 86400000).toISOString(),
      });
    }
    if (prs.length > 0) {
      await supabase.from("personal_records").insert(prs);
    }

    // 5) Cardio-Sessions (1-4)
    const cardioCount = randInt(1, 4);
    const cardios: any[] = [];
    for (let c = 0; c < cardioCount; c++) {
      const daysAgo = randInt(0, 14);
      const activityId = rand(ACTIVITY_IDS);
      const durationS = randInt(20, 80) * 60;
      const distM = activityId.startsWith("run") ? randInt(3000, 15000)
                  : activityId.startsWith("bike") ? randInt(8000, 50000)
                  : randInt(1500, 8000);
      const startedAt = new Date(today.getTime() - daysAgo * 86400000 - randInt(7, 19) * 3600000);
      cardios.push({
        user_id: userId,
        activity_id: activityId,
        started_at: startedAt.toISOString(),
        ended_at: new Date(startedAt.getTime() + durationS * 1000).toISOString(),
        duration_s: durationS,
        distance_m: distM,
        elevation_gain_m: randInt(20, 400),
        elevation_loss_m: randInt(20, 400),
        avg_pace_s_per_km: activityId.startsWith("run") ? randInt(280, 420) : null,
        avg_speed_kmh: activityId.startsWith("bike") ? randFloat(18, 32) : (distM / 1000) / (durationS / 3600),
        calories: randInt(200, 900),
        source: "manual",
      });
    }
    if (cardios.length > 0) {
      await supabase.from("cardio_sessions").insert(cardios);
    }

    credentials.push({ email, password, name: display, country });
    console.log("✓");
  }

  // Credentials ausgeben
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  ✓ 20 BETA-USER ERFOLGREICH ANGELEGT");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("Login-Credentials für deine Beta-Tester:\n");

  for (const c of credentials) {
    console.log(`  ${c.name.padEnd(22)} [${c.country}]`);
    console.log(`    📧 ${c.email}`);
    console.log(`    🔑 ${c.password}`);
    console.log("");
  }

  console.log("───────────────────────────────────────────────────────────");
  console.log("💡 Tipp: Diese Credentials in beta-credentials.txt speichern");
  console.log("   und per signal/threema/encrypted-email teilen.");
  console.log("");
  console.log("🗑  Cleanup vor Production:");
  console.log("   Im SQL-Editor:  select admin_delete_all_beta_users();");
  console.log("   (du musst Admin sein)");
  console.log("");

  // Optional in Datei schreiben
  const fs = await import("fs");
  const lines = credentials.map((c) =>
    `${c.country}\t${c.name}\t${c.email}\t${c.password}`
  ).join("\n");
  const header = "Country\tName\tEmail\tPassword\n";
  fs.writeFileSync("beta-credentials.tsv", header + lines, "utf-8");
  console.log("📄 Credentials zusätzlich gespeichert in: beta-credentials.tsv\n");
}

main().catch((e) => {
  console.error("\n✗ Seed-Script fehlgeschlagen:", e);
  process.exit(1);
});
