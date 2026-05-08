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
  | "planner"
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
  "planner",
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
  planner: true,
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

export function readWidgetOrder(profileSettings: any): WidgetId[] {
  const stored = profileSettings?.dashboard_widgets_order;
  if (!Array.isArray(stored)) return [...ALL_WIDGETS];
  const known = new Set<WidgetId>();
  const result: WidgetId[] = [];
  for (const w of stored) {
    if (ALL_WIDGETS.includes(w as WidgetId) && !known.has(w as WidgetId)) {
      result.push(w as WidgetId);
      known.add(w as WidgetId);
    }
  }
  // Falls neue Widget-IDs hinzugekommen sind: hinten anhängen
  for (const w of ALL_WIDGETS) {
    if (!known.has(w)) result.push(w);
  }
  return result;
}
