// ═══════════════════════════════════════
// KALION MAX — Template-Pläne
// Vorgefertigte Pläne die Nutzer klonen und anpassen können
// ═══════════════════════════════════════

import { Plan } from "./types";

export const TEMPLATES: Plan[] = [
  // ═══════════════════════════════════════
  // STRENGTH — 3-Day Full Body Beginner
  // ═══════════════════════════════════════
  {
    id: "tpl_strength_fb_beginner",
    name: "Full Body Beginner",
    description: "3 Tage pro Woche, alle Muskelgruppen — der klassische Einstieg ins Krafttraining.",
    sport: "strength",
    level: "beginner",
    durationWeeks: 8,
    isTemplate: true,
    weeks: [{
      weekNum: 1,
      days: [
        { id: "d1", name: "Workout A", dayLabel: "Mo", exercises: [
          { exerciseId: "back_squat", sets: 3, targetReps: 8, targetWeight: 40, rest: 120 },
          { exerciseId: "bench_press", sets: 3, targetReps: 8, targetWeight: 30, rest: 120 },
          { exerciseId: "barbell_row", sets: 3, targetReps: 8, targetWeight: 30, rest: 90 },
          { exerciseId: "weighted_plank", sets: 3, targetTime: 30, rest: 60 },
        ]},
        { id: "d2", name: "Workout B", dayLabel: "Mi", exercises: [
          { exerciseId: "deadlift", sets: 1, targetReps: 5, targetWeight: 60, rest: 180 },
          { exerciseId: "ohp", sets: 3, targetReps: 8, targetWeight: 20, rest: 120 },
          { exerciseId: "lat_pulldown", sets: 3, targetReps: 10, targetWeight: 30, rest: 90 },
          { exerciseId: "bicep_curl", sets: 3, targetReps: 10, targetWeight: 10, rest: 60 },
        ]},
        { id: "d3", name: "Workout A (Heavy)", dayLabel: "Fr", exercises: [
          { exerciseId: "back_squat", sets: 3, targetReps: 5, targetWeight: 50, rest: 120 },
          { exerciseId: "bench_press", sets: 3, targetReps: 5, targetWeight: 35, rest: 120 },
          { exerciseId: "barbell_row", sets: 3, targetReps: 8, targetWeight: 35, rest: 90 },
          { exerciseId: "tricep_pushdown", sets: 3, targetReps: 12, targetWeight: 15, rest: 60 },
        ]},
      ]
    }]
  },

  // ═══════════════════════════════════════
  // STRENGTH — Push/Pull/Legs Intermediate
  // ═══════════════════════════════════════
  {
    id: "tpl_strength_ppl",
    name: "Push / Pull / Legs",
    description: "Klassischer 6-Tage-Split für Fortgeschrittene — hohe Frequenz, viel Volumen.",
    sport: "strength",
    level: "intermediate",
    durationWeeks: 12,
    isTemplate: true,
    weeks: [{
      weekNum: 1,
      days: [
        { id: "d1", name: "Push Day", dayLabel: "Mo", exercises: [
          { exerciseId: "bench_press", sets: 4, targetReps: 8, rest: 120 },
          { exerciseId: "incline_bench", sets: 3, targetReps: 10, rest: 90 },
          { exerciseId: "ohp", sets: 3, targetReps: 8, rest: 120 },
          { exerciseId: "lateral_raise", sets: 3, targetReps: 15, rest: 60 },
          { exerciseId: "tricep_pushdown", sets: 3, targetReps: 12, rest: 60 },
        ]},
        { id: "d2", name: "Pull Day", dayLabel: "Di", exercises: [
          { exerciseId: "deadlift", sets: 3, targetReps: 5, rest: 180 },
          { exerciseId: "pullup", sets: 3, targetReps: 8, rest: 120 },
          { exerciseId: "barbell_row", sets: 3, targetReps: 10, rest: 90 },
          { exerciseId: "face_pull", sets: 3, targetReps: 15, rest: 60 },
          { exerciseId: "bicep_curl", sets: 3, targetReps: 12, rest: 60 },
        ]},
        { id: "d3", name: "Leg Day", dayLabel: "Mi", exercises: [
          { exerciseId: "back_squat", sets: 4, targetReps: 8, rest: 150 },
          { exerciseId: "rdl", sets: 3, targetReps: 10, rest: 120 },
          { exerciseId: "leg_press", sets: 3, targetReps: 12, rest: 90 },
          { exerciseId: "leg_curl", sets: 3, targetReps: 12, rest: 75 },
          { exerciseId: "hip_thrust", sets: 3, targetReps: 10, rest: 75 },
        ]},
        { id: "d4", name: "Push Day (Volumen)", dayLabel: "Do", exercises: [
          { exerciseId: "dumbbell_press", sets: 4, targetReps: 10, rest: 90 },
          { exerciseId: "db_flyes", sets: 3, targetReps: 12, rest: 75 },
          { exerciseId: "db_shoulder_press", sets: 3, targetReps: 10, rest: 90 },
          { exerciseId: "skullcrusher", sets: 3, targetReps: 10, rest: 75 },
        ]},
      ]
    }]
  },

  // ═══════════════════════════════════════
  // CALISTHENICS — 12 Wochen Anfänger (wie vorher)
  // ═══════════════════════════════════════
  {
    id: "tpl_calisthenics_12w",
    name: "Calisthenics 12-Wochen Anfänger",
    description: "Von Knie-Liegestützen zum ersten Klimmzug — der komplette Bodyweight-Einstiegsplan.",
    sport: "calisthenics",
    level: "beginner",
    durationWeeks: 12,
    isTemplate: true,
    weeks: [{
      weekNum: 1,
      days: [
        { id: "d1", name: "Oberkörper", dayLabel: "Mo", exercises: [
          { exerciseId: "knee_pushup", sets: 3, targetReps: 8 },
          { exerciseId: "aus_pullup", sets: 3, targetReps: 8 },
          { exerciseId: "plank", sets: 3, targetTime: 20 },
        ]},
        { id: "d2", name: "Unterkörper", dayLabel: "Mi", exercises: [
          { exerciseId: "bw_squat", sets: 3, targetReps: 10 },
          { exerciseId: "glute_bridge", sets: 3, targetReps: 12 },
          { exerciseId: "bulgarian_split", sets: 3, targetReps: 8 },
        ]},
        { id: "d3", name: "Ganzkörper", dayLabel: "Fr", exercises: [
          { exerciseId: "knee_pushup", sets: 3, targetReps: 10 },
          { exerciseId: "aus_pullup", sets: 3, targetReps: 10 },
          { exerciseId: "bw_squat", sets: 3, targetReps: 12 },
          { exerciseId: "deadhang", sets: 3, targetTime: 15 },
        ]},
      ]
    }]
  },

  // ═══════════════════════════════════════
  // CARDIO — 5K-Läufer Plan
  // ═══════════════════════════════════════
  {
    id: "tpl_cardio_5k",
    name: "5K-Läufer in 8 Wochen",
    description: "Vom Sofa zu 5 km — Couch-to-5K Style mit progressiver Belastung.",
    sport: "cardio",
    level: "beginner",
    durationWeeks: 8,
    isTemplate: true,
    weeks: [{
      weekNum: 1,
      days: [
        { id: "d1", name: "Intervall-Training", dayLabel: "Mo", exercises: [
          { exerciseId: "running", sets: 8, targetTime: 60, rest: 90, notes: "1 min laufen / 1:30 gehen — 8x" },
        ]},
        { id: "d2", name: "Lockerer Lauf", dayLabel: "Mi", exercises: [
          { exerciseId: "running", sets: 1, targetTime: 1200, targetDistance: 2000, notes: "Gemütliches Tempo — durchhalten!" },
        ]},
        { id: "d3", name: "Längerer Lauf", dayLabel: "Sa", exercises: [
          { exerciseId: "running", sets: 1, targetTime: 1800, targetDistance: 3000, notes: "Langsam starten, Tempo halten." },
        ]},
      ]
    }]
  },

  // ═══════════════════════════════════════
  // HIIT — 30-Min Fatburner
  // ═══════════════════════════════════════
  {
    id: "tpl_hiit_fatburner",
    name: "HIIT Fatburner 30 Min",
    description: "4 Tage die Woche, 30 Minuten hochintensive Einheiten — maximaler Effekt.",
    sport: "hiit",
    level: "intermediate",
    durationWeeks: 6,
    isTemplate: true,
    weeks: [{
      weekNum: 1,
      days: [
        { id: "d1", name: "Tabata Ganzkörper", dayLabel: "Mo", exercises: [
          { exerciseId: "burpee", sets: 8, targetReps: 10, rest: 10 },
          { exerciseId: "jumping_lunges", sets: 8, targetReps: 12, rest: 10 },
          { exerciseId: "mountain_climber", sets: 8, targetReps: 20, rest: 10 },
          { exerciseId: "plank", sets: 4, targetTime: 45, rest: 15 },
        ]},
        { id: "d2", name: "Kettlebell Komplex", dayLabel: "Mi", exercises: [
          { exerciseId: "kb_swing", sets: 5, targetReps: 20, targetWeight: 16, rest: 60 },
          { exerciseId: "thruster", sets: 5, targetReps: 10, targetWeight: 20, rest: 90 },
          { exerciseId: "box_jump", sets: 5, targetReps: 10, rest: 60 },
        ]},
        { id: "d3", name: "AMRAP 20 Min", dayLabel: "Fr", exercises: [
          { exerciseId: "pushup", sets: 1, targetReps: 10, notes: "Runden zählen — AMRAP 20 Min" },
          { exerciseId: "bw_squat", sets: 1, targetReps: 15, notes: "Teil der Runde" },
          { exerciseId: "burpee", sets: 1, targetReps: 5, notes: "Teil der Runde" },
        ]},
      ]
    }]
  },

  // ═══════════════════════════════════════
  // MOBILITY — Daily 15 Min
  // ═══════════════════════════════════════
  {
    id: "tpl_mobility_daily",
    name: "Daily Mobility 15 Min",
    description: "Tägliche Mobility-Routine — Hüfte, Schultern, Rücken beweglich halten.",
    sport: "mobility",
    level: "beginner",
    durationWeeks: 4,
    isTemplate: true,
    weeks: [{
      weekNum: 1,
      days: [
        { id: "d1", name: "Morgen-Routine", dayLabel: "Täglich", exercises: [
          { exerciseId: "cat_cow", sets: 2, targetReps: 10, rest: 15 },
          { exerciseId: "downward_dog", sets: 2, targetTime: 30, rest: 15 },
          { exerciseId: "cobra", sets: 2, targetTime: 20, rest: 15 },
          { exerciseId: "pigeon_pose", sets: 2, targetTime: 45, rest: 15, notes: "Beide Seiten" },
          { exerciseId: "childs_pose", sets: 1, targetTime: 60, rest: 0 },
        ]},
      ]
    }]
  },
];

export function getTemplatesForSport(sport?: string): Plan[] {
  if (!sport || sport === "all") return TEMPLATES;
  return TEMPLATES.filter((t) => t.sport === sport);
}

export function getTemplate(id: string): Plan | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
