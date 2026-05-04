// ═══════════════════════════════════════════════════════════
// React-Hooks für übersetzte Daten — fasst data-translations.ts mit
// dem aktuellen Sprach-Kontext zusammen.
// ═══════════════════════════════════════════════════════════

"use client";

import { useLanguage } from "@/components/LanguageProvider";
import {
  exerciseName, exerciseTip,
  badgeName, badgeDesc,
  templateName, templateDesc,
  foodName, foodCategoryName, servingUnit,
  supplementName, supplementPurpose,
  dayName, dayLabelTr,
} from "./data-translations";
import type { Exercise } from "./types";

export function useTranslatedData() {
  const { lang } = useLanguage();
  return {
    exName:    (ex: Exercise) => exerciseName(ex.id, ex.name, lang),
    exTip:     (ex: Exercise) => exerciseTip(ex.id, ex.tip, lang),
    badgeName: (key: string, fallback: string) => badgeName(key, fallback, lang),
    badgeDesc: (key: string, fallback: string) => badgeDesc(key, fallback, lang),
    tplName:   (id: string, fallback: string) => templateName(id, fallback, lang),
    tplDesc:   (id: string, fallback: string) => templateDesc(id, fallback, lang),
    foodName:  (id: string, fallback: string) => foodName(id, fallback, lang),
    foodCat:   (key: string, fallback: string) => foodCategoryName(key, fallback, lang),
    servingUnit: (s: string) => servingUnit(s, lang),
    suppName:  (key: string, fallback: string) => supplementName(key, fallback, lang),
    suppPurpose: (key: string, fallback: string) => supplementPurpose(key, fallback, lang),
    dayName:   (n: string) => dayName(n, lang),
    dayLabel:  (l: string) => dayLabelTr(l, lang),
  };
}
