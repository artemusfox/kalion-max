/**
 * KALION MAX — Seed-Script für 100 Beta-User
 *
 * Erstellt 100 Random-User mit realistischen Profilen, Workouts, PRs, Cardio-Sessions.
 * 80% deutschsprachig (DE/AT/CH), 20% international.
 *
 * Live-Presence: last_seen_at wird so verteilt, dass IMMER mindestens 5 User
 * in den letzten 5 Min "online" sind. Der Rest verteilt sich gleichmäßig
 * über die letzten 24 Stunden.
 *
 * Markiert alle als `is_beta = true` für späteres Cleanup.
 *
 * VORAUSSETZUNGEN:
 *   1. supabase/RUN_ME_NOW.sql ist im Supabase SQL-Editor ausgeführt
 *      (inkl. chat_migration.sql)
 *   2. ENV-Variablen sind gesetzt (.env.local):
 *      - NEXT_PUBLIC_SUPABASE_URL
 *      - SUPABASE_SERVICE_ROLE_KEY  (Secret-Key!)
 *
 * AUSFÜHRUNG (lokal):
 *   npx tsx scripts/seed-beta-users.ts
 *
 * Druckt am Ende eine Credentials-Liste die du an deine Beta-Tester schickst.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync } from "fs";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ Bitte NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env.local setzen");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TOTAL = 100;

// ────────────────────────────────────────────────────────────
// Name-Pools
// ────────────────────────────────────────────────────────────

const DE_FIRST = [
  "Lukas","Felix","Maximilian","Jonas","Tobias","David","Niklas","Florian","Sebastian","Marco",
  "Lena","Sarah","Anna","Julia","Sophie","Marie","Hannah","Laura","Lisa","Mia",
  "Mathis","Leon","Finn","Paul","Tim","Tom","Jan","Erik","Alexander","Daniel",
  "Emma","Charlotte","Greta","Klara","Helena","Theresa","Pia","Carla","Sophia","Nora",
];

const DE_LAST = [
  "Müller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Hoffmann","Schäfer",
  "Koch","Bauer","Richter","Klein","Wolf","Schröder","Neumann","Schwarz","Zimmermann","Braun",
  "Krüger","Hofmann","Hartmann","Lange","Schmitt","Werner","Krause","Lehmann","Schmid","Schulz",
];

const AT_FIRST = ["Stefan","Andreas","Michael","Christoph","Daniel","Magdalena","Theresa","Verena","Marlene","Lorenz"];
const AT_LAST  = ["Gruber","Huber","Bauer","Mayer","Steiner","Wagner","Lechner","Hofer","Eder","Pichler"];

const CH_FIRST = ["Roman","Beat","Reto","Andrea","Manuela","Petra","Ladina","Levin","Jürg","Fabienne"];
const CH_LAST  = ["Müller","Meier","Keller","Brunner","Frei","Weber","Lüthi","Schmid","Marti","Studer"];

const INTL_FIRST = [
  "Alex","Jamie","Chris","Sam","Taylor","Jordan","Sophie","Lucas","Olivia","Noah",
  "Ethan","Mia","Liam","Emma","Ben","Zoe","James","Ava","Henry","Sofia",
];
const INTL_LAST = [
  "Smith","Johnson","Brown","Jones","Garcia","Martin","Anderson","Wilson","Dubois","Bernard",
  "Rossi","Conti","Andersson","Eriksson","Janssen","Visser","O'Brien","Murphy","Tremblay","Roy",
];

const COUNTRIES = {
  DE: { name: "Deutschland", cities: ["Berlin","München","Hamburg","Köln","Frankfurt","Düsseldorf","Leipzig","Bremen","Stuttgart","Dresden","Hannover","Nürnberg"] },
  AT: { name: "Österreich", cities: ["Wien","Graz","Linz","Salzburg","Innsbruck","Klagenfurt"] },
  CH: { name: "Schweiz", cities: ["Zürich","Genf","Basel","Bern","Luzern","Lausanne","Winterthur"] },
  US: { name: "USA", cities: ["New York","Los Angeles","Austin","Boston","Chicago","Seattle","Miami"] },
  CA: { name: "Kanada", cities: ["Toronto","Vancouver","Montréal","Calgary","Ottawa"] },
  FR: { name: "Frankreich", cities: ["Paris","Lyon","Marseille","Bordeaux"] },
  NL: { name: "Niederlande", cities: ["Amsterdam","Utrecht","Rotterdam","Eindhoven"] },
  UK: { name: "Großbritannien", cities: ["London","Manchester","Edinburgh","Bristol"] },
  IT: { name: "Italien", cities: ["Mailand","Rom","Turin"] },
  SE: { name: "Schweden", cities: ["Stockholm","Göteborg"] },
} as const;

const SPORTS = ["strength","calisthenics","cardio","hiit","mobility"];
const THEMES = ["violet","cyan","lime","purple","orange","rose","mono"];
const SURFACES = ["slate","black","blue","warm","forest"];
const AVATAR_PRESETS = ["lifter","runner","yogi","boxer","swimmer","climber","cyclist","warrior"];

const PR_EXERCISES = [
  { name: "Bench Press",   unit: "kg",   range: [60, 140] },
  { name: "Squat",          unit: "kg",   range: [80, 200] },
  { name: "Deadlift",       unit: "kg",   range: [100, 240] },
  { name: "Overhead Press", unit: "kg",   range: [30, 90] },
  { name: "Pull-up",        unit: "reps", range: [5, 25] },
  { name: "5K Run",         unit: "min",  range: [18, 35] },
  { name: "10K Run",        unit: "min",  range: [42, 75] },
  { name: "Plank",          unit: "sec",  range: [60, 360] },
];

const ACTIVITY_IDS = ["run_road","run_trail","bike_road","bike_mtb","swim_pool","hike","walk_brisk","run_treadmill","row_indoor","yoga"];

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

// 80/20 Verteilung über 100 User
function buildCountryDist(): (keyof typeof COUNTRIES)[] {
  const dist: (keyof typeof COUNTRIES)[] = [];
  // DACH 80
  for (let i = 0; i < 55; i++) dist.push("DE");
  for (let i = 0; i < 12; i++) dist.push("AT");
  for (let i = 0; i < 13; i++) dist.push("CH");
  // INTL 20
  const intl: (keyof typeof COUNTRIES)[] = ["US","US","US","US","CA","CA","CA","FR","FR","NL","NL","UK","UK","IT","IT","SE","US","CA","FR","UK"];
  dist.push(...intl);
  // Shuffle damit Reihenfolge nicht klumpt
  for (let i = dist.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dist[i], dist[j]] = [dist[j], dist[i]];
  }
  return dist;
}

// last_seen_at-Verteilung:
//  - 10 User in den letzten 5 Min (= immer online) → "active now"
//  - 20 User in den letzten 30 Min
//  - 40 User in den letzten 6 Stunden
//  - 20 User in den letzten 24 Stunden
//  - 10 User in den letzten 7 Tagen
function pickLastSeen(i: number): Date {
  const now = Date.now();
  if (i < 10) return new Date(now - randInt(5, 300) * 1000);          // 5s - 5min
  if (i < 30) return new Date(now - randInt(5, 30) * 60000);          // 5 - 30 min
  if (i < 70) return new Date(now - randInt(30, 360) * 60000);        // 30min - 6h
  if (i < 90) return new Date(now - randInt(6, 24) * 3600000);        // 6 - 24h
  return new Date(now - randInt(1, 7) * 86400000);                    // 1 - 7 Tage
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

async function main() {
  console.log(`🚀 Seeding ${TOTAL} Beta-User…\n`);

  const dist = buildCountryDist();
  const credentials: { num: string; email: string; password: string; name: string; country: string }[] = [];
  const today = new Date();

  // Shuffle für last_seen indices (= bessere visuelle Verteilung)
  const seenIndices = Array.from({ length: TOTAL }, (_, i) => i);
  for (let i = seenIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [seenIndices[i], seenIndices[j]] = [seenIndices[j], seenIndices[i]];
  }

  for (let i = 0; i < TOTAL; i++) {
    const num = String(i + 1).padStart(3, "0");
    const country = dist[i];
    const { first, last } = pickName(country);
    const display = `${first} ${last.slice(0, 1)}.`;
    const email = `beta${num}@kalion-max.app`;
    const password = `KB-${num}-${randInt(1000, 9999)}`;
    const lang = country === "DE" || country === "AT" || country === "CH" ? "de" : "en";

    process.stdout.write(`[${num}/${TOTAL}] ${display.padEnd(22)} (${country}) `);

    const { data: created, error: authErr } = await supabase.auth.admin.createUser({
      email, password,
      email_confirm: true,
      user_metadata: { display_name: display, country, is_beta: true },
    });

    if (authErr || !created?.user) {
      // Schon existiert?
      if (authErr?.message?.includes("already")) {
        process.stdout.write("⤴ skip (exists)\n");
      } else {
        process.stdout.write(`✗ ${authErr?.message}\n`);
      }
      continue;
    }

    const userId = created.user.id;
    const xp = randInt(500, 12000);
    const level = Math.floor(Math.log(xp / 100 + 1) / Math.log(1.5)) + 1;
    const streak = randInt(0, 90);
    const totalWorkouts = randInt(8, 200);
    const lastSeen = pickLastSeen(seenIndices[i]);

    const { error: profErr } = await supabase.from("profiles").update({
      display_name: display,
      country,
      country_name: COUNTRIES[country].name,
      city: rand(COUNTRIES[country].cities),
      avatar_url: `preset:${rand(AVATAR_PRESETS)}`,
      active_sport: rand(SPORTS),
      xp, level,
      current_streak: streak,
      best_streak: Math.max(streak, randInt(7, 120)),
      total_workouts: totalWorkouts,
      last_workout_date: new Date(today.getTime() - randInt(0, 3) * 86400000).toISOString().slice(0, 10),
      last_seen_at: lastSeen.toISOString(),
      is_beta: true,
      settings: { theme: rand(THEMES), surface: rand(SURFACES), lang },
    }).eq("id", userId);

    if (profErr) {
      process.stdout.write(`✗ ${profErr.message}\n`);
      continue;
    }

    // Workouts (3-15 in den letzten 30 Tagen)
    const workouts: any[] = [];
    for (let w = 0; w < randInt(3, 15); w++) {
      const daysAgo = randInt(0, 30);
      const startedAt = new Date(today.getTime() - daysAgo * 86400000 - randInt(8, 20) * 3600000);
      const completedAt = new Date(startedAt.getTime() + randInt(40, 90) * 60000);
      workouts.push({
        user_id: userId,
        day_name: rand(["Push Day","Pull Day","Leg Day","Full Body","Upper","Lower","Cardio + Core","HIIT","Mobility","Conditioning"]),
        sport: rand(SPORTS),
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        total_volume: randInt(2000, 14000),
        total_sets: randInt(8, 24),
        completed_sets: randInt(8, 24),
      });
    }
    if (workouts.length > 0) await supabase.from("workouts").insert(workouts);

    // PRs
    const prs: any[] = [];
    const used = new Set<string>();
    for (let p = 0; p < randInt(2, 6); p++) {
      const ex = rand(PR_EXERCISES);
      if (used.has(ex.name)) continue;
      used.add(ex.name);
      prs.push({
        user_id: userId, exercise_name: ex.name,
        value: randFloat(ex.range[0], ex.range[1]),
        unit: ex.unit,
        recorded_at: new Date(today.getTime() - randInt(0, 14) * 86400000).toISOString(),
      });
    }
    if (prs.length > 0) await supabase.from("personal_records").insert(prs);

    // Cardio
    const cardios: any[] = [];
    for (let c = 0; c < randInt(1, 5); c++) {
      const daysAgo = randInt(0, 14);
      const activityId = rand(ACTIVITY_IDS);
      const durationS = randInt(20, 80) * 60;
      const distM = activityId.startsWith("run") ? randInt(3000, 15000)
                  : activityId.startsWith("bike") ? randInt(8000, 50000)
                  : randInt(1500, 8000);
      const startedAt = new Date(today.getTime() - daysAgo * 86400000 - randInt(7, 19) * 3600000);
      cardios.push({
        user_id: userId, activity_id: activityId,
        started_at: startedAt.toISOString(),
        ended_at: new Date(startedAt.getTime() + durationS * 1000).toISOString(),
        duration_s: durationS, distance_m: distM,
        elevation_gain_m: randInt(20, 400), elevation_loss_m: randInt(20, 400),
        avg_pace_s_per_km: activityId.startsWith("run") ? randInt(280, 420) : null,
        avg_speed_kmh: activityId.startsWith("bike") ? randFloat(18, 32) : (distM / 1000) / (durationS / 3600),
        calories: randInt(200, 900),
        source: "manual",
      });
    }
    if (cardios.length > 0) await supabase.from("cardio_sessions").insert(cardios);

    credentials.push({ num, email, password, name: display, country });
    process.stdout.write("✓\n");

    // Rate-Limit: alle 20 User 2 Sek warten damit Supabase Auth nicht throttled
    if ((i + 1) % 20 === 0) {
      process.stdout.write(`   …kurz warten (${i + 1}/${TOTAL})…\n`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Credentials ausgeben
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`  ✓ ${credentials.length} BETA-USER ANGELEGT`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // Datei: einfache TSV
  const header = "Num\tCountry\tName\tEmail\tPassword\n";
  const lines = credentials.map((c) =>
    `${c.num}\t${c.country}\t${c.name}\t${c.email}\t${c.password}`
  ).join("\n");
  writeFileSync("beta-credentials.tsv", header + lines, "utf-8");
  console.log("📄 Credentials gespeichert in: beta-credentials.tsv");

  // Kurze Konsolen-Ausgabe nur erste 20
  console.log("\nErste 20 Logins (Rest siehe Datei):\n");
  for (const c of credentials.slice(0, 20)) {
    console.log(`  ${c.name.padEnd(22)} [${c.country}]  ${c.email}  ${c.password}`);
  }

  console.log("\n───────────────────────────────────────────────────────────");
  console.log("🗑  Cleanup vor Production:");
  console.log("   select admin_delete_all_beta_users();");
  console.log("");
}

main().catch((e) => {
  console.error("\n✗ Seed-Script fehlgeschlagen:", e);
  process.exit(1);
});
