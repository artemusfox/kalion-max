"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { SPORT_LABELS, SPORT_ICONS, SPORT_COLORS, type Sport } from "@/lib/types";
import { useToast } from "@/components/Toast";

export default function NewPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState<Sport>("strength");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [weeks, setWeeks] = useState(8);
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from("user_plans").insert({
      user_id: user.id,
      name, description: description || null,
      sport, level,
      duration_weeks: weeks,
      plan_data: {
        weeks: [{
          weekNum: 1,
          days: [{ id: "d1", name: "Tag 1", exercises: [] }]
        }]
      },
    }).select().single();

    if (error) { toast(error.message, { type: "error" }); setSaving(false); return; }
    toast(`Plan "${name}" erstellt`, { type: "success", icon: "✓" });
    router.push(`/dashboard/plans/${data.id}`);
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontStyle: "italic", marginBottom: 24 }}>Neuer Trainingsplan</h1>

      <div className="card">
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Mein Push/Pull/Legs" autoFocus maxLength={80} />
        </div>

        <div className="form-group">
          <label className="form-label">Beschreibung</label>
          <textarea className="form-textarea" value={description}
            onChange={(e) => setDescription(e.target.value)} rows={2}
            placeholder="Optional — worauf zielt der Plan ab?" />
        </div>

        <div className="form-group">
          <label className="form-label">Sportart</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
            {(Object.keys(SPORT_LABELS) as Sport[]).map((s) => (
              <button key={s} onClick={() => setSport(s)} style={{
                padding: 14, borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                border: `1px solid ${sport === s ? SPORT_COLORS[s] : "var(--border)"}`,
                background: sport === s ? `${SPORT_COLORS[s]}20` : "var(--bg-elevated)",
                color: sport === s ? SPORT_COLORS[s] : "var(--text)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 700,
              }}>
                <span style={{ fontSize: 24 }}>{SPORT_ICONS[s]}</span>
                {SPORT_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Level</label>
            <select className="form-select" value={level} onChange={(e) => setLevel(e.target.value as any)}>
              <option value="beginner">Anfänger</option>
              <option value="intermediate">Fortgeschritten</option>
              <option value="advanced">Profi</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Dauer (Wochen)</label>
            <input className="form-input" type="number" min="1" max="52"
              value={weeks} onChange={(e) => setWeeks(parseInt(e.target.value) || 8)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="btn" onClick={() => router.back()}>Abbrechen</button>
          <button className="btn btn-primary btn-block" onClick={create} disabled={saving || !name.trim()}>
            {saving ? <div className="spinner" /> : "✓ Erstellen & bearbeiten"}
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "16px 0", fontSize: 12, color: "var(--text-muted)" }}>
        Du kannst Übungen und Tage im nächsten Schritt hinzufügen.
      </div>
    </div>
  );
}
