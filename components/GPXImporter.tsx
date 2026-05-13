"use client";

// GPX-Import-Modal — Drop-Zone, Parse, Preview-Map, Save
// Funktioniert komplett browser-seitig (Datei wird nie auf den Server hochgeladen,
// nur die geparsten Punkte gehen via Supabase rein)

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/components/LanguageProvider";
import { parseGPX, type GPXMeta } from "@/lib/gpx";
import {
  type TrackPoint, withCumulativeDistance, totalDistance, elevation,
  paceSecPerKm, formatPace, speedKmh, formatDistance, formatDuration, bounds,
} from "@/lib/geo-math";
import { ACTIVITY_BY_ID, estimateKcal } from "@/lib/activities";

const TrackMap = dynamic(() => import("@/components/TrackMap"), { ssr: false });

type Props = {
  activityId: string;
  weightKg?: number;
  onClose: () => void;
  onSaved: () => void;
};

export default function GPXImporter({ activityId, weightKg = 75, onClose, onSaved }: Props) {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const [points, setPoints] = useState<TrackPoint[]>([]);
  const [meta, setMeta] = useState<GPXMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filename, setFilename] = useState<string>("");

  const activity = ACTIVITY_BY_ID[activityId];

  function handleFile(file: File) {
    setError(null);
    setFilename(file.name);
    if (!/\.gpx$/i.test(file.name)) {
      setError(lang === "en" ? "Please select a .gpx file" : "Bitte eine .gpx-Datei wählen");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError(lang === "en" ? "File too large (max 20 MB)" : "Datei zu groß (max 20 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const xml = String(reader.result || "");
        const { points: pts, meta: m } = parseGPX(xml);
        if (pts.length < 2) {
          setError(lang === "en" ? "GPX has too few points (min 2)" : "GPX enthält zu wenig Punkte (min 2)");
          return;
        }
        setPoints(withCumulativeDistance(pts));
        setMeta(m);
      } catch (e: any) {
        setError(e?.message || "Parse failed");
      }
    };
    reader.onerror = () => setError("Read failed");
    reader.readAsText(file);
  }

  async function save() {
    if (points.length < 2) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const distM = totalDistance(points);
    const durationS = points[points.length - 1].t - points[0].t;
    const elv = elevation(points);
    const bnd = bounds(points);
    const pace = paceSecPerKm(distM, durationS);
    const sp = speedKmh(distM, durationS);
    const kcal = estimateKcal(activityId, durationS / 60, weightKg);

    // Started/Ended-Timestamps: aus meta.time wenn vorhanden
    const startedAt = meta?.time ? new Date(meta.time).toISOString() : new Date(Date.now() - durationS * 1000).toISOString();
    const endedAt = new Date(new Date(startedAt).getTime() + durationS * 1000).toISOString();

    const { data: session, error: sErr } = await supabase.from("cardio_sessions").insert({
      user_id: user.id,
      activity_id: activityId,
      started_at: startedAt,
      ended_at: endedAt,
      duration_s: Math.round(durationS),
      distance_m: Math.round(distM),
      elevation_gain_m: elv.gain,
      elevation_loss_m: elv.loss,
      avg_pace_s_per_km: pace,
      avg_speed_kmh: Math.round(sp * 100) / 100,
      calories: kcal,
      source: "gpx_import",
      notes: meta?.name || filename,
    }).select("id").single();

    if (sErr || !session) {
      setSaving(false);
      toast(sErr?.message || "Save failed", { type: "error" });
      return;
    }

    const { error: tErr } = await supabase.from("cardio_tracks").insert({
      session_id: session.id,
      user_id: user.id,
      points,
      point_count: points.length,
      bounds: bnd ? { min_lat: bnd.minLat, max_lat: bnd.maxLat, min_lon: bnd.minLon, max_lon: bnd.maxLon } : null,
    });

    setSaving(false);
    if (tErr) {
      toast(lang === "en" ? "Saved (track points failed)" : "Gespeichert (ohne Punkte)", { type: "info" });
    } else {
      toast(lang === "en" ? "GPX imported 🎉" : "GPX importiert 🎉", { type: "success", icon: "✓" });
    }
    onSaved();
  }

  // Drag-Drop-Handler
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  const distM = points.length > 1 ? totalDistance(points) : 0;
  const durationS = points.length > 1 ? points[points.length - 1].t - points[0].t : 0;
  const elv = points.length > 1 ? elevation(points) : { gain: 0, loss: 0 };
  const pace = points.length > 1 ? paceSecPerKm(distM, durationS) : null;
  const kcal = estimateKcal(activityId, durationS / 60, weightKg);

  return (
    <div
      onClick={onClose}
      className="kalion-glass-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        padding: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card kalion-glass"
        style={{ maxWidth: 560, width: "100%", maxHeight: "92vh", overflowY: "auto", margin: 0, padding: 18 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>
            📂 {lang === "en" ? "Import GPX" : "GPX importieren"}
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "4px 10px" }}>✕</button>
        </div>

        {points.length === 0 ? (
          <>
            {/* Drop-Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              style={{
                padding: 32, textAlign: "center", cursor: "pointer",
                border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-strong)"}`,
                background: dragging ? "var(--accent-tint)" : "var(--bg-elevated)",
                borderRadius: 14,
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
                {dragging
                  ? (lang === "en" ? "Drop it here" : "Hier ablegen")
                  : (lang === "en" ? "Click or drop .gpx file" : "Klicken oder .gpx-Datei ablegen")}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5, maxWidth: 360, margin: "0 auto" }}>
                {lang === "en"
                  ? "Exports from Strava, Garmin Connect, Komoot, Apple Health work."
                  : "Exporte aus Strava, Garmin Connect, Komoot, Apple Health funktionieren."}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".gpx,application/gpx+xml,application/xml"
                style={{ display: "none" }}
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>

            {error && (
              <div style={{
                marginTop: 12, padding: 10, fontSize: 12, lineHeight: 1.5,
                background: "rgba(255,90,107,0.1)",
                border: "1px solid rgba(255,90,107,0.3)",
                borderRadius: 10, color: "var(--red)",
              }}>⚠ {error}</div>
            )}

            <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
              {lang === "en"
                ? "Your file is parsed locally in your browser — never uploaded anywhere."
                : "Die Datei wird lokal im Browser geparst — wird nirgendwo hochgeladen."}
            </div>
          </>
        ) : (
          <>
            {/* Preview */}
            <div style={{ marginBottom: 14 }}>
              <TrackMap points={points} height={240} />
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14,
            }}>
              <Stat label={lang === "en" ? "Distance" : "Strecke"} value={formatDistance(distM)} accent />
              <Stat label={lang === "en" ? "Time" : "Zeit"} value={formatDuration(durationS)} />
              <Stat
                label={activity?.category === "ride" ? "km/h" : (lang === "en" ? "Pace" : "Pace")}
                value={activity?.category === "ride" ? `${speedKmh(distM, durationS).toFixed(1)}` : formatPace(pace)}
              />
              <Stat label={lang === "en" ? "Up" : "Hoch"} value={`+${elv.gain}m`} small />
              <Stat label={lang === "en" ? "Down" : "Runter"} value={`−${elv.loss}m`} small />
              <Stat label={lang === "en" ? "Points" : "Punkte"} value={`${points.length}`} small />
            </div>

            <div style={{
              padding: 10, marginBottom: 14,
              background: "var(--accent-tint)", border: "1px solid var(--accent-border)", borderRadius: 10,
              fontSize: 11, color: "var(--accent)", fontWeight: 700, textAlign: "center",
            }}>
              {activity?.icon} {lang === "en" ? activity?.label_en : activity?.label_de}
              {" · "}~{kcal} kcal
            </div>

            {meta?.name && (
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12, textAlign: "center" }}>
                {meta.name}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => { setPoints([]); setMeta(null); setError(null); }} className="btn">
                ← {lang === "en" ? "Choose another" : "Andere wählen"}
              </button>
              <button onClick={save} disabled={saving} className="btn btn-primary">
                {saving ? <div className="spinner" /> : (lang === "en" ? "Save activity ✓" : "Speichern ✓")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent, small }: { label: string; value: string; accent?: boolean; small?: boolean }) {
  return (
    <div style={{
      padding: small ? 8 : 10,
      background: "var(--bg-elevated)",
      border: `1px solid ${accent ? "var(--accent-border)" : "var(--border)"}`,
      borderRadius: 10,
      textAlign: "center",
    }}>
      <div style={{
        fontSize: 9, color: "var(--text-muted)", letterSpacing: 1,
        fontWeight: 800, textTransform: "uppercase",
      }}>{label}</div>
      <div style={{
        fontSize: small ? 14 : 18, fontWeight: 900, marginTop: 2,
        color: accent ? "var(--accent)" : "var(--text)",
        fontVariantNumeric: "tabular-nums",
      }}>{value}</div>
    </div>
  );
}
