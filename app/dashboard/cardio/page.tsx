"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/components/LanguageProvider";
import { useToast } from "@/components/Toast";
import ActivitySelector, { ActivityBadge } from "@/components/ActivitySelector";
import { ACTIVITY_BY_ID, estimateKcal } from "@/lib/activities";
import { formatDistance, formatDuration, formatPace } from "@/lib/geo-math";
import { SkeletonList, EmptyState } from "@/components/UI";
import Link from "next/link";

const GPSTracker = dynamic(() => import("@/components/GPSTracker"), { ssr: false });
const GPXImporter = dynamic(() => import("@/components/GPXImporter"), { ssr: false });
const TrackMap = dynamic(() => import("@/components/TrackMap"), { ssr: false });

export default function CardioPage() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedActivity, setSelectedActivity] = useState<string>("run_road");
  const [mode, setMode] = useState<"idle" | "gps" | "gpx" | "manual">("idle");

  // History
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [s, p] = await Promise.all([
      supabase.from("cardio_sessions").select("*").order("started_at", { ascending: false }).limit(20),
      supabase.from("profiles").select("weight_kg").maybeSingle(),
    ]);
    setSessions(s.data || []);
    setProfile(p.data);
    setLoading(false);
  }

  async function deleteSession(id: string) {
    if (!confirm(lang === "en" ? "Delete this activity?" : "Aktivität löschen?")) return;
    const supabase = createClient();
    await supabase.from("cardio_sessions").delete().eq("id", id);
    toast(lang === "en" ? "Deleted" : "Gelöscht", { type: "info" });
    load();
  }

  const activity = ACTIVITY_BY_ID[selectedActivity];
  const supportsGps = activity?.gps !== false;
  const weightKg = profile?.weight_kg || 75;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ fontSize: 22 }}>🏃 {lang === "en" ? "Cardio & Activities" : "Cardio & Aktivitäten"}</h1>
        <Link href="/dashboard/training" className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
          ← {lang === "en" ? "Training" : "Training"}
        </Link>
      </div>

      {/* Activity-Selector */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
          {lang === "en" ? "Choose activity" : "Aktivität wählen"}
        </div>
        <ActivitySelector value={selectedActivity} onChange={setSelectedActivity} />

        <div style={{
          marginTop: 14, padding: 12,
          background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12,
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <ActivityBadge id={selectedActivity} />
          <div style={{ fontSize: 11, color: "var(--text-dim)", flex: 1, minWidth: 0 }}>
            {activity?.gps
              ? (lang === "en" ? "GPS-trackable" : "GPS-fähig")
              : (lang === "en" ? "Indoor / no GPS" : "Indoor / ohne GPS")}
            {" · "}MET {activity?.met} · {Math.round(estimateKcal(selectedActivity, 30, weightKg))} {lang === "en" ? "kcal/30min" : "kcal/30Min"}
          </div>
        </div>
      </div>

      {/* Action-Buttons */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
          {lang === "en" ? "Log activity" : "Aktivität loggen"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          <button
            onClick={() => setMode("gps")}
            disabled={!supportsGps}
            className="btn btn-primary btn-block"
            style={{ padding: 14, fontSize: 13 }}
          >
            🛰️ {lang === "en" ? "Live GPS" : "Live-GPS"}
          </button>
          <button
            onClick={() => setMode("gpx")}
            className="btn btn-block"
            style={{ padding: 14, fontSize: 13 }}
          >
            📂 {lang === "en" ? "Import GPX" : "GPX-Datei"}
          </button>
          <button
            onClick={() => setMode("manual")}
            className="btn btn-block"
            style={{ padding: 14, fontSize: 13 }}
          >
            ⌨ {lang === "en" ? "Manual entry" : "Manuell"}
          </button>
        </div>
        {!supportsGps && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
            {lang === "en"
              ? "This activity doesn't support live GPS (indoor). Use Import or Manual entry."
              : "Diese Aktivität unterstützt kein Live-GPS (Indoor). Bitte Import oder manuell verwenden."}
          </div>
        )}
      </div>

      {/* Manual-Modal */}
      {mode === "manual" && (
        <ManualLogger
          activityId={selectedActivity}
          weightKg={weightKg}
          onClose={() => setMode("idle")}
          onSaved={() => { setMode("idle"); load(); }}
        />
      )}

      {/* GPS-Tracker (Fullscreen-Modal) */}
      {mode === "gps" && (
        <GPSTracker
          activityId={selectedActivity}
          weightKg={weightKg}
          onClose={() => { setMode("idle"); load(); }}
        />
      )}

      {/* GPX-Import-Modal */}
      {mode === "gpx" && (
        <GPXImporter
          activityId={selectedActivity}
          weightKg={weightKg}
          onClose={() => setMode("idle")}
          onSaved={() => { setMode("idle"); load(); }}
        />
      )}

      {/* History */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
          📊 {lang === "en" ? "Recent activities" : "Letzte Aktivitäten"}
        </div>
        {loading ? <SkeletonList count={3} /> :
          sessions.length === 0 ? (
            <EmptyState
              icon="🏃"
              title={lang === "en" ? "No activities yet" : "Noch keine Aktivität"}
              description={lang === "en" ? "Start your first run, ride or workout above." : "Starte oben deinen ersten Lauf, Ride oder Workout."}
            />
          ) : sessions.map((s) => <SessionRow key={s.id} session={s} onDelete={() => deleteSession(s.id)} />)
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Manual-Logger (für Indoor / wenn man's nur eintragen will)
// ═══════════════════════════════════════════════════════════
function ManualLogger({ activityId, weightKg, onClose, onSaved }: {
  activityId: string; weightKg: number; onClose: () => void; onSaved: () => void;
}) {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const activity = ACTIVITY_BY_ID[activityId];
  const [durationMin, setDurationMin] = useState(30);
  const [distKm, setDistKm] = useState(5);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const kcal = estimateKcal(activityId, durationMin, weightKg);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const distM = Math.round((distKm || 0) * 1000);
    const durationS = durationMin * 60;
    const pace = distM > 50 ? Math.round(durationS / (distM / 1000)) : null;
    const speed = distM > 0 ? Math.round(((distM / 1000) / (durationS / 3600)) * 100) / 100 : null;

    const startedAt = new Date(date).toISOString();
    const endedAt = new Date(new Date(date).getTime() + durationS * 1000).toISOString();

    const { error } = await supabase.from("cardio_sessions").insert({
      user_id: user.id,
      activity_id: activityId,
      started_at: startedAt,
      ended_at: endedAt,
      duration_s: durationS,
      distance_m: distM,
      avg_pace_s_per_km: pace,
      avg_speed_kmh: speed,
      calories: kcal,
      notes: notes || null,
      source: "manual",
    });

    setSaving(false);
    if (error) { toast(error.message, { type: "error" }); return; }
    toast(lang === "en" ? "Saved ✓" : "Gespeichert ✓", { type: "success" });
    onSaved();
  }

  return (
    <div
      onClick={onClose}
      className="kalion-glass-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        padding: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card kalion-glass"
        style={{ maxWidth: 420, width: "100%", margin: 0, padding: 18 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>
            {activity?.icon} {lang === "en" ? activity?.label_en : activity?.label_de}
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "4px 10px" }}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">{lang === "en" ? "When" : "Wann"}</label>
          <input type="datetime-local" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">{lang === "en" ? "Duration (min)" : "Dauer (Min)"}</label>
          <input
            type="number"
            className="form-input"
            value={durationMin}
            min={1}
            onChange={(e) => setDurationMin(Math.max(1, parseInt(e.target.value) || 0))}
          />
        </div>

        {(activity?.category === "run" || activity?.category === "ride" || activity?.category === "walk" || activity?.category === "swim" || activity?.category === "winter") && (
          <div className="form-group">
            <label className="form-label">{lang === "en" ? "Distance (km)" : "Strecke (km)"}</label>
            <input
              type="number"
              step={0.1}
              className="form-input"
              value={distKm}
              onChange={(e) => setDistKm(parseFloat(e.target.value) || 0)}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">{lang === "en" ? "Notes (optional)" : "Notizen (optional)"}</label>
          <textarea
            className="form-textarea"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={lang === "en" ? "Felt great, weather sunny…" : "Lief gut, Wetter sonnig…"}
          />
        </div>

        <div style={{
          padding: 12, marginBottom: 14,
          background: "var(--accent-tint)", border: "1px solid var(--accent-border)", borderRadius: 10,
          fontSize: 11, color: "var(--accent)", textAlign: "center", fontWeight: 700,
        }}>
          ~{kcal} kcal {lang === "en" ? "estimated" : "geschätzt"}
        </div>

        <button onClick={save} disabled={saving} className="btn btn-primary btn-block">
          {saving ? <div className="spinner" /> : (lang === "en" ? "Save activity" : "Aktivität speichern")}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Session-Row in der History — klappt eine Map auf bei Klick
// ═══════════════════════════════════════════════════════════
function SessionRow({ session, onDelete }: { session: any; onDelete: () => void }) {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [track, setTrack] = useState<any>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);

  const a = ACTIVITY_BY_ID[session.activity_id];
  const date = new Date(session.started_at);

  async function loadTrack() {
    if (track) return;
    setLoadingTrack(true);
    const supabase = createClient();
    const { data } = await supabase.from("cardio_tracks").select("points").eq("session_id", session.id).maybeSingle();
    setTrack(data);
    setLoadingTrack(false);
  }

  async function toggle() {
    if (!expanded) await loadTrack();
    setExpanded(!expanded);
  }

  return (
    <div style={{
      padding: 12, marginBottom: 6,
      background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 24 }}>{a?.icon || "🏃"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>
            {lang === "en" ? a?.label_en : a?.label_de}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
            {date.toLocaleDateString("de-DE")} · {formatDuration(session.duration_s)} · {formatDistance(session.distance_m)}
            {session.avg_pace_s_per_km && ` · ${formatPace(session.avg_pace_s_per_km)}/km`}
            {session.calories ? ` · ${session.calories} kcal` : ""}
          </div>
        </div>
        <button onClick={toggle} className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }}>
          {expanded ? "▲" : "▼"}
        </button>
        <button onClick={onDelete} className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 12, color: "var(--red)" }}>🗑</button>
      </div>

      {expanded && (
        <div style={{ marginTop: 10 }}>
          {loadingTrack ? (
            <div style={{ padding: 20, textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : track && Array.isArray(track.points) && track.points.length > 1 ? (
            <TrackMap points={track.points} height={220} />
          ) : (
            <div style={{ fontSize: 11, color: "var(--text-muted)", padding: 10, textAlign: "center" }}>
              {lang === "en" ? "No track points (manual entry)" : "Keine GPS-Daten (manuell eingetragen)"}
            </div>
          )}
          {session.elevation_gain_m > 0 && (
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
              {lang === "en" ? "Elevation" : "Höhenmeter"}: +{session.elevation_gain_m}m / −{session.elevation_loss_m}m
            </div>
          )}
          {session.notes && (
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 8, fontStyle: "italic" }}>
              „{session.notes}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
