"use client";

// Zeigt das Open-Food-Facts-Ergebnis nach Barcode-Scan
// + erlaubt Portionsgröße + Mahlzeit-Typ + speichern als meal_entry

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/components/LanguageProvider";

type Props = {
  barcode: string;
  onClose: () => void;
  onSaved: () => void;
};

type Lookup = {
  found: boolean;
  barcode: string;
  name: string;
  brand: string | null;
  image: string | null;
  serving_size: number | null;
  per_100g: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    fiber: number | null;
    sugar: number | null;
    salt: number | null;
  };
  per_serving: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null } | null;
  nutriscore: string | null;
  nova: number | null;
  ingredients: string | null;
  allergens: string[];
};

const MEAL_TYPES = [
  { id: "breakfast", de: "🌅 Frühstück", en: "🌅 Breakfast" },
  { id: "lunch",     de: "🍽️ Mittag",     en: "🍽️ Lunch" },
  { id: "dinner",    de: "🌙 Abend",     en: "🌙 Dinner" },
  { id: "snack",     de: "🍎 Snack",     en: "🍎 Snack" },
];

function guessMealType(): string {
  const h = new Date().getHours();
  if (h < 10) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 18) return "snack";
  return "dinner";
}

export default function BarcodeScanResult({ barcode, onClose, onSaved }: Props) {
  const { lang } = useLanguage();
  const { toast } = useToast();

  const [data, setData] = useState<Lookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [grams, setGrams] = useState(100);
  const [meal, setMeal] = useState<string>(guessMealType());
  const [saving, setSaving] = useState(false);

  // Lookup ausführen
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/food/lookup?barcode=${encodeURIComponent(barcode)}`);
        if (r.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        if (!r.ok) {
          toast(lang === "en" ? "Lookup failed" : "Lookup fehlgeschlagen", { type: "error" });
          setLoading(false);
          return;
        }
        const json = (await r.json()) as Lookup;
        setData(json);
        // Default Portion: serving_size aus OFF wenn vorhanden, sonst 100g
        if (json.serving_size && json.serving_size > 0 && json.serving_size < 1000) {
          setGrams(Math.round(json.serving_size));
        }
        setLoading(false);
      } catch (e: any) {
        toast(e?.message || "Error", { type: "error" });
        setLoading(false);
      }
    })();
  }, [barcode, lang, toast]);

  // Berechne Werte für die aktuell gewählten Gramm
  function calc(per100: number | null): number {
    if (per100 == null) return 0;
    return Math.round((per100 * grams) / 100 * 10) / 10;
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      toast(lang === "en" ? "Not logged in" : "Nicht eingeloggt", { type: "error" });
      return;
    }

    // 1) Food upserten (per barcode unique pro user — wenn schon mal gescannt, wiederverwenden)
    const { data: existing } = await supabase
      .from("foods")
      .select("id")
      .eq("user_id", user.id)
      .eq("barcode", data.barcode)
      .maybeSingle();

    let foodId: string | null = existing?.id || null;
    if (!foodId) {
      const { data: newFood, error: foodErr } = await supabase.from("foods").insert({
        user_id: user.id,
        name: data.name,
        brand: data.brand,
        barcode: data.barcode,
        serving_size: 100,
        serving_unit: "g",
        calories_per_serving: data.per_100g.calories || 0,
        protein_g: data.per_100g.protein || 0,
        carbs_g: data.per_100g.carbs || 0,
        fat_g: data.per_100g.fat || 0,
        fiber_g: data.per_100g.fiber || null,
        sugar_g: data.per_100g.sugar || null,
        is_custom: false, // ist ein OFF-Datensatz, kein selbst erfundener
      }).select("id").single();

      if (foodErr) {
        setSaving(false);
        toast(foodErr.message, { type: "error" });
        return;
      }
      foodId = newFood.id;
    }

    // 2) Meal Entry anlegen
    const servings = grams / 100;
    const { error: mealErr } = await supabase.from("meal_entries").insert({
      user_id: user.id,
      food_id: foodId,
      food_name: data.brand ? `${data.brand} — ${data.name}` : data.name,
      meal_type: meal,
      servings,
      calories: calc(data.per_100g.calories),
      protein_g: calc(data.per_100g.protein),
      carbs_g: calc(data.per_100g.carbs),
      fat_g: calc(data.per_100g.fat),
    });

    setSaving(false);
    if (mealErr) {
      toast(mealErr.message, { type: "error" });
      return;
    }

    toast(lang === "en" ? "Logged ✓" : "Gespeichert ✓", { type: "success", icon: "🍽️" });
    onSaved();
  }

  return (
    <div
      onClick={onClose}
      className="kalion-glass-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 10002,
        padding: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card kalion-glass"
        style={{ maxWidth: 460, width: "100%", maxHeight: "92vh", overflowY: "auto", margin: 0, padding: 18 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>
            {loading
              ? (lang === "en" ? "Looking up..." : "Suche...")
              : notFound
                ? (lang === "en" ? "Not found" : "Nicht gefunden")
                : (lang === "en" ? "Confirm food" : "Eintrag bestätigen")}
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "4px 10px" }}>✕</button>
        </div>

        {loading && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, fontFamily: "var(--font-mono)" }}>
              {barcode}
            </div>
          </div>
        )}

        {notFound && (
          <div style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🤷</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
              {lang === "en"
                ? "Product not in Open Food Facts"
                : "Produkt nicht in Open Food Facts"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.5 }}>
              {lang === "en"
                ? "You can add it manually or contribute on openfoodfacts.org."
                : "Du kannst es manuell anlegen oder auf openfoodfacts.org beitragen."}
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 14 }}>
              {barcode}
            </div>
            <a
              href={`https://world.openfoodfacts.org/product/${barcode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-block"
            >
              {lang === "en" ? "Open in OFF ↗" : "In OFF öffnen ↗"}
            </a>
          </div>
        )}

        {data && !loading && !notFound && (
          <>
            {/* Header mit Bild + Name */}
            <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
              {data.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.image}
                  alt=""
                  style={{
                    width: 72, height: 72, objectFit: "cover",
                    borderRadius: 10, background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.3 }}>{data.name}</div>
                {data.brand && (
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{data.brand}</div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {data.nutriscore && (
                    <span style={nutriScoreStyle(data.nutriscore)}>
                      Nutri-Score {data.nutriscore}
                    </span>
                  )}
                  {data.nova && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: "2px 6px",
                      background: "var(--bg-elevated)", color: "var(--text-dim)",
                      border: "1px solid var(--border)", borderRadius: 4,
                      letterSpacing: 0.5,
                    }}>
                      NOVA {data.nova}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Portion */}
            <div className="form-group">
              <label className="form-label">{lang === "en" ? "Portion (g)" : "Portion (g)"}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  value={grams}
                  min={1}
                  max={2000}
                  onChange={(e) => setGrams(Math.max(1, parseInt(e.target.value) || 0))}
                  className="form-input"
                  style={{ flex: 1 }}
                />
                {data.serving_size && (
                  <button
                    type="button"
                    onClick={() => setGrams(Math.round(data.serving_size || 100))}
                    className="btn"
                    style={{ padding: "8px 12px", fontSize: 11 }}
                    title={lang === "en" ? "Use serving size" : "Portionsgröße"}
                  >
                    {Math.round(data.serving_size)} g
                  </button>
                )}
                <button type="button" onClick={() => setGrams(100)} className="btn" style={{ padding: "8px 12px", fontSize: 11 }}>
                  100 g
                </button>
              </div>
            </div>

            {/* Mahlzeit */}
            <div className="form-group">
              <label className="form-label">{lang === "en" ? "Meal" : "Mahlzeit"}</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {MEAL_TYPES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMeal(m.id)}
                    className="btn"
                    style={{
                      padding: "8px 4px", fontSize: 11,
                      background: meal === m.id ? "var(--accent-tint)" : "var(--bg-elevated)",
                      borderColor: meal === m.id ? "var(--accent)" : "var(--border)",
                      color: meal === m.id ? "var(--accent)" : "var(--text)",
                    }}
                  >
                    {lang === "en" ? m.en : m.de}
                  </button>
                ))}
              </div>
            </div>

            {/* Berechnete Makros */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6,
              padding: 12, marginBottom: 14,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 12,
            }}>
              <Macro label={lang === "en" ? "Kcal" : "Kcal"} value={calc(data.per_100g.calories)} unit="" big />
              <Macro label="P" value={calc(data.per_100g.protein)} unit="g" />
              <Macro label="C" value={calc(data.per_100g.carbs)} unit="g" />
              <Macro label="F" value={calc(data.per_100g.fat)} unit="g" />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="btn btn-primary btn-block"
              style={{ padding: 14, fontSize: 14 }}
            >
              {saving ? <div className="spinner" /> : (lang === "en" ? "🍽️ Add to diary" : "🍽️ Eintragen")}
            </button>

            {data.allergens.length > 0 && (
              <div style={{
                fontSize: 10, color: "var(--text-muted)",
                marginTop: 10, lineHeight: 1.5,
              }}>
                {lang === "en" ? "Allergens" : "Allergene"}: {data.allergens.join(", ")}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Macro({ label, value, unit, big }: { label: string; value: number; unit: string; big?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontSize: 9, color: "var(--text-muted)", letterSpacing: 1,
        fontWeight: 800, textTransform: "uppercase",
      }}>{label}</div>
      <div style={{
        fontSize: big ? 22 : 16, fontWeight: 900, marginTop: 2,
        color: big ? "var(--accent)" : "var(--text)",
      }}>
        {value}<span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>{unit}</span>
      </div>
    </div>
  );
}

function nutriScoreStyle(grade: string): React.CSSProperties {
  const colors: Record<string, string> = {
    A: "#1B7E36", B: "#67B73C", C: "#FCC11A", D: "#F39C12", E: "#E13E2B",
  };
  const bg = colors[grade] || "var(--bg-elevated)";
  return {
    fontSize: 9, fontWeight: 800, padding: "2px 6px",
    background: bg, color: "#fff", borderRadius: 4,
    letterSpacing: 0.5,
  };
}
