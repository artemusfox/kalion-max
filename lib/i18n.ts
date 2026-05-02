// ═══════════════════════════════════════════════════════════
// Mehrsprachigkeit — aktuell DE + EN
// Erweiterbar: weitere Sprache hinzufügen → Lang-Type + Translations-Eintrag
// ═══════════════════════════════════════════════════════════

export type Lang = "de" | "en";

export const LANGUAGES: { id: Lang; label: string; flag: string }[] = [
  { id: "de", label: "Deutsch", flag: "🇩🇪" },
  { id: "en", label: "English", flag: "🇬🇧" },
];

type Dict = Record<string, { de: string; en: string }>;

export const T: Dict = {
  // Hero
  "home.tagline.html": {
    de: "Deine Trainings-App für <strong>alle Sportarten</strong>. Plane, tracke und dominiere dein Training — egal ob Kurzhantel, Barren, Asphalt oder Yoga-Matte.",
    en: "Your training app for <strong>all sports</strong>. Plan, track, and dominate your training — whether dumbbell, parallettes, asphalt or yoga mat.",
  },
  "home.cta.signup": { de: "Kostenlos starten →", en: "Get started — free →" },
  "home.cta.login":  { de: "Einloggen",            en: "Sign in" },

  // Sport grid header
  "home.sports.heading": { de: "Für jede Sportart", en: "Every sport" },
  "sport.strength":      { de: "Gym & Gewicht",     en: "Gym & Weights" },
  "sport.calisthenics":  { de: "Calisthenics",      en: "Calisthenics" },
  "sport.cardio":        { de: "Cardio",            en: "Cardio" },
  "sport.hiit":          { de: "HIIT / Functional", en: "HIIT / Functional" },
  "sport.mobility":      { de: "Mobility / Yoga",   en: "Mobility / Yoga" },

  // Features grid
  "home.feat.plans.title":    { de: "Flexible Pläne",  en: "Flexible plans" },
  "home.feat.plans.desc":     {
    de: "Vorlagen nutzen oder komplett eigene Workouts erstellen",
    en: "Use templates or build your own workouts from scratch",
  },
  "home.feat.tracking.title": { de: "Smart-Tracking",  en: "Smart tracking" },
  "home.feat.tracking.desc":  {
    de: "Gewicht, Reps, Zeit, Distanz — je nach Übung passend",
    en: "Weight, reps, time, distance — fits any exercise",
  },
  "home.feat.progress.title": { de: "Fortschritt",     en: "Progress" },
  "home.feat.progress.desc":  {
    de: "PRs, Level, XP, Badges und Streak-System",
    en: "PRs, levels, XP, badges and streak system",
  },
  "home.feat.body.title":     { de: "Körperdaten",     en: "Body metrics" },
  "home.feat.body.desc":      {
    de: "Messungen, Fotos, Ernährung und Recovery",
    en: "Measurements, photos, nutrition and recovery",
  },

  // Language switcher
  "lang.label": { de: "Sprache", en: "Language" },
};

export function t(key: keyof typeof T, lang: Lang): string {
  const entry = T[key];
  if (!entry) return key as string;
  return entry[lang] ?? entry.de;
}
