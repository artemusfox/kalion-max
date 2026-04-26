// ═══════════════════════════════════════
// KALION MAX — Exercise Library
// Vollständige Übungs-Datenbank über alle Sportarten
// ═══════════════════════════════════════

import { Exercise } from "./types";

export const EXERCISES: Exercise[] = [
  // ═══════════════════════════════════════
  // STRENGTH / GYM
  // ═══════════════════════════════════════
  // Chest
  { id: "bench_press", name: "Bankdrücken", sport: "strength", muscle: "chest", equipment: "barbell", tracking: "reps_weight", tip: "Flache Bank, Ellbogen ca. 45°, Schulterblätter zusammen.", defaultRest: 120 },
  { id: "incline_bench", name: "Schrägbankdrücken", sport: "strength", muscle: "chest", equipment: "barbell", tracking: "reps_weight", tip: "30-45° Neigung — betont obere Brust.", defaultRest: 120 },
  { id: "dumbbell_press", name: "Kurzhantel-Bankdrücken", sport: "strength", muscle: "chest", equipment: "dumbbell", tracking: "reps_weight", tip: "Mehr Bewegungsumfang als Langhantel.", defaultRest: 90 },
  { id: "db_flyes", name: "Kurzhantel-Flys", sport: "strength", muscle: "chest", equipment: "dumbbell", tracking: "reps_weight", tip: "Leichte Beugung in den Ellbogen halten.", defaultRest: 75 },
  { id: "cable_crossover", name: "Cable Crossover", sport: "strength", muscle: "chest", equipment: "cable", tracking: "reps_weight", tip: "Arme vor der Brust kreuzen für maximale Kontraktion.", defaultRest: 75 },

  // Back
  { id: "deadlift", name: "Kreuzheben", sport: "strength", muscle: "back", equipment: "barbell", tracking: "reps_weight", tip: "Neutraler Rücken, Hantel nah am Körper, Hüfte drückt durch.", defaultRest: 180 },
  { id: "barbell_row", name: "Langhantel-Rudern", sport: "strength", muscle: "back", equipment: "barbell", tracking: "reps_weight", tip: "Oberkörper ~45°, zur Bauchnabel ziehen.", defaultRest: 120 },
  { id: "pullup", name: "Klimmzug", sport: "strength", muscle: "back", equipment: "pullup_bar", tracking: "reps_only", tip: "Kinn über Stange, kontrolliert ab.", defaultRest: 120 },
  { id: "lat_pulldown", name: "Latzug", sport: "strength", muscle: "back", equipment: "machine", tracking: "reps_weight", tip: "Breiter Griff, zur Brust ziehen.", defaultRest: 90 },
  { id: "seated_row", name: "Rudern sitzend", sport: "strength", muscle: "back", equipment: "machine", tracking: "reps_weight", tip: "Rücken gerade, Schulterblätter zusammen.", defaultRest: 90 },

  // Shoulders
  { id: "ohp", name: "Military Press", sport: "strength", muscle: "shoulders", equipment: "barbell", tracking: "reps_weight", tip: "Hantel über Kopf drücken — stabiler Core!", defaultRest: 120 },
  { id: "db_shoulder_press", name: "KH Schulterdrücken", sport: "strength", muscle: "shoulders", equipment: "dumbbell", tracking: "reps_weight", tip: "Sitzend oder stehend, Ellbogen unter Händen.", defaultRest: 90 },
  { id: "lateral_raise", name: "Seitheben", sport: "strength", muscle: "shoulders", equipment: "dumbbell", tracking: "reps_weight", tip: "Leicht gebeugt, bis Schulterhöhe heben.", defaultRest: 60 },
  { id: "face_pull", name: "Face Pull", sport: "strength", muscle: "shoulders", equipment: "cable", tracking: "reps_weight", tip: "Hoher Seilzug, zum Gesicht ziehen.", defaultRest: 60 },
  { id: "rear_delt_fly", name: "Reverse Flys", sport: "strength", muscle: "shoulders", equipment: "dumbbell", tracking: "reps_weight", tip: "Für die hintere Schulter.", defaultRest: 60 },

  // Arms
  { id: "bicep_curl", name: "Bizeps Curls", sport: "strength", muscle: "arms", equipment: "dumbbell", tracking: "reps_weight", tip: "Ellbogen fixiert, nicht schwingen.", defaultRest: 60 },
  { id: "hammer_curl", name: "Hammer Curls", sport: "strength", muscle: "arms", equipment: "dumbbell", tracking: "reps_weight", tip: "Neutraler Griff — trifft auch Brachialis.", defaultRest: 60 },
  { id: "tricep_pushdown", name: "Trizeps Pushdown", sport: "strength", muscle: "arms", equipment: "cable", tracking: "reps_weight", tip: "Ellbogen am Körper, nur Unterarm bewegt sich.", defaultRest: 60 },
  { id: "skullcrusher", name: "Skullcrusher", sport: "strength", muscle: "arms", equipment: "barbell", tracking: "reps_weight", tip: "Ellbogen bleiben fixiert.", defaultRest: 75 },
  { id: "preacher_curl", name: "Preacher Curl", sport: "strength", muscle: "arms", equipment: "dumbbell", tracking: "reps_weight", tip: "Volle Dehnung unten, keine Schwung.", defaultRest: 60 },

  // Legs
  { id: "back_squat", name: "Kniebeuge", sport: "strength", muscle: "legs", equipment: "barbell", tracking: "reps_weight", tip: "Tief, Knie über Zehen, gerader Rücken.", defaultRest: 180 },
  { id: "front_squat", name: "Front Squat", sport: "strength", muscle: "legs", equipment: "barbell", tracking: "reps_weight", tip: "Hantel auf Schultern — aufrechter Oberkörper.", defaultRest: 150 },
  { id: "leg_press", name: "Beinpresse", sport: "strength", muscle: "legs", equipment: "machine", tracking: "reps_weight", tip: "Nicht in Hohlkreuz drücken.", defaultRest: 120 },
  { id: "leg_curl", name: "Beinbeuger", sport: "strength", muscle: "legs", equipment: "machine", tracking: "reps_weight", tip: "Für Hamstrings.", defaultRest: 75 },
  { id: "leg_extension", name: "Beinstrecker", sport: "strength", muscle: "legs", equipment: "machine", tracking: "reps_weight", tip: "Für Quadrizeps isoliert.", defaultRest: 75 },
  { id: "rdl", name: "Rumänisches Kreuzheben", sport: "strength", muscle: "legs", equipment: "barbell", tracking: "reps_weight", tip: "Hüfte nach hinten, leichte Knie-Beugung.", defaultRest: 120 },
  { id: "lunges_weighted", name: "Ausfallschritte", sport: "strength", muscle: "legs", equipment: "dumbbell", tracking: "reps_weight", tip: "Hinteres Knie fast zum Boden.", defaultRest: 90 },

  // Glutes
  { id: "hip_thrust", name: "Hip Thrusts", sport: "strength", muscle: "glutes", equipment: "barbell", tracking: "reps_weight", tip: "Oben 1 Sek Po anspannen.", defaultRest: 90 },
  { id: "glute_bridge", name: "Glute Bridge", sport: "strength", muscle: "glutes", equipment: "none", tracking: "reps_only", tip: "Oben halten, Po anspannen.", defaultRest: 45 },

  // Core (Strength)
  { id: "weighted_plank", name: "Plank (gewichtet)", sport: "strength", muscle: "core", equipment: "none", tracking: "time", tip: "Scheibe auf Rücken für extra Reiz.", defaultRest: 60 },
  { id: "cable_crunch", name: "Cable Crunch", sport: "strength", muscle: "core", equipment: "cable", tracking: "reps_weight", tip: "Bauchmuskeln kontrahieren — nicht die Arme.", defaultRest: 60 },

  // ═══════════════════════════════════════
  // CALISTHENICS
  // ═══════════════════════════════════════
  { id: "pushup", name: "Liegestütze", sport: "calisthenics", muscle: "chest", equipment: "none", tracking: "reps_only", tip: "Schulterbreit, Ellbogen ca. 45°, Körperspannung halten.", defaultRest: 75 },
  { id: "knee_pushup", name: "Knie-Liegestütze", sport: "calisthenics", muscle: "chest", equipment: "none", tracking: "reps_only", tip: "Knie am Boden — leichter als normale.", defaultRest: 60 },
  { id: "incline_pushup", name: "Liegestütze (erhöht)", sport: "calisthenics", muscle: "chest", equipment: "none", tracking: "reps_only", tip: "Hände auf Stuhl/Bank — leichter.", defaultRest: 60 },
  { id: "diamond_pushup", name: "Diamond Push-ups", sport: "calisthenics", muscle: "arms", equipment: "none", tracking: "reps_only", tip: "Enge Hände — Trizeps-Fokus.", defaultRest: 75 },
  { id: "pike_pushup", name: "Pike Push-ups", sport: "calisthenics", muscle: "shoulders", equipment: "none", tracking: "reps_only", tip: "Gesäß hoch (umgekehrtes V).", defaultRest: 75 },
  { id: "archer_pushup", name: "Archer Push-ups", sport: "calisthenics", muscle: "chest", equipment: "none", tracking: "reps_only", tip: "Ein Arm gestreckt, anderer drückt.", defaultRest: 90 },
  { id: "dips_bars", name: "Dips", sport: "calisthenics", muscle: "chest", equipment: "parallettes", tracking: "reps_only", tip: "Brust leicht vor — zielt auf Brust.", defaultRest: 90 },
  { id: "aus_pullup", name: "Australische Klimmzüge", sport: "calisthenics", muscle: "back", equipment: "pullup_bar", tracking: "reps_only", tip: "Stange Hüfthöhe, Körper gerade ziehen.", defaultRest: 75 },
  { id: "neg_pullup", name: "Negative Klimmzüge", sport: "calisthenics", muscle: "back", equipment: "pullup_bar", tracking: "reps_only", tip: "Von oben langsam ab (4-5s).", defaultRest: 90 },
  { id: "chinup", name: "Chin-ups", sport: "calisthenics", muscle: "back", equipment: "pullup_bar", tracking: "reps_only", tip: "Untergriff — mehr Bizeps.", defaultRest: 120 },
  { id: "deadhang", name: "Dead Hang", sport: "calisthenics", muscle: "back", equipment: "pullup_bar", tracking: "time", tip: "Schultern aktiv.", defaultRest: 60 },
  { id: "bw_squat", name: "Bodyweight Squats", sport: "calisthenics", muscle: "legs", equipment: "none", tracking: "reps_only", tip: "Tief, Knie über Zehen.", defaultRest: 60 },
  { id: "pistol_squat", name: "Pistol Squats", sport: "calisthenics", muscle: "legs", equipment: "none", tracking: "reps_only", tip: "Frei einbeinig — braucht Balance.", defaultRest: 120 },
  { id: "bulgarian_split", name: "Bulgarian Split Squats", sport: "calisthenics", muscle: "legs", equipment: "bench", tracking: "reps_only", tip: "Hinterer Fuß erhöht.", defaultRest: 75 },
  { id: "nordic_curl", name: "Nordic Curls", sport: "calisthenics", muscle: "legs", equipment: "none", tracking: "reps_only", tip: "Füße fixiert, langsam vorfallen.", defaultRest: 120 },
  { id: "plank", name: "Plank Hold", sport: "calisthenics", muscle: "core", equipment: "none", tracking: "time", tip: "Gerade Linie, Bauch anspannen.", defaultRest: 60 },
  { id: "hollow_body", name: "Hollow Body Hold", sport: "calisthenics", muscle: "core", equipment: "none", tracking: "time", tip: "Rückenlage, unterer Rücken am Boden.", defaultRest: 60 },
  { id: "l_sit", name: "L-Sit", sport: "calisthenics", muscle: "core", equipment: "parallettes", tracking: "time", tip: "Beine waagerecht halten.", defaultRest: 90 },
  { id: "dragon_flag", name: "Dragon Flags", sport: "calisthenics", muscle: "core", equipment: "none", tracking: "reps_only", tip: "Körper gerade von Schultern aus.", defaultRest: 120 },
  { id: "handstand_wall", name: "Handstand an der Wand", sport: "calisthenics", muscle: "shoulders", equipment: "none", tracking: "time", tip: "Bauch zur Wand, Hände ~20cm davor.", defaultRest: 90 },
  { id: "muscle_up", name: "Muscle-up", sport: "calisthenics", muscle: "back", equipment: "pullup_bar", tracking: "reps_only", tip: "Explosiv hoch, Ellbogen über Stange.", defaultRest: 150 },

  // ═══════════════════════════════════════
  // CARDIO
  // ═══════════════════════════════════════
  { id: "running", name: "Laufen", sport: "cardio", muscle: "cardio", equipment: "none", tracking: "time_distance", tip: "Nach Atem und Puls steuern.", defaultRest: 0 },
  { id: "treadmill_run", name: "Laufband", sport: "cardio", muscle: "cardio", equipment: "treadmill", tracking: "time_distance", tip: "1-2% Steigung simuliert Outdoor.", defaultRest: 0 },
  { id: "cycling", name: "Radfahren", sport: "cardio", muscle: "cardio", equipment: "bike", tracking: "time_distance", tip: "Verschiedene Trittfrequenzen testen.", defaultRest: 0 },
  { id: "rowing", name: "Rudern", sport: "cardio", muscle: "cardio", equipment: "rower", tracking: "time_distance", tip: "Beine drücken — dann Arme ziehen.", defaultRest: 0 },
  { id: "elliptical", name: "Crosstrainer", sport: "cardio", muscle: "cardio", equipment: "machine", tracking: "time_distance", tip: "Gelenkschonend, ganzer Körper.", defaultRest: 0 },
  { id: "stair_climber", name: "Stairmaster", sport: "cardio", muscle: "cardio", equipment: "machine", tracking: "time", tip: "Fokus auf Beine.", defaultRest: 0 },
  { id: "jumprope", name: "Seilspringen", sport: "cardio", muscle: "cardio", equipment: "jumprope", tracking: "time", tip: "Ellbogen am Körper, kleine Sprünge.", defaultRest: 60 },
  { id: "swimming", name: "Schwimmen", sport: "cardio", muscle: "cardio", equipment: "none", tracking: "time_distance", tip: "Technik wichtiger als Geschwindigkeit.", defaultRest: 0 },

  // ═══════════════════════════════════════
  // HIIT / FUNCTIONAL
  // ═══════════════════════════════════════
  { id: "burpee", name: "Burpees", sport: "hiit", muscle: "fullbody", equipment: "none", tracking: "reps_only", tip: "Brust zum Boden, dann Sprung.", defaultRest: 45 },
  { id: "kb_swing", name: "Kettlebell Swings", sport: "hiit", muscle: "fullbody", equipment: "kettlebell", tracking: "reps_weight", tip: "Kraft aus Hüfte, nicht Schultern.", defaultRest: 60 },
  { id: "box_jump", name: "Box Jumps", sport: "hiit", muscle: "legs", equipment: "bench", tracking: "reps_only", tip: "Kontrolliert landen, Box hochlaufen.", defaultRest: 75 },
  { id: "mountain_climber", name: "Mountain Climbers", sport: "hiit", muscle: "core", equipment: "none", tracking: "reps_only", tip: "Plank-Position, Knie zur Brust.", defaultRest: 45 },
  { id: "jumping_lunges", name: "Jumping Lunges", sport: "hiit", muscle: "legs", equipment: "none", tracking: "reps_only", tip: "Explosiv wechseln.", defaultRest: 60 },
  { id: "thruster", name: "Thruster", sport: "hiit", muscle: "fullbody", equipment: "barbell", tracking: "reps_weight", tip: "Squat + Push Press kombiniert.", defaultRest: 90 },
  { id: "wall_ball", name: "Wall Balls", sport: "hiit", muscle: "fullbody", equipment: "none", tracking: "reps_weight", tip: "Squat + Wurf an Wand.", defaultRest: 60 },
  { id: "battle_rope", name: "Battle Ropes", sport: "hiit", muscle: "cardio", equipment: "none", tracking: "time", tip: "Schnelle Wellen, Kern stabil.", defaultRest: 45 },
  { id: "clean", name: "Clean", sport: "hiit", muscle: "fullbody", equipment: "barbell", tracking: "reps_weight", tip: "Boden → Schulter in einer explosiven Bewegung.", defaultRest: 120 },
  { id: "snatch", name: "Snatch", sport: "hiit", muscle: "fullbody", equipment: "barbell", tracking: "reps_weight", tip: "Boden → über Kopf, einarmige Varianten möglich.", defaultRest: 120 },

  // ═══════════════════════════════════════
  // MOBILITY / YOGA
  // ═══════════════════════════════════════
  { id: "sun_salutation", name: "Sonnengruß", sport: "mobility", muscle: "fullbody", equipment: "mat", tracking: "time", tip: "Fließende Bewegung — mit Atem sync.", defaultRest: 30 },
  { id: "downward_dog", name: "Downward Dog", sport: "mobility", muscle: "fullbody", equipment: "mat", tracking: "time", tip: "Fersen zum Boden drücken.", defaultRest: 30 },
  { id: "pigeon_pose", name: "Taube", sport: "mobility", muscle: "glutes", equipment: "mat", tracking: "time", tip: "Tiefe Hüftöffnung.", defaultRest: 30 },
  { id: "couch_stretch", name: "Couch Stretch", sport: "mobility", muscle: "legs", equipment: "mat", tracking: "time", tip: "Fuß an Wand, tiefe Hüftbeuger-Dehnung.", defaultRest: 30 },
  { id: "cat_cow", name: "Cat-Cow", sport: "mobility", muscle: "back", equipment: "mat", tracking: "reps_only", tip: "Abwechselnd runden und ausstrecken.", defaultRest: 30 },
  { id: "cobra", name: "Kobra", sport: "mobility", muscle: "back", equipment: "mat", tracking: "time", tip: "Brust heben, Hüfte am Boden.", defaultRest: 30 },
  { id: "warrior_2", name: "Krieger II", sport: "mobility", muscle: "legs", equipment: "mat", tracking: "time", tip: "Tiefe Ausfallstellung, Arme parallel.", defaultRest: 30 },
  { id: "childs_pose", name: "Kindhaltung", sport: "mobility", muscle: "back", equipment: "mat", tracking: "time", tip: "Regenerative Pose — tief atmen.", defaultRest: 30 },
  { id: "shoulder_stretch", name: "Schulter-Dehnung", sport: "mobility", muscle: "shoulders", equipment: "mat", tracking: "time", tip: "Arm über Körper ziehen.", defaultRest: 20 },
  { id: "hamstring_stretch", name: "Hamstring-Dehnung", sport: "mobility", muscle: "legs", equipment: "mat", tracking: "time", tip: "Gestreckte Beine, vorbeugen.", defaultRest: 20 },
  { id: "foam_roll", name: "Foam Rolling", sport: "mobility", muscle: "fullbody", equipment: "mat", tracking: "time", tip: "Schmerzpunkte langsam ausrollen.", defaultRest: 20 },
];

export const EX_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): Exercise | undefined {
  return EX_BY_ID[id];
}
