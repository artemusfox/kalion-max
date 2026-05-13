// ═══════════════════════════════════════════════════════════
// Activity-Catalog für Cardio/Outdoor/Indoor-Aktivitäten
// Unabhängig von Plänen — User loggt eine einzelne Aktivität
// ═══════════════════════════════════════════════════════════

import type { Sport } from "./types";

export type ActivityCategory = "run" | "ride" | "swim" | "winter" | "indoor" | "walk" | "other";

export type Activity = {
  id: string;
  sport: Sport;                         // welche Top-Level-Kategorie
  category: ActivityCategory;
  label_de: string;
  label_en: string;
  icon: string;
  gps: boolean;                         // unterstützt Live-GPS
  indoor: boolean;
  // grobe MET-Werte für Kalorien-Schätzung (Compendium of Physical Activities 2024)
  met: number;
};

export const ACTIVITIES: Activity[] = [
  // ── Laufen / Running ──
  { id: "run_road",     sport: "cardio", category: "run", label_de: "Laufen (Straße)", label_en: "Run (Road)",       icon: "🏃",  gps: true,  indoor: false, met: 9.8 },
  { id: "run_trail",    sport: "cardio", category: "run", label_de: "Trail-Run",        label_en: "Trail Run",        icon: "🥾",  gps: true,  indoor: false, met: 10.5 },
  { id: "run_treadmill",sport: "cardio", category: "run", label_de: "Laufband",          label_en: "Treadmill",        icon: "🏃‍♂️", gps: false, indoor: true,  met: 9.0 },
  { id: "run_track",    sport: "cardio", category: "run", label_de: "Bahn / Intervall",  label_en: "Track / Intervals",icon: "🏟️", gps: true,  indoor: false, met: 11.5 },
  { id: "walk",         sport: "cardio", category: "walk", label_de: "Spaziergang",       label_en: "Walk",             icon: "🚶",  gps: true,  indoor: false, met: 3.5 },
  { id: "walk_brisk",   sport: "cardio", category: "walk", label_de: "Power-Walk",        label_en: "Power Walk",       icon: "🚶‍♀️", gps: true,  indoor: false, met: 4.8 },
  { id: "hike",         sport: "cardio", category: "walk", label_de: "Wandern",           label_en: "Hike",             icon: "⛰️", gps: true,  indoor: false, met: 6.0 },

  // ── Radfahren / Cycling ──
  { id: "bike_road",    sport: "cardio", category: "ride", label_de: "Rennrad",          label_en: "Road Bike",        icon: "🚴",  gps: true,  indoor: false, met: 8.5 },
  { id: "bike_gravel",  sport: "cardio", category: "ride", label_de: "Gravel",           label_en: "Gravel",           icon: "🚵",  gps: true,  indoor: false, met: 8.0 },
  { id: "bike_mtb",     sport: "cardio", category: "ride", label_de: "MTB",              label_en: "MTB",              icon: "🚵‍♂️", gps: true,  indoor: false, met: 10.0 },
  { id: "bike_commute", sport: "cardio", category: "ride", label_de: "Pendeln (Fahrrad)", label_en: "Commute (Bike)",   icon: "🚲",  gps: true,  indoor: false, met: 6.0 },
  { id: "bike_indoor",  sport: "cardio", category: "indoor", label_de: "Indoor-Bike",      label_en: "Indoor Bike",      icon: "🚴‍♀️", gps: false, indoor: true,  met: 7.5 },
  { id: "bike_ebike",   sport: "cardio", category: "ride", label_de: "E-Bike",           label_en: "E-Bike",           icon: "⚡",  gps: true,  indoor: false, met: 4.5 },

  // ── Schwimmen / Wassersport ──
  { id: "swim_pool",    sport: "cardio", category: "swim", label_de: "Schwimmen (Pool)", label_en: "Swim (Pool)",      icon: "🏊",  gps: false, indoor: true,  met: 8.0 },
  { id: "swim_open",    sport: "cardio", category: "swim", label_de: "Freiwasser",       label_en: "Open Water",       icon: "🌊",  gps: true,  indoor: false, met: 9.0 },
  { id: "row_water",    sport: "cardio", category: "swim", label_de: "Rudern (Wasser)",  label_en: "Rowing (Water)",   icon: "🛶",  gps: true,  indoor: false, met: 7.0 },
  { id: "sup",          sport: "cardio", category: "swim", label_de: "SUP",              label_en: "Paddleboarding",   icon: "🏄",  gps: true,  indoor: false, met: 6.5 },
  { id: "kayak",        sport: "cardio", category: "swim", label_de: "Kajak",            label_en: "Kayak",            icon: "🛶",  gps: true,  indoor: false, met: 5.0 },

  // ── Indoor-Cardio ──
  { id: "row_indoor",   sport: "cardio", category: "indoor", label_de: "Rudern (Ergo)",   label_en: "Rowing (Erg)",     icon: "🚣",  gps: false, indoor: true,  met: 8.5 },
  { id: "elliptical",   sport: "cardio", category: "indoor", label_de: "Crosstrainer",    label_en: "Elliptical",       icon: "⚙️", gps: false, indoor: true,  met: 5.5 },
  { id: "stairmaster",  sport: "cardio", category: "indoor", label_de: "Stairmaster",     label_en: "Stairmaster",      icon: "🪜",  gps: false, indoor: true,  met: 9.0 },
  { id: "jumprope",     sport: "hiit",   category: "indoor", label_de: "Springseil",      label_en: "Jump Rope",        icon: "🪢",  gps: false, indoor: true,  met: 11.0 },

  // ── Winter / Snow ──
  { id: "ski_alpine",   sport: "cardio", category: "winter", label_de: "Ski Alpin",        label_en: "Alpine Ski",       icon: "⛷️", gps: true,  indoor: false, met: 6.0 },
  { id: "ski_xc",       sport: "cardio", category: "winter", label_de: "Langlauf",         label_en: "XC Ski",           icon: "🎿",  gps: true,  indoor: false, met: 9.0 },
  { id: "snowboard",    sport: "cardio", category: "winter", label_de: "Snowboard",        label_en: "Snowboard",        icon: "🏂",  gps: true,  indoor: false, met: 5.3 },
  { id: "skate",        sport: "cardio", category: "winter", label_de: "Inline / Eis",     label_en: "Skating",          icon: "⛸️", gps: true,  indoor: false, met: 7.0 },

  // ── HIIT / Functional ──
  { id: "hyrox",        sport: "hiit",   category: "other", label_de: "Hyrox",            label_en: "Hyrox",            icon: "🔥",  gps: false, indoor: true,  met: 10.0 },
  { id: "crossfit",     sport: "hiit",   category: "other", label_de: "CrossFit / WOD",   label_en: "CrossFit / WOD",   icon: "🏋️", gps: false, indoor: true,  met: 9.5 },

  // ── Sonstiges ──
  { id: "climbing",     sport: "calisthenics", category: "other", label_de: "Klettern",       label_en: "Climbing",        icon: "🧗",  gps: false, indoor: false, met: 8.0 },
  { id: "yoga",         sport: "mobility",     category: "other", label_de: "Yoga",           label_en: "Yoga",            icon: "🧘",  gps: false, indoor: true,  met: 3.0 },
  { id: "pilates",      sport: "mobility",     category: "other", label_de: "Pilates",        label_en: "Pilates",         icon: "🧘‍♀️", gps: false, indoor: true,  met: 3.5 },
  { id: "boxing",       sport: "hiit",         category: "other", label_de: "Boxen",          label_en: "Boxing",          icon: "🥊",  gps: false, indoor: true,  met: 9.0 },
  { id: "martial_arts", sport: "hiit",         category: "other", label_de: "Kampfsport",     label_en: "Martial Arts",    icon: "🥋",  gps: false, indoor: true,  met: 10.0 },
  { id: "dance",        sport: "cardio",       category: "other", label_de: "Tanzen",         label_en: "Dance",           icon: "💃",  gps: false, indoor: true,  met: 5.5 },
  { id: "tennis",       sport: "cardio",       category: "other", label_de: "Tennis",         label_en: "Tennis",          icon: "🎾",  gps: false, indoor: false, met: 7.0 },
  { id: "football",     sport: "cardio",       category: "other", label_de: "Fußball",        label_en: "Soccer",          icon: "⚽",  gps: false, indoor: false, met: 8.0 },
  { id: "basketball",   sport: "cardio",       category: "other", label_de: "Basketball",     label_en: "Basketball",      icon: "🏀",  gps: false, indoor: false, met: 7.5 },
  { id: "other",        sport: "cardio",       category: "other", label_de: "Sonstiges",      label_en: "Other",           icon: "⭐",  gps: false, indoor: false, met: 5.0 },
];

export const ACTIVITY_BY_ID: Record<string, Activity> = Object.fromEntries(
  ACTIVITIES.map((a) => [a.id, a])
);

export const CATEGORY_LABELS_DE: Record<ActivityCategory, string> = {
  run: "🏃 Laufen", ride: "🚴 Rad", swim: "🏊 Wasser",
  winter: "⛷️ Winter", indoor: "🏠 Indoor",
  walk: "🚶 Walk", other: "⭐ Sonstiges",
};

export const CATEGORY_LABELS_EN: Record<ActivityCategory, string> = {
  run: "🏃 Run", ride: "🚴 Bike", swim: "🏊 Water",
  winter: "⛷️ Winter", indoor: "🏠 Indoor",
  walk: "🚶 Walk", other: "⭐ Other",
};

export function activityLabel(id: string, lang: "de" | "en" = "de"): string {
  const a = ACTIVITY_BY_ID[id];
  if (!a) return id;
  return lang === "en" ? a.label_en : a.label_de;
}

// Kalorien-Schätzung anhand MET × Gewicht × Stunden
// kcal = MET × kg × h
export function estimateKcal(activityId: string, durationMin: number, weightKg = 75): number {
  const a = ACTIVITY_BY_ID[activityId];
  if (!a) return 0;
  return Math.round(a.met * weightKg * (durationMin / 60));
}
