// Translates Sport / MuscleGroup / Equipment keys via i18n dict.
// Use these in client components instead of the static *_LABELS Records in types.ts.

import type { Sport, MuscleGroup, Equipment } from "./types";
import { tr, type Lang, type TKey } from "./i18n";

export function sportLabel(s: Sport, lang: Lang): string {
  return tr(`sport.${s}` as TKey, lang);
}

export function muscleLabel(m: MuscleGroup, lang: Lang): string {
  return tr(`muscle.${m}` as TKey, lang);
}

export function equipmentLabel(e: Equipment, lang: Lang): string {
  return tr(`eq.${e}` as TKey, lang);
}
