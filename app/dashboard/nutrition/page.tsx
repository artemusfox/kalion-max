"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { BUILT_IN_FOODS, FOOD_BY_ID, FOOD_CATEGORIES, MEAL_TYPES, SUPPLEMENT_PRESETS, TIMING_LABELS, guessMealType, type Food, type FoodCategory, type MealType } from "@/lib/foods";
import { useToast } from "@/components/Toast";
import { EmptyState, SkeletonList } from "@/components/UI";

export default function NutritionPage() {
  const [tab, setTab] = useState<"today" | "meals" | "supplements" | "foods">("today");

  return (
    <div>
      <div style={tabsStyle}>
        {[
          { id: "today",       label: "📊 Heute" },
          { id: "meals",       label: "🍽️ Mahlzeiten" },
          { id: "supplements", label: "💊 Supplements" },
          { id: "foods",       label: "📚 Lebensmittel" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={tabBtn(tab === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "today" && <TodayDashboard />}
      {tab === "meals" && <MealsTab />}
      {tab === "supplements" && <SupplementsTab />}
      {tab === "foods" && <FoodsTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TODAY DASHBOARD — Macro-Übersicht + Wasser
// ═══════════════════════════════════════════════════════════
function TodayDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [waterMl, setWaterMl] = useState(0);
  const [meals, setMeals] = useState<any[]>([]);
  const [supplements, setSupplements] = useState<any[]>([]);
  const [supplementsTaken, setSupplementsTaken] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [nl, me, sp, sl] = await Promise.all([
      supabase.from("nutrition_logs").select("water_ml").eq("log_date", today).maybeSingle(),
      supabase.from("meal_entries").select("*").eq("log_date", today).order("logged_at", { ascending: false }),
      supabase.from("supplements").select("*").eq("is_active", true),
      supabase.from("supplement_logs").select("*").eq("log_date", today),
    ]);
    setWaterMl(nl.data?.water_ml || 0);
    setMeals(me.data || []);
    setSupplements(sp.data || []);
    setSupplementsTaken(sl.data || []);
    setLoading(false);
  }

  async function addWater(ml: number) {
    const newMl = Math.max(0, waterMl + ml);
    setWaterMl(newMl);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("nutrition_logs").upsert({
      user_id: user.id, log_date: today, water_ml: newMl,
    }, { onConflict: "user_id,log_date" });
  }

  // Calculate totals
  const totals = meals.reduce((acc, m) => ({
    cal: acc.cal + (m.calories || 0),
    p: acc.p + (m.protein_g || 0),
    c: acc.c + (m.carbs_g || 0),
    f: acc.f + (m.fat_g || 0),
  }), { cal: 0, p: 0, c: 0, f: 0 });

  const waterGlasses = Math.floor(waterMl / 250);
  const waterTarget = 8;

  if (loading) return <Loading />;

  return (
    <>
      {/* Macro Summary */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>📊 Heute im Überblick</div>
        <div style={{
          textAlign: "center", padding: 24, marginBottom: 20,
          background: "linear-gradient(135deg, var(--accent-tint), transparent)",
          borderRadius: 14, border: "1px solid var(--accent-border)",
        }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 2, fontWeight: 800, textTransform: "uppercase" }}>Kalorien</div>
          <div style={{
            fontSize: 60, fontFamily: "var(--font-display)", fontStyle: "italic",
            fontWeight: 800, color: "var(--accent)", letterSpacing: -2, lineHeight: 1, marginTop: 8,
          }}>{Math.round(totals.cal)}<span style={{ fontSize: 18, color: "var(--text-muted)", fontStyle: "normal", fontFamily: "var(--font-body)", marginLeft: 6 }}>kcal</span></div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, marginTop: 6 }}>
            aus {meals.length} Eintrag{meals.length === 1 ? "" : "en"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <MacroBox label="Protein" value={totals.p} unit="g" color="var(--red)" icon="🥩" />
          <MacroBox label="Kohlenhydrate" value={totals.c} unit="g" color="var(--amber)" icon="🍞" />
          <MacroBox label="Fett" value={totals.f} unit="g" color="var(--green)" icon="🥑" />
        </div>
      </div>

      {/* Water */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>💧 Wasser heute</div>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            fontSize: 52, fontFamily: "var(--font-display)", fontStyle: "italic",
            fontWeight: 800, color: "var(--blue)", letterSpacing: -2, lineHeight: 1,
          }}>{waterMl}<span style={{ fontSize: 16, color: "var(--text-muted)", fontStyle: "normal", fontFamily: "var(--font-body)", marginLeft: 4 }}>ml</span></div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, marginTop: 4 }}>
            {waterGlasses} / {waterTarget} Gläser
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
          {Array.from({ length: waterTarget }, (_, i) => (
            <span key={i} style={{ fontSize: 24, opacity: i < waterGlasses ? 1 : 0.25 }}>💧</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => addWater(250)}>+ Glas (250ml)</button>
          <button className="btn" onClick={() => addWater(500)}>+ Flasche (500ml)</button>
          <button className="btn btn-ghost" onClick={() => addWater(-250)}>−250</button>
        </div>
      </div>

      {/* Supplements heute */}
      {supplements.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>
            💊 Supplements heute ({supplementsTaken.length}/{supplements.length})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
            {supplements.map((s) => {
              const taken = supplementsTaken.some((sl) => sl.supplement_id === s.id);
              return (
                <div key={s.id} style={{
                  padding: 14, borderRadius: 12,
                  background: taken ? "var(--accent-tint)" : "var(--bg-elevated)",
                  border: `1px solid ${taken ? "var(--accent-border)" : "var(--border)"}`,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon || "💊"}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    {s.dosage} {s.unit}
                  </div>
                  {taken && <div style={{ color: "var(--accent)", fontSize: 14, marginTop: 6, fontWeight: 800 }}>✓</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent meals */}
      {meals.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>🍽️ Heute gegessen</div>
          {meals.slice(0, 5).map((m) => {
            const mtConfig = MEAL_TYPES[m.meal_type as MealType] || MEAL_TYPES.snack;
            return (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 0", borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: 24 }}>{mtConfig.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{m.food_name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    {m.servings}× · {Math.round(m.calories)} kcal · P {Math.round(m.protein_g)} · C {Math.round(m.carbs_g)} · F {Math.round(m.fat_g)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// MEALS TAB — Mahlzeiten hinzufügen
// ═══════════════════════════════════════════════════════════
function MealsTab() {
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState<MealType | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => { load(); }, [selectedDate]);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("meal_entries")
      .select("*").eq("log_date", selectedDate).order("logged_at", { ascending: true });
    setMeals(data || []);
    setLoading(false);
  }

  async function deleteMeal(id: string) {
    const supabase = createClient();
    await supabase.from("meal_entries").delete().eq("id", id);
    toast("Eintrag gelöscht", { type: "info", icon: "🗑" });
    load();
  }

  const mealsByType: Record<MealType, any[]> = {
    breakfast: [], lunch: [], dinner: [], snack: [],
  };
  meals.forEach((m) => {
    if (mealsByType[m.meal_type as MealType]) mealsByType[m.meal_type as MealType].push(m);
  });

  return (
    <>
      {/* Date selector */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <input type="date" className="form-input" value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ maxWidth: 180 }} />
        {selectedDate !== today && (
          <button className="btn btn-ghost" onClick={() => setSelectedDate(today)}>Heute</button>
        )}
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
          {meals.length} Eintr{meals.length === 1 ? "ag" : "äge"}
        </div>
      </div>

      {loading ? <Loading /> : (Object.keys(MEAL_TYPES) as MealType[]).map((mt) => (
        <div key={mt} className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 24 }}>{MEAL_TYPES[mt].icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{MEAL_TYPES[mt].label}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                {mealsByType[mt].length} · {Math.round(mealsByType[mt].reduce((s, m) => s + (m.calories || 0), 0))} kcal
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowPicker(mt)} style={{ padding: "8px 14px" }}>+ Hinzufügen</button>
          </div>

          {mealsByType[mt].length === 0 ? (
            <div style={{ textAlign: "center", padding: 16, color: "var(--text-muted)", fontSize: 12 }}>
              Noch nichts eingetragen
            </div>
          ) : (
            mealsByType[mt].map((m) => (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: 12, marginBottom: 6,
                background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{m.food_name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    {m.servings}× · {Math.round(m.calories)} kcal · P{Math.round(m.protein_g)} · C{Math.round(m.carbs_g)} · F{Math.round(m.fat_g)}
                  </div>
                </div>
                <button onClick={() => deleteMeal(m.id)} className="btn btn-ghost"
                  style={{ padding: "6px 10px", color: "var(--red)", fontSize: 12 }}>🗑</button>
              </div>
            ))
          )}
        </div>
      ))}

      {showPicker && <FoodPicker mealType={showPicker} date={selectedDate}
        onClose={() => setShowPicker(null)} onDone={() => { setShowPicker(null); load(); }} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// FOOD PICKER Modal
// ═══════════════════════════════════════════════════════════
function FoodPicker({ mealType, date, onClose, onDone }: {
  mealType: MealType; date: string; onClose: () => void; onDone: () => void;
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FoodCategory | "all" | "custom" | "favorites">("all");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState("1");
  const [saving, setSaving] = useState(false);
  const [customFoods, setCustomFoods] = useState<any[]>([]);
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => { loadCustom(); }, []);

  async function loadCustom() {
    const supabase = createClient();
    const { data } = await supabase.from("foods").select("*").order("name");
    setCustomFoods(data || []);
  }

  const customFoodsAsShape: Food[] = customFoods.map((f) => ({
    id: f.id, name: f.name, brand: f.brand, category: "prepared" as FoodCategory,
    servingSize: f.serving_size, servingUnit: f.serving_unit,
    calories: f.calories_per_serving, protein: f.protein_g, carbs: f.carbs_g, fat: f.fat_g,
  }));

  const allFoods = [...customFoodsAsShape, ...BUILT_IN_FOODS];

  let list = allFoods;
  if (category === "favorites") {
    const favIds = new Set(customFoods.filter((f) => f.is_favorite).map((f) => f.id));
    list = list.filter((f) => favIds.has(f.id));
  } else if (category === "custom") {
    list = customFoodsAsShape;
  } else if (category !== "all") {
    list = list.filter((f) => f.category === category);
  }
  if (search) list = list.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  async function saveEntry() {
    if (!selectedFood) return;
    const s = parseFloat(servings) || 1;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const isCustom = customFoods.some((f) => f.id === selectedFood.id);
    await supabase.from("meal_entries").insert({
      user_id: user.id,
      food_id: isCustom ? selectedFood.id : null,
      food_name: selectedFood.name,
      log_date: date,
      meal_type: mealType,
      servings: s,
      calories: selectedFood.calories * s,
      protein_g: selectedFood.protein * s,
      carbs_g: selectedFood.carbs * s,
      fat_g: selectedFood.fat * s,
    });
    toast(`${selectedFood.name} hinzugefügt`, { type: "success", icon: MEAL_TYPES[mealType].icon });
    onDone();
  }

  if (showCustom) {
    return <CustomFoodForm onClose={() => setShowCustom(false)}
      onDone={() => { setShowCustom(false); loadCustom(); }} />;
  }

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{
        maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto", margin: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 20, fontStyle: "italic" }}>
              {MEAL_TYPES[mealType].icon} {MEAL_TYPES[mealType].label}
            </h3>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              Lebensmittel auswählen
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost">✕</button>
        </div>

        {!selectedFood ? (
          <>
            <input className="form-input" placeholder="🔍 Suchen..." value={search}
              onChange={(e) => setSearch(e.target.value)} autoFocus style={{ marginBottom: 12 }} />

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              <Chip active={category === "all"} onClick={() => setCategory("all")} label="Alle" />
              <Chip active={category === "custom"} onClick={() => setCategory("custom")} label={`⭐ Eigene (${customFoods.length})`} color="var(--accent)" />
              {(Object.keys(FOOD_CATEGORIES) as FoodCategory[]).map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)}
                  label={`${FOOD_CATEGORIES[c].icon} ${FOOD_CATEGORIES[c].label}`}
                  color={FOOD_CATEGORIES[c].color} />
              ))}
            </div>

            <button className="btn btn-block" onClick={() => setShowCustom(true)} style={{ marginBottom: 12, fontSize: 13 }}>
              + Eigenes Lebensmittel erstellen
            </button>

            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 700 }}>
              {list.length} Lebensmittel
            </div>

            {list.slice(0, 60).map((f) => (
              <div key={f.id} onClick={() => setSelectedFood(f)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", marginBottom: 6,
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 10, cursor: "pointer",
              }}>
                <div style={{ fontSize: 22 }}>{FOOD_CATEGORIES[f.category]?.icon || "🍽️"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{f.name}{f.brand ? <span style={{ color: "var(--text-muted)", fontWeight: 500 }}> · {f.brand}</span> : null}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    {f.servingSize}{f.servingUnit} · {f.calories} kcal · P{f.protein} · C{f.carbs} · F{f.fat}
                  </div>
                </div>
                <span style={{ color: "var(--accent)", fontSize: 18 }}>+</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => setSelectedFood(null)} style={{ marginBottom: 16 }}>← Andere</button>
            <div className="card" style={{ padding: 20, marginBottom: 16, background: "var(--bg-elevated)" }}>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{selectedFood.name}</div>
              {selectedFood.brand && <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{selectedFood.brand}</div>}
              <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                Portion: {selectedFood.servingSize}{selectedFood.servingUnit}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Anzahl Portionen</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button className="btn" onClick={() => setServings(String(Math.max(0.25, parseFloat(servings) - 0.25)))} style={{ padding: "10px 16px", fontSize: 18 }}>−</button>
                <input type="number" step="0.25" className="form-input" value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  style={{ textAlign: "center", fontSize: 20, fontWeight: 800 }} autoFocus />
                <button className="btn" onClick={() => setServings(String(parseFloat(servings) + 0.25))} style={{ padding: "10px 16px", fontSize: 18 }}>+</button>
              </div>
            </div>

            {/* Live macro preview */}
            {(() => {
              const s = parseFloat(servings) || 0;
              return (
                <div style={{
                  padding: 20, borderRadius: 14, marginBottom: 20,
                  background: "var(--accent-tint)", border: "1px solid var(--accent-border)",
                }}>
                  <div style={{
                    fontSize: 38, fontFamily: "var(--font-display)", fontStyle: "italic",
                    fontWeight: 800, color: "var(--accent)", letterSpacing: -1, textAlign: "center", lineHeight: 1,
                  }}>{Math.round(selectedFood.calories * s)}<span style={{ fontSize: 14, color: "var(--text-muted)", fontStyle: "normal", fontFamily: "var(--font-body)", marginLeft: 4 }}>kcal</span></div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14, fontSize: 12, textAlign: "center" }}>
                    <div>
                      <div style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: 10 }}>Protein</div>
                      <div style={{ fontWeight: 800, color: "var(--red)", fontFamily: "var(--font-mono)" }}>{(selectedFood.protein * s).toFixed(1)}g</div>
                    </div>
                    <div>
                      <div style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: 10 }}>Carbs</div>
                      <div style={{ fontWeight: 800, color: "var(--amber)", fontFamily: "var(--font-mono)" }}>{(selectedFood.carbs * s).toFixed(1)}g</div>
                    </div>
                    <div>
                      <div style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: 10 }}>Fett</div>
                      <div style={{ fontWeight: 800, color: "var(--green)", fontFamily: "var(--font-mono)" }}>{(selectedFood.fat * s).toFixed(1)}g</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <button className="btn btn-primary btn-block" onClick={saveEntry} disabled={saving || !servings}>
              {saving ? <div className="spinner" /> : `✓ Zu ${MEAL_TYPES[mealType].label} hinzufügen`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CUSTOM FOOD FORM
// ═══════════════════════════════════════════════════════════
function CustomFoodForm({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [servingSize, setServingSize] = useState("100");
  const [servingUnit, setServingUnit] = useState("g");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim() || !calories) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("foods").insert({
      user_id: user.id, name, brand: brand || null,
      serving_size: parseFloat(servingSize) || 100,
      serving_unit: servingUnit,
      calories_per_serving: parseFloat(calories) || 0,
      protein_g: parseFloat(protein) || 0,
      carbs_g: parseFloat(carbs) || 0,
      fat_g: parseFloat(fat) || 0,
      is_custom: true,
    });
    toast(`"${name}" gespeichert`, { type: "success", icon: "🍽️" });
    onDone();
  }

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto", margin: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 20, fontStyle: "italic" }}>+ Eigenes Lebensmittel</h3>
          <button onClick={onClose} className="btn btn-ghost">✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="z.B. Mein Proteinshake" />
        </div>
        <div className="form-group">
          <label className="form-label">Marke (optional)</label>
          <input className="form-input" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="z.B. Eigenmarke" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Portionsgröße</label>
            <input className="form-input" type="number" step="0.1" value={servingSize} onChange={(e) => setServingSize(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Einheit</label>
            <select className="form-select" value={servingUnit} onChange={(e) => setServingUnit(e.target.value)}>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="Stück">Stück</option>
              <option value="Portion">Portion</option>
              <option value="EL">EL</option>
              <option value="TL">TL</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, fontWeight: 700 }}>
          Nährwerte pro Portion
        </div>

        <div className="form-group">
          <label className="form-label">Kalorien (kcal) *</label>
          <input className="form-input" type="number" step="0.1" value={calories} onChange={(e) => setCalories(e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Protein (g)</label>
            <input className="form-input" type="number" step="0.1" value={protein} onChange={(e) => setProtein(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Carbs (g)</label>
            <input className="form-input" type="number" step="0.1" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Fett (g)</label>
            <input className="form-input" type="number" step="0.1" value={fat} onChange={(e) => setFat(e.target.value)} />
          </div>
        </div>

        <button className="btn btn-primary btn-block" onClick={save} disabled={saving || !name.trim() || !calories}>
          {saving ? <div className="spinner" /> : "✓ Speichern"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUPPLEMENTS TAB
// ═══════════════════════════════════════════════════════════
function SupplementsTab() {
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [supplements, setSupplements] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [s, l] = await Promise.all([
      supabase.from("supplements").select("*").eq("is_active", true).order("created_at"),
      supabase.from("supplement_logs").select("*").eq("log_date", today),
    ]);
    setSupplements(s.data || []);
    setLogs(l.data || []);
    setLoading(false);
  }

  async function toggleTaken(suppId: string, timing: string | null = null) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const existing = logs.find((x) => x.supplement_id === suppId);
    if (existing) {
      await supabase.from("supplement_logs").delete().eq("id", existing.id);
    } else {
      await supabase.from("supplement_logs").insert({
        user_id: user.id, supplement_id: suppId,
        log_date: today, timing,
      });
      toast("Supplement genommen", { type: "success", icon: "💊" });
    }
    load();
  }

  async function deleteSupp(id: string) {
    if (!confirm("Supplement wirklich löschen? Das Log bleibt erhalten.")) return;
    const supabase = createClient();
    await supabase.from("supplements").update({ is_active: false }).eq("id", id);
    toast("Supplement archiviert", { type: "info" });
    load();
  }

  async function addFromPreset(preset: any) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("supplements").insert({
      user_id: user.id,
      name: preset.name,
      dosage: preset.dosage,
      unit: preset.unit,
      purpose: preset.purpose,
      icon: preset.icon,
      color: preset.color,
      timing: preset.timing,
    });
    toast(`${preset.name} hinzugefügt`, { type: "success", icon: preset.icon });
    setShowPresets(false);
    load();
  }

  if (loading) return <Loading />;

  return (
    <>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowAdd(true)}>
          + Eigenes
        </button>
        <button className="btn" style={{ flex: 1 }} onClick={() => setShowPresets(true)}>
          ✨ Vorlagen
        </button>
      </div>

      {supplements.length === 0 ? (
        <EmptyState
          icon="💊"
          title="Noch keine Supplements"
          description="Füge deine Supplements hinzu — entweder aus den Vorlagen oder selbst erstellt."
          action={{ label: "✨ Vorlagen ansehen", onClick: () => setShowPresets(true) }}
          secondaryAction={{ label: "+ Eigenes erstellen", onClick: () => setShowAdd(true) }}
        />
      ) : (
        supplements.map((s) => {
          const taken = logs.some((l) => l.supplement_id === s.id);
          return (
            <div key={s.id} className="card" style={{
              borderColor: taken ? "var(--accent-border)" : "var(--border)",
              background: taken ? "var(--accent-tint)" : "var(--bg-raised)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: s.color ? `${s.color}20` : "var(--accent-tint)",
                  border: `1px solid ${s.color || "var(--accent-border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24,
                }}>{s.icon || "💊"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                    {s.dosage} {s.unit}
                    {s.purpose && ` · ${s.purpose}`}
                  </div>
                  {s.timing && s.timing.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                      {s.timing.map((t: string) => (
                        <span key={t} style={{
                          fontSize: 10, padding: "2px 6px", borderRadius: 6,
                          background: "var(--surface)", color: "var(--text-dim)", fontWeight: 700,
                        }}>{TIMING_LABELS[t]?.icon} {TIMING_LABELS[t]?.label}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button onClick={() => toggleTaken(s.id, s.timing?.[0])} className="btn btn-primary"
                    style={{ padding: "8px 14px", fontSize: 12,
                      background: taken ? "var(--accent)" : undefined,
                    }}>
                    {taken ? "✓" : "Genommen"}
                  </button>
                  <button onClick={() => deleteSupp(s.id)} className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: 11, color: "var(--red)" }}>🗑</button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Supplement Log History */}
      <SupplementHistory />

      {showAdd && <SupplementForm onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); load(); }} />}

      {showPresets && (
        <div style={modalOverlay} onClick={() => setShowPresets(false)}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{
            maxWidth: 550, width: "100%", maxHeight: "85vh", overflowY: "auto", margin: 0,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, fontStyle: "italic" }}>✨ Supplement-Vorlagen</h3>
              <button onClick={() => setShowPresets(false)} className="btn btn-ghost">✕</button>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>
              Schneller Start mit gängigen Supplements. Kannst du später alles anpassen.
            </div>
            {SUPPLEMENT_PRESETS.map((p) => (
              <div key={p.name} onClick={() => addFromPreset(p)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: 12,
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 12, marginBottom: 8, cursor: "pointer",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${p.color}20`, border: `1px solid ${p.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {p.dosage} {p.unit} · {p.purpose}
                  </div>
                </div>
                <span style={{ color: "var(--accent)", fontSize: 20 }}>+</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function SupplementHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [supps, setSupps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      const [l, s] = await Promise.all([
        supabase.from("supplement_logs").select("*").gte("log_date", weekAgo).order("taken_at", { ascending: false }),
        supabase.from("supplements").select("id, name, icon, color"),
      ]);
      setLogs(l.data || []);
      setSupps(s.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading || logs.length === 0) return null;

  // Group by date
  const byDate: Record<string, any[]> = {};
  logs.forEach((l) => {
    if (!byDate[l.log_date]) byDate[l.log_date] = [];
    byDate[l.log_date].push(l);
  });
  const suppMap = Object.fromEntries(supps.map((s) => [s.id, s]));

  return (
    <div className="card">
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>📊 Letzte 7 Tage</div>
      {Object.entries(byDate).map(([date, entries]) => {
        const d = new Date(date);
        const isToday = date === new Date().toISOString().slice(0, 10);
        return (
          <div key={date} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 0", borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ width: 52, textAlign: "center", borderRight: "1px solid var(--border)", paddingRight: 12 }}>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 18, fontWeight: 800, lineHeight: 1, color: isToday ? "var(--accent)" : "var(--text)" }}>
                {d.getDate()}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1, marginTop: 2 }}>
                {["JAN","FEB","MRZ","APR","MAI","JUN","JUL","AUG","SEP","OKT","NOV","DEZ"][d.getMonth()]}
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {entries.map((e) => {
                const s = suppMap[e.supplement_id];
                return (
                  <span key={e.id} style={{ fontSize: 20, padding: 4, filter: s ? "none" : "grayscale(1)" }} title={s?.name}>
                    {s?.icon || "💊"}
                  </span>
                );
              })}
              <span style={{ alignSelf: "center", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 700, marginLeft: "auto" }}>
                {entries.length}×
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SupplementForm({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [unit, setUnit] = useState("mg");
  const [purpose, setPurpose] = useState("");
  const [icon, setIcon] = useState("💊");
  const [timing, setTiming] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("supplements").insert({
      user_id: user.id, name, dosage, unit, purpose: purpose || null,
      icon, timing: timing.length > 0 ? timing : null,
    });
    onDone();
  }

  const iconOptions = ["💊", "🥛", "⚡", "☀️", "🐟", "🌙", "🛡️", "☕", "💪", "🌿", "🍊", "🦠", "🏋️", "🔥"];

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto", margin: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 20, fontStyle: "italic" }}>+ Supplement</h3>
          <button onClick={onClose} className="btn btn-ghost">✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Dosierung</label>
            <input className="form-input" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="z.B. 5" />
          </div>
          <div className="form-group">
            <label className="form-label">Einheit</label>
            <select className="form-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="mg">mg</option>
              <option value="g">g</option>
              <option value="IE">IE</option>
              <option value="mcg">mcg</option>
              <option value="ml">ml</option>
              <option value="Tbl">Tbl</option>
              <option value="Kps">Kps</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Zweck (optional)</label>
          <input className="form-input" value={purpose} onChange={(e) => setPurpose(e.target.value)}
            placeholder="z.B. Muskelaufbau" />
        </div>

        <div className="form-group">
          <label className="form-label">Icon</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {iconOptions.map((i) => (
              <button key={i} onClick={() => setIcon(i)} style={{
                width: 44, height: 44, borderRadius: 12,
                border: `1px solid ${icon === i ? "var(--accent)" : "var(--border)"}`,
                background: icon === i ? "var(--accent-tint)" : "var(--bg-elevated)",
                cursor: "pointer", fontSize: 22,
              }}>{i}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Einnahmezeitpunkt(e)</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(TIMING_LABELS).map(([key, t]) => {
              const active = timing.includes(key);
              return (
                <button key={key} onClick={() => setTiming(active ? timing.filter((x) => x !== key) : [...timing, key])} style={{
                  padding: "6px 12px", borderRadius: 10,
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "var(--accent-tint)" : "var(--bg-elevated)",
                  color: active ? "var(--accent)" : "var(--text-dim)",
                  cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit",
                }}>{t.icon} {t.label}</button>
              );
            })}
          </div>
        </div>

        <button className="btn btn-primary btn-block" onClick={save} disabled={saving || !name.trim()}>
          {saving ? <div className="spinner" /> : "✓ Speichern"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FOODS TAB — eigene Lebensmittel verwalten
// ═══════════════════════════════════════════════════════════
function FoodsTab() {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("foods").select("*").order("name");
    setFoods(data || []);
    setLoading(false);
  }

  async function toggleFavorite(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("foods").update({ is_favorite: !current }).eq("id", id);
    load();
  }

  async function deleteFood(id: string) {
    if (!confirm("Lebensmittel wirklich löschen?")) return;
    const supabase = createClient();
    await supabase.from("foods").delete().eq("id", id);
    load();
  }

  if (loading) return <Loading />;

  return (
    <>
      <button className="btn btn-primary btn-block" onClick={() => setShowForm(true)} style={{ marginBottom: 16 }}>
        + Eigenes Lebensmittel erstellen
      </button>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>
          🍽️ Eigene Lebensmittel · {foods.length}
        </div>
        {foods.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Erstelle eigene Lebensmittel mit deinen Nährwerten — perfekt für Meal-Preps oder Produkte, die du regelmäßig isst.
            </div>
          </div>
        ) : (
          foods.map((f) => (
            <div key={f.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 0", borderBottom: "1px solid var(--border)",
            }}>
              <button onClick={() => toggleFavorite(f.id, f.is_favorite)} style={{
                background: "none", border: "none", cursor: "pointer", fontSize: 20,
              }}>{f.is_favorite ? "⭐" : "☆"}</button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{f.name}{f.brand ? <span style={{ color: "var(--text-muted)", fontWeight: 500 }}> · {f.brand}</span> : null}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                  {f.serving_size}{f.serving_unit} · {f.calories_per_serving} kcal · P{f.protein_g} · C{f.carbs_g} · F{f.fat_g}
                </div>
              </div>
              <button onClick={() => deleteFood(f.id)} className="btn btn-ghost"
                style={{ padding: "6px 10px", color: "var(--red)", fontSize: 12 }}>🗑</button>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>📚 Eingebaute Datenbank</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12 }}>
          KALION MAX enthält {BUILT_IN_FOODS.length} vordefinierte Lebensmittel mit Nährwerten — findest du alle im Mahlzeiten-Picker.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
          {(Object.keys(FOOD_CATEGORIES) as FoodCategory[]).map((c) => {
            const count = BUILT_IN_FOODS.filter((f) => f.category === c).length;
            return (
              <div key={c} style={{
                padding: 10, textAlign: "center",
                background: `${FOOD_CATEGORIES[c].color}15`,
                border: `1px solid ${FOOD_CATEGORIES[c].color}30`,
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 20 }}>{FOOD_CATEGORIES[c].icon}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: FOOD_CATEGORIES[c].color, marginTop: 4 }}>{FOOD_CATEGORIES[c].label}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && <CustomFoodForm onClose={() => setShowForm(false)} onDone={() => { setShowForm(false); load(); }} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function MacroBox({ label, value, unit, color, icon }: any) {
  return (
    <div style={{
      padding: 14, borderRadius: 12,
      background: "var(--bg-elevated)", border: "1px solid var(--border)", textAlign: "center",
    }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 1, fontWeight: 800, textTransform: "uppercase" }}>{label}</div>
      <div style={{
        fontSize: 22, fontFamily: "var(--font-display)", fontStyle: "italic",
        fontWeight: 800, color, letterSpacing: -0.5, lineHeight: 1, marginTop: 4,
      }}>{value.toFixed(1)}<span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "normal", fontFamily: "var(--font-body)" }}>{unit}</span></div>
    </div>
  );
}

function Loading() {
  return <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;
}

function Chip({ active, onClick, label, color }: any) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 11px", borderRadius: 999,
      border: `1px solid ${active ? (color || "var(--accent)") : "var(--border)"}`,
      background: active ? (color ? `${color}20` : "var(--accent-tint)") : "var(--bg-elevated)",
      color: active ? (color || "var(--accent)") : "var(--text-dim)",
      cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit",
    }}>{label}</button>
  );
}

const tabsStyle: React.CSSProperties = {
  display: "flex", gap: 4, padding: 4, background: "var(--bg-raised)",
  border: "1px solid var(--border)", borderRadius: 14, marginBottom: 20,
  overflowX: "auto",
};
function tabBtn(active: boolean): React.CSSProperties {
  return {
    flex: 1, minWidth: 100, padding: 10, borderRadius: 10, border: "none",
    background: active ? "var(--bg-elevated)" : "transparent",
    color: active ? "var(--text)" : "var(--text-muted)",
    cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700,
    whiteSpace: "nowrap",
  };
}
const modalOverlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 400,
  display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  backdropFilter: "blur(8px)",
};
