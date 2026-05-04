// ═══════════════════════════════════════════════════════════
// Dashboard-Widget-Configuration
// User entscheidet welche Module er auf dem Dashboard sehen will.
// Settings liegen in profiles.settings.dashboard_widgets.
// ═══════════════════════════════════════════════════════════

export type WidgetId =
  | "hero"
  | "activity"
  | "active_plan"
  | "routine_morning"
  | "habits"
  | "routine_evening"
  | "level_stats"
  | "recent"
  | "features";

export const ALL_WIDGETS: WidgetId[] = [
  "hero",
  "activity",
  "active_plan",
  "routine_morning",
  "habits",
  "routine_evening",
  "level_stats",
  "recent",
  "features",
];

export const DEFAULT_WIDGETS: Record<WidgetId, boolean> = {
  hero: true,
  activity: true,
  active_plan: true,
  routine_morning: true,
  habits: true,
  routine_evening: true,
  level_stats: true,
  recent: true,
  features: true,
};

export function readWidgetSettings(profileSettings: any): Record<WidgetId, boolean> {
  const stored = profileSettings?.dashboard_widgets;
  if (!stored || typeof stored !== "object") return { ...DEFAULT_WIDGETS };
  const result: Record<WidgetId, boolean> = { ...DEFAULT_WIDGETS };
  for (const id of ALL_WIDGETS) {
    if (id in stored) result[id] = !!stored[id];
  }
  return result;
}
