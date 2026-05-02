// ═══════════════════════════════════════════════════════════
// Einheiten & Hantelscheiben — User-konfigurierbar
// ═══════════════════════════════════════════════════════════

export type UnitSystem = "metric" | "imperial";

export const DEFAULT_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
export const DEFAULT_PLATES_LB = [45, 35, 25, 15, 10, 5, 2.5];
export const DEFAULT_BAR_KG = 20;
export const DEFAULT_BAR_LB = 45;

export type PlateSettings = {
  bar: number;          // Stangengewicht
  plates: number[];     // verfügbare Scheiben (sortiert absteigend)
};

export type UserPrefs = {
  units: UnitSystem;
  distance: "km" | "mi";
  plates: PlateSettings;
};

export const DEFAULT_PREFS: UserPrefs = {
  units: "metric",
  distance: "km",
  plates: { bar: DEFAULT_BAR_KG, plates: DEFAULT_PLATES_KG },
};

// Aus profiles.units + profiles.settings extrahieren
export function readPrefs(profile: any): UserPrefs {
  if (!profile) return DEFAULT_PREFS;
  const units: UnitSystem = profile.units === "imperial" ? "imperial" : "metric";
  const settings = profile.settings || {};
  const plates = settings.plates as PlateSettings | undefined;
  return {
    units,
    distance: settings.distance === "mi" ? "mi" : "km",
    plates: plates && plates.bar && Array.isArray(plates.plates)
      ? { bar: plates.bar, plates: [...plates.plates].sort((a, b) => b - a) }
      : { bar: units === "imperial" ? DEFAULT_BAR_LB : DEFAULT_BAR_KG,
          plates: units === "imperial" ? DEFAULT_PLATES_LB : DEFAULT_PLATES_KG },
  };
}

export function unitLabel(prefs: UserPrefs): "kg" | "lb" {
  return prefs.units === "imperial" ? "lb" : "kg";
}

export function distanceLabel(prefs: UserPrefs): "km" | "mi" {
  return prefs.distance;
}

// Greedy-Verteilung: pro Seite das schwerste Plate, das reinpasst
export function calculatePlatesPerSide(totalWeight: number, prefs: PlateSettings): {
  plates: number[];   // pro Seite
  remaining: number;  // wenn nicht exakt aufzulösen
} {
  if (totalWeight <= prefs.bar) return { plates: [], remaining: 0 };
  const perSide = (totalWeight - prefs.bar) / 2;
  const result: number[] = [];
  let left = perSide;
  for (const p of prefs.plates) {
    while (left + 0.0001 >= p) {
      result.push(p);
      left -= p;
    }
  }
  return { plates: result, remaining: Math.max(0, left) };
}
