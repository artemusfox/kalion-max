// ═══════════════════════════════════════════════════════════
// AUTO-PROGRESSION
// Schaut letztes Workout pro Übung an und schlägt sinnvolle
// nächste Werte (Reps, Gewicht) vor.
// Strategie:
//  - Wenn letztes Mal ALLE Sätze mit Ziel-Reps geschafft → +2.5 kg
//  - Wenn knapp dran → gleiche Werte
//  - Sonst → unverändert
// ═══════════════════════════════════════════════════════════

import type { TrackingMode } from "./types";

export type LastSet = {
  reps?: number;
  weight?: number;
  time?: number;
  distance?: number;
  done: boolean;
};

export type LastExerciseEntry = {
  id: string;
  sets: LastSet[];
  date: string;
};

export type Suggestion = {
  reps?: number;
  weight?: number;
  time?: number;
  distance?: number;
  reason: string;
};

const PROGRESSION_KG = 2.5;     // Standard-Sprung beim Lift
const PROGRESSION_KG_SMALL = 1; // Für Isolations-Übungen (TODO später)

export function suggestNextTargets(
  last: LastExerciseEntry | null,
  tracking: TrackingMode,
  fallback: { reps?: number; weight?: number; time?: number; distance?: number }
): Suggestion {
  if (!last || last.sets.length === 0) {
    return { ...fallback, reason: "Keine Historie — Plan-Vorgabe" };
  }

  const doneSets = last.sets.filter((s) => s.done);
  if (doneSets.length === 0) {
    return { ...fallback, reason: "Letztes Mal nicht abgeschlossen" };
  }

  if (tracking === "reps_weight") {
    const lastWeight = doneSets[0]?.weight ?? fallback.weight ?? 0;
    const targetReps = fallback.reps ?? doneSets[0]?.reps ?? 0;
    const allHit = doneSets.every((s) => (s.reps ?? 0) >= targetReps);
    if (allHit && lastWeight > 0) {
      return {
        reps: targetReps,
        weight: lastWeight + PROGRESSION_KG,
        reason: `Letztes Mal alle Reps geschafft → +${PROGRESSION_KG} kg`,
      };
    }
    return {
      reps: targetReps,
      weight: lastWeight,
      reason: "Wie letztes Mal — Form festigen",
    };
  }

  if (tracking === "reps_only") {
    const targetReps = fallback.reps ?? 0;
    const allHit = doneSets.every((s) => (s.reps ?? 0) >= targetReps);
    if (allHit) {
      return { reps: targetReps + 1, reason: "Alle Reps geschafft → +1 Wdh." };
    }
    return { reps: targetReps, reason: "Wie letztes Mal" };
  }

  if (tracking === "time") {
    const lastTime = doneSets[0]?.time ?? fallback.time ?? 0;
    const target = fallback.time ?? lastTime;
    if (lastTime >= target) {
      return { time: lastTime + 5, reason: "Letztes Mal gehalten → +5 s" };
    }
    return { time: target, reason: "Wie letztes Mal" };
  }

  if (tracking === "distance" || tracking === "time_distance") {
    return {
      distance: fallback.distance,
      time: fallback.time,
      reason: "Plan-Vorgabe",
    };
  }

  return { ...fallback, reason: "" };
}

// Aus den letzten Workouts pro Übung die jüngste Performance extrahieren
export function buildHistoryMap(
  workouts: { exercises_data: any; started_at: string }[]
): Record<string, LastExerciseEntry> {
  const map: Record<string, LastExerciseEntry> = {};
  // Workouts sind in absteigender Reihenfolge → erste Eintragung pro Übung gewinnt
  for (const w of workouts) {
    const arr = Array.isArray(w.exercises_data) ? w.exercises_data : [];
    for (const e of arr) {
      const id = e?.id;
      if (!id || map[id]) continue;
      map[id] = {
        id,
        sets: Array.isArray(e?.sets) ? e.sets : [],
        date: w.started_at,
      };
    }
  }
  return map;
}
