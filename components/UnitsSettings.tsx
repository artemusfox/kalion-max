"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import {
  readPrefs, DEFAULT_PLATES_KG, DEFAULT_PLATES_LB,
  DEFAULT_BAR_KG, DEFAULT_BAR_LB,
  type UserPrefs,
} from "@/lib/units";
import PlateVisualizer from "@/components/PlateVisualizer";

export default function UnitsSettings() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [busy, setBusy] = useState(false);
  const [newPlate, setNewPlate] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("units, settings").single();
    setPrefs(readPrefs(data));
  }

  async function save(next: UserPrefs) {
    setPrefs(next);
    setBusy(true);
    const supabase = createClient();
    const { data: prof } = await supabase.from("profiles").select("settings").single();
    const settings = { ...(prof?.settings || {}), distance: next.distance, plates: next.plates };
    const { error } = await supabase.from("profiles").update({
      units: next.units,
      settings,
    }).eq("id", (await supabase.auth.getUser()).data.user!.id);
    setBusy(false);
    if (error) toast("Fehler beim Speichern: " + error.message, { type: "error" });
  }

  function toggleUnits() {
    if (!prefs) return;
    const newSystem = prefs.units === "metric" ? "imperial" : "metric";
    // Default-Plates fürs neue System wenn User Standard hatte
    const wasDefault = JSON.stringify(prefs.plates.plates) === JSON.stringify(
      prefs.units === "metric" ? DEFAULT_PLATES_KG : DEFAULT_PLATES_LB
    );
    const newPlates = wasDefault ? {
      bar: newSystem === "metric" ? DEFAULT_BAR_KG : DEFAULT_BAR_LB,
      plates: newSystem === "metric" ? [...DEFAULT_PLATES_KG] : [...DEFAULT_PLATES_LB],
    } : prefs.plates;
    save({ ...prefs, units: newSystem, plates: newPlates });
    toast(`Einheiten: ${newSystem === "metric" ? "Kilogramm/km" : "Pfund/Meilen"}`, { type: "success", icon: "📐" });
  }

  function toggleDistance() {
    if (!prefs) return;
    const next = prefs.distance === "km" ? "mi" : "km";
    save({ ...prefs, distance: next });
  }

  function setBar(v: number) {
    if (!prefs || isNaN(v) || v <= 0) return;
    save({ ...prefs, plates: { ...prefs.plates, bar: v } });
  }

  function removePlate(p: number) {
    if (!prefs) return;
    save({ ...prefs, plates: { ...prefs.plates, plates: prefs.plates.plates.filter((x) => x !== p) } });
  }

  function addPlate() {
    if (!prefs) return;
    const v = parseFloat(newPlate.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast("Ungültiger Wert", { type: "error" }); return; }
    if (prefs.plates.plates.includes(v)) { toast("Schon in der Liste", { type: "info" }); return; }
    const next = [...prefs.plates.plates, v].sort((a, b) => b - a);
    save({ ...prefs, plates: { ...prefs.plates, plates: next } });
    setNewPlate("");
  }

  function resetPlates() {
    if (!prefs) return;
    const isMetric = prefs.units === "metric";
    save({
      ...prefs,
      plates: {
        bar: isMetric ? DEFAULT_BAR_KG : DEFAULT_BAR_LB,
        plates: isMetric ? [...DEFAULT_PLATES_KG] : [...DEFAULT_PLATES_LB],
      },
    });
    toast("Auf Standard zurückgesetzt", { type: "info" });
  }

  if (!prefs) return <div style={{ padding: 20, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;

  const unit = prefs.units === "imperial" ? "lb" : "kg";
  const previewWeight = prefs.units === "imperial" ? 135 : 60;

  return (
    <div>
      {/* Unit-System Toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <button
          onClick={toggleUnits}
          disabled={busy}
          className="btn btn-block"
          style={{
            border: prefs.units === "metric" ? "1px solid var(--accent)" : "1px solid var(--border)",
            background: prefs.units === "metric" ? "var(--accent-tint)" : "var(--bg-elevated)",
            color: prefs.units === "metric" ? "var(--accent)" : "var(--text)",
          }}
        >Kilogramm</button>
        <button
          onClick={toggleUnits}
          disabled={busy}
          className="btn btn-block"
          style={{
            border: prefs.units === "imperial" ? "1px solid var(--accent)" : "1px solid var(--border)",
            background: prefs.units === "imperial" ? "var(--accent-tint)" : "var(--bg-elevated)",
            color: prefs.units === "imperial" ? "var(--accent)" : "var(--text)",
          }}
        >Pfund</button>
      </div>

      {/* Distance Toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
        <button
          onClick={toggleDistance}
          disabled={busy}
          className="btn btn-block"
          style={{
            border: prefs.distance === "km" ? "1px solid var(--accent)" : "1px solid var(--border)",
            background: prefs.distance === "km" ? "var(--accent-tint)" : "var(--bg-elevated)",
            color: prefs.distance === "km" ? "var(--accent)" : "var(--text)",
          }}
        >Kilometer</button>
        <button
          onClick={toggleDistance}
          disabled={busy}
          className="btn btn-block"
          style={{
            border: prefs.distance === "mi" ? "1px solid var(--accent)" : "1px solid var(--border)",
            background: prefs.distance === "mi" ? "var(--accent-tint)" : "var(--bg-elevated)",
            color: prefs.distance === "mi" ? "var(--accent)" : "var(--text)",
          }}
        >Meilen</button>
      </div>

      {/* Plates */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1.5, fontWeight: 800, textTransform: "uppercase", marginBottom: 8 }}>
        🥩 Verfügbare Hantelscheiben
      </div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.5 }}>
        Welche Scheiben hat dein Studio / dein Home-Gym? Wirkt sich auf den Plate-Visualizer im Workout aus.
      </div>

      {/* Stange */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 70 }}>Stange:</span>
        <input
          type="number"
          step="0.5"
          inputMode="decimal"
          value={prefs.plates.bar}
          onChange={(e) => setBar(parseFloat(e.target.value))}
          className="form-input"
          style={{ flex: 1, padding: "6px 10px", fontSize: 13 }}
        />
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{unit}</span>
      </div>

      {/* Liste */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12,
        padding: 10, background: "var(--bg-elevated)", borderRadius: 10,
        border: "1px solid var(--border)", minHeight: 50,
      }}>
        {prefs.plates.plates.length === 0 ? (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Keine Scheiben — füg welche hinzu</span>
        ) : prefs.plates.plates.map((p) => (
          <button
            key={p}
            onClick={() => removePlate(p)}
            style={{
              padding: "4px 8px", borderRadius: 6,
              background: "var(--surface)", border: "1px solid var(--border)",
              color: "var(--text)", cursor: "pointer", fontFamily: "var(--font-mono)",
              fontSize: 12, fontWeight: 700,
            }}
            title="Klicken zum Entfernen"
          >
            {p} {unit} <span style={{ color: "var(--red)", marginLeft: 4 }}>×</span>
          </button>
        ))}
      </div>

      {/* Hinzufügen */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <input
          type="number"
          step="0.25"
          inputMode="decimal"
          value={newPlate}
          onChange={(e) => setNewPlate(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPlate(); } }}
          placeholder={`Neue Scheibe (z. B. ${prefs.units === "imperial" ? "45" : "25"})`}
          className="form-input"
          style={{ flex: 1, padding: "6px 10px", fontSize: 13 }}
        />
        <button onClick={addPlate} className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }}>+</button>
      </div>

      <button onClick={resetPlates} className="btn btn-block" style={{ fontSize: 12 }} disabled={busy}>
        ↻ Auf Standard zurücksetzen
      </button>

      {/* Live-Preview */}
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 1.5, fontWeight: 800, textTransform: "uppercase", marginBottom: 6, textAlign: "center" }}>
          Vorschau für {previewWeight} {unit}
        </div>
        <PlateVisualizer totalWeight={previewWeight} prefs={prefs.plates} unit={unit} />
      </div>
    </div>
  );
}
