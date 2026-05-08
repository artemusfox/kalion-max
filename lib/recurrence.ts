// ═══════════════════════════════════════════════════════════
// Recurrence — Wiederkehrende Tasks
// Format: "daily" | "weekly:0..6" (0=Mon, 6=Sun) | "monthly:1..31" | "yearly"
// ═══════════════════════════════════════════════════════════

export type RecurrenceRule = string; // siehe Format oben

export type RecurrenceKind = "daily" | "weekly" | "monthly" | "yearly" | null;

export function parseRecurrence(rule: string | null | undefined): {
  kind: RecurrenceKind;
  weekday?: number;
  monthDay?: number;
} {
  if (!rule) return { kind: null };
  if (rule === "daily") return { kind: "daily" };
  if (rule === "yearly") return { kind: "yearly" };
  if (rule.startsWith("weekly:")) {
    const wd = parseInt(rule.slice("weekly:".length), 10);
    if (Number.isFinite(wd) && wd >= 0 && wd <= 6) return { kind: "weekly", weekday: wd };
  }
  if (rule.startsWith("monthly:")) {
    const md = parseInt(rule.slice("monthly:".length), 10);
    if (Number.isFinite(md) && md >= 1 && md <= 31) return { kind: "monthly", monthDay: md };
  }
  return { kind: null };
}

// ISO-Datum (YYYY-MM-DD) der nächsten Occurrence. `from` ist das aktuelle Fälligkeits-Datum
// (oder heute falls keins). Returns null wenn rule ungültig oder Cap erreicht.
export function nextOccurrence(
  rule: string | null | undefined,
  fromDate: Date,
  until?: Date | null
): string | null {
  const parsed = parseRecurrence(rule);
  if (!parsed.kind) return null;

  const next = new Date(fromDate.getTime());
  next.setHours(0, 0, 0, 0);

  if (parsed.kind === "daily") {
    next.setDate(next.getDate() + 1);
  } else if (parsed.kind === "weekly" && typeof parsed.weekday === "number") {
    // Mo=0 in unserer Convention; getDay() liefert So=0..Sa=6, also Mo=1..So=0
    const todayDow = (next.getDay() + 6) % 7; // Mo=0..So=6
    let delta = parsed.weekday - todayDow;
    if (delta <= 0) delta += 7;
    next.setDate(next.getDate() + delta);
  } else if (parsed.kind === "monthly" && typeof parsed.monthDay === "number") {
    // Nächster Monat, gleicher Tag (oder Monatsende-Cap)
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(parsed.monthDay, lastDay));
  } else if (parsed.kind === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  }

  if (until && next > until) return null;
  return next.toISOString().slice(0, 10);
}

export function recurrenceLabel(rule: string | null | undefined, lang: "de" | "en"): string {
  const parsed = parseRecurrence(rule);
  if (!parsed.kind) return "";
  const days = lang === "en"
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  if (parsed.kind === "daily")  return lang === "en" ? "Daily" : "Täglich";
  if (parsed.kind === "weekly") return (lang === "en" ? "Every " : "Jeden ") + (days[parsed.weekday ?? 0] || "");
  if (parsed.kind === "monthly")return (lang === "en" ? `Monthly on ${parsed.monthDay}` : `Monatlich am ${parsed.monthDay}.`);
  if (parsed.kind === "yearly") return lang === "en" ? "Yearly" : "Jährlich";
  return "";
}

// Optionen für Picker-UI
export const RECURRENCE_OPTIONS: { value: string; label_de: string; label_en: string }[] = [
  { value: "",            label_de: "Einmalig",     label_en: "Once" },
  { value: "daily",       label_de: "Täglich",      label_en: "Daily" },
  { value: "weekly:0",    label_de: "Jeden Mo",     label_en: "Every Mon" },
  { value: "weekly:1",    label_de: "Jeden Di",     label_en: "Every Tue" },
  { value: "weekly:2",    label_de: "Jeden Mi",     label_en: "Every Wed" },
  { value: "weekly:3",    label_de: "Jeden Do",     label_en: "Every Thu" },
  { value: "weekly:4",    label_de: "Jeden Fr",     label_en: "Every Fri" },
  { value: "weekly:5",    label_de: "Jeden Sa",     label_en: "Every Sat" },
  { value: "weekly:6",    label_de: "Jeden So",     label_en: "Every Sun" },
  { value: "monthly:1",   label_de: "Monatl. (1.)", label_en: "Monthly (1st)" },
  { value: "monthly:15",  label_de: "Monatl. (15.)",label_en: "Monthly (15th)" },
  { value: "yearly",      label_de: "Jährlich",     label_en: "Yearly" },
];
