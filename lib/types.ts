// ═══════════════════════════════════════
// KALION MAX — Zentrale Typen
// ═══════════════════════════════════════

export type Sport = "strength" | "calisthenics" | "cardio" | "hiit" | "mobility";

export const SPORT_LABELS: Record<Sport, string> = {
  strength: "Gym & Gewicht",
  calisthenics: "Calisthenics",
  cardio: "Cardio",
  hiit: "HIIT / Functional",
  mobility: "Mobility / Yoga",
};

export const SPORT_COLORS: Record<Sport, string> = {
  strength: "#FF5A6B",
  calisthenics: "#2DD4BF",
  cardio: "#60A5FA",
  hiit: "#FFB800",
  mobility: "#8B7FF0",
};

export const SPORT_ICONS: Record<Sport, string> = {
  strength: "🏋️",
  calisthenics: "💪",
  cardio: "🏃",
  hiit: "🔥",
  mobility: "🧘",
};

// Muskelgruppen (generisch für alle Sportarten)
export type MuscleGroup = 
  | "chest" | "back" | "shoulders" | "arms" | "legs" | "glutes" | "core"
  | "fullbody" | "cardio";

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Brust", back: "Rücken", shoulders: "Schultern", arms: "Arme",
  legs: "Beine", glutes: "Gesäß", core: "Core",
  fullbody: "Ganzkörper", cardio: "Cardio",
};

export const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  chest: "#FF5A6B", back: "#2DD4BF", shoulders: "#F472B6",
  arms: "#FF8B6B", legs: "#FFB800", glutes: "#FB7185",
  core: "#8B7FF0", fullbody: "#22D3EE", cardio: "#60A5FA",
};

// Equipment
export type Equipment =
  | "none" | "barbell" | "dumbbell" | "kettlebell" | "machine"
  | "cable" | "band" | "pullup_bar" | "parallettes" | "bench"
  | "treadmill" | "bike" | "rower" | "jumprope" | "mat";

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: "Kein Equipment", barbell: "Langhantel", dumbbell: "Kurzhantel",
  kettlebell: "Kettlebell", machine: "Maschine", cable: "Seilzug",
  band: "Widerstandsband", pullup_bar: "Klimmzugstange", parallettes: "Parallettes",
  bench: "Bank", treadmill: "Laufband", bike: "Fahrrad",
  rower: "Rudergerät", jumprope: "Springseil", mat: "Matte",
};

// Tracking-Modus pro Übung — bestimmt welche Felder beim Workout angezeigt werden
export type TrackingMode = 
  | "reps_weight"  // Reps × Gewicht (Gym-Klassiker)
  | "reps_only"    // Reps (Bodyweight)
  | "time"         // Sekunden (Plank, Wall-Sit)
  | "distance"     // Meter/km (Laufen, Rudern)
  | "time_distance"; // beides (Cardio)

// Übung (in Library + Plan)
export type Exercise = {
  id: string;
  name: string;
  sport: Sport;
  muscle: MuscleGroup;
  equipment: Equipment;
  tracking: TrackingMode;
  tip?: string;
  defaultRest?: number; // Sekunden
  isCustom?: boolean;   // vom User erstellt
};

// Plan-Struktur (ersetzt den alten Foundation/Aufbau/Progression-Ansatz)
export type PlanExercise = {
  exerciseId: string;   // Referenz zur Exercise
  sets: number;
  targetReps?: number;  // Für reps_weight und reps_only
  targetWeight?: number; // Für reps_weight
  targetTime?: number;   // Für time
  targetDistance?: number; // Für distance (in Metern)
  rest?: number;        // override default
  notes?: string;
};

export type PlanDay = {
  id: string;
  name: string;        // z.B. "Push Day", "Beine", "Laufen lang"
  dayLabel?: string;   // optional "Mo", "Di"...
  exercises: PlanExercise[];
  notes?: string;
};

export type PlanWeek = {
  weekNum: number;
  days: PlanDay[];
};

export type Plan = {
  id: string;
  name: string;
  description?: string;
  sport: Sport;
  level: "beginner" | "intermediate" | "advanced";
  durationWeeks: number;
  weeks: PlanWeek[];
  isTemplate: boolean;
  createdBy?: string;
};

// Helfer
export function formatTarget(pe: PlanExercise, ex: Exercise): string {
  switch (ex.tracking) {
    case "reps_weight":
      return `${pe.sets}×${pe.targetReps}${pe.targetWeight ? ` @ ${pe.targetWeight}kg` : ""}`;
    case "reps_only":
      return `${pe.sets}×${pe.targetReps}`;
    case "time":
      return `${pe.sets}× ${pe.targetTime}s`;
    case "distance":
      return `${((pe.targetDistance || 0) / 1000).toFixed(1)} km`;
    case "time_distance":
      return `${pe.targetTime}s${pe.targetDistance ? ` · ${pe.targetDistance}m` : ""}`;
  }
}

// Level-System
export const BADGES = [
  { key: "first_workout", name: "Erste Schritte", desc: "Dein allererstes Workout", icon: "🎯", xp: 50 },
  { key: "week_complete", name: "Wochenkrieger", desc: "Eine komplette Woche abgeschlossen", icon: "📅", xp: 100 },
  { key: "streak_3", name: "In Fahrt", desc: "3 Tage Streak", icon: "🔥", xp: 75 },
  { key: "streak_7", name: "Unaufhaltsam", desc: "7 Tage Streak", icon: "⚡", xp: 200 },
  { key: "streak_30", name: "Legende", desc: "30 Tage Streak", icon: "👑", xp: 500 },
  { key: "streak_100", name: "Unsterblich", desc: "100 Tage Streak", icon: "💎", xp: 2000 },
  { key: "first_pr", name: "Erstes PR", desc: "Dein erster Personal Record", icon: "🏆", xp: 100 },
  { key: "plan_created", name: "Architekt", desc: "Erster eigener Plan erstellt", icon: "📐", xp: 150 },
  { key: "photo_first", name: "Vor dem Spiegel", desc: "Erstes Progress-Foto", icon: "📸", xp: 50 },
  { key: "measure_first", name: "Datenfetischist", desc: "Erste Messung", icon: "📏", xp: 50 },
  { key: "workouts_10", name: "Erste 10", desc: "10 Workouts absolviert", icon: "🎖️", xp: 200 },
  { key: "workouts_50", name: "Halbmarathon", desc: "50 Workouts", icon: "🥈", xp: 500 },
  { key: "workouts_100", name: "Centurion", desc: "100 Workouts", icon: "🥇", xp: 1000 },
  { key: "multisport", name: "Allrounder", desc: "In 3 verschiedenen Sportarten trainiert", icon: "🌟", xp: 300 },
];

export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(1.5, level - 1));
}

export function levelFromXp(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progress: number } {
  let level = 1;
  let needed = xpForLevel(level);
  let accumulated = 0;
  while (xp >= accumulated + needed) {
    accumulated += needed;
    level++;
    needed = xpForLevel(level);
  }
  return {
    level,
    currentLevelXp: xp - accumulated,
    nextLevelXp: needed,
    progress: (xp - accumulated) / needed,
  };
}
