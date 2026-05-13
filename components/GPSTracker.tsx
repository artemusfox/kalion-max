"use client";

// Live-GPS-Tracker für Cardio-Sessions
// Nutzt navigator.geolocation.watchPosition
// Auto-Pause wenn 30s lang Speed < 0.5 m/s

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/components/LanguageProvider";
import {
  type TrackPoint, totalDistance, elevation, paceSecPerKm,
  formatPace, speedKmh, formatDistance, formatDuration, bounds,
} from "@/lib/geo-math";
import { ACTIVITY_BY_ID, estimateKcal } from "@/lib/activities";

// Map nur client-side
const TrackMap = dynamic(() => import("@/components/TrackMap"), { ssr: false });

type Props = {
  activityId: string;
  onClose: () => void;
  weightKg?: number;
};

const AUTO_PAUSE_SPEED = 0.5;       // m/s — unter dem Wert wird pausiert
const AUTO_PAUSE_TIMEOUT = 30;      // Sek — wenn so lang unter AUTO_PAUSE_SPEED

export default function GPSTracker({ activityId, onClose, weightKg = 75 }: Props) {
  const { toast } = useToast();
  const { lang } = useLanguage();
  const router = useRouter();
  const activity = ACTIVITY_BY_ID[activityId];

  const [state, setState] = useState<"idle" | "running" | "paused" | "saving">("idle");
  const [points, setPoints] = useState<TrackPoint[]>([]);
  const [duration, setDuration] = useState(0);     // Sekunden
  const [error, setError] = useState<string | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);

  const startTimeRef = useRef<number>(0);          // ms
  const pausedDurationRef = useRef<number>(0);     // ms — bereits pausierte Zeit
  const pausedStartRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const lastSlowAtRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Berechnete Werte
  const distM = totalDistance(points);
  const elev = elevation(points);
  const pace = paceSecPerKm(distM, duration);
  const speed = speedKmh(distM, duration);

  // Wake-Lock aktivieren wenn unterwegs (Screen bleibt an)
  useEffect(() => {
    let active = true;
    async function lock() {
      try {
        if ("wakeLock" in navigator) {
          const wl = await (navigator as any).wakeLock.request("screen");
          if (active) wakeLockRef.current = wl;
          else wl.release();
        }
      } catch { /* ignore */ }
    }
    if (state === "running") lock();
    else if (wakeLockRef.current) {
      wakeLockRef.current.release(); wakeLockRef.current = null;
    }
    return () => { active = false; if (wakeLockRef.current) wakeLockRef.current.release(); };
  }, [state]);

  // Geolocation-Callback
  function handlePosition(pos: GeolocationPosition) {
    if (state !== "running" && state !== "paused") return;
    const { latitude, longitude, altitude, speed: spd } = pos.coords;
    const tSec = (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000;

    setPoints((prev) => {
      // Filtere fehlerhafte Punkte (Genauigkeit < 50m)
      if (pos.coords.accuracy && pos.coords.accuracy > 50) return prev;
      // Mind. 1 Sek Abstand zwischen Punkten
      if (prev.length > 0 && tSec - prev[prev.length - 1].t < 1) return prev;
      return [...prev, {
        t: tSec, lat: latitude, lon: longitude,
        alt: altitude ?? undefined,
        v: spd ?? undefined,
      }];
    });

    // Auto-Pause-Logik
    if (state === "running" && spd !== null && spd < AUTO_PAUSE_SPEED) {
      const now = Date.now();
      if (lastSlowAtRef.current === null) lastSlowAtRef.current = now;
      else if (now - lastSlowAtRef.current > AUTO_PAUSE_TIMEOUT * 1000) {
        pause(true);
      }
    } else {
      lastSlowAtRef.current = null;
    }
  }

  function handleError(err: GeolocationPositionError) {
    if (err.code === 1) {
      setError(lang === "en"
        ? "Location permission denied. Enable it in browser settings."
        : "Standort-Zugriff verweigert. Bitte in den Browser-Einstellungen erlauben.");
    } else if (err.code === 2) {
      setError(lang === "en"
        ? "GPS signal unavailable. Try outdoors with clear sky."
        : "GPS-Signal nicht verfügbar. Bitte draußen mit freier Sicht versuchen.");
    } else if (err.code === 3) {
      // Timeout — ist OK, einfach weitermachen
    } else {
      setError(err.message);
    }
  }

  async function start() {
    setError(null);
    setPermissionRequested(true);
    if (!navigator.geolocation) {
      setError(lang === "en" ? "Geolocation not supported on this device" : "Geolocation nicht unterstützt");
      return;
    }
    startTimeRef.current = Date.now();
    pausedDurationRef.current = 0;
    setPoints([]);
    setDuration(0);
    setState("running");

    watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000,
    });
    tickRef.current = window.setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000));
    }, 1000) as unknown as number;
  }

  function pause(auto = false) {
    if (state !== "running") return;
    if (tickRef.current) clearInterval(tickRef.current);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    pausedStartRef.current = Date.now();
    setState("paused");
    if (auto) toast(lang === "en" ? "Auto-paused" : "Auto-Pause", { type: "info", icon: "⏸" });
  }

  function resume() {
    if (state !== "paused") return;
    if (pausedStartRef.current) {
      pausedDurationRef.current += Date.now() - pausedStartRef.current;
      pausedStartRef.current = null;
    }
    lastSlowAtRef.current = null;
    setState("running");
    watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true, maximumAge: 1000, timeout: 15000,
    });
    tickRef.current = window.setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000));
    }, 1000) as unknown as number;
  }

  async function stop() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

    if (points.length < 2) {
      // zu wenig Daten — einfach abbrechen
      if (!confirm(lang === "en"
        ? "No track recorded. Discard?"
        : "Kein Track aufgezeichnet. Verwerfen?"
      )) {
        setState("paused");
        return;
      }
      onClose();
      return;
    }

    if (!confirm(lang === "en" ? "End and save?" : "Beenden und speichern?")) {
      setState("paused");
      return;
    }

    setState("saving");
    await save();
  }

  async function save() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState("paused"); toast("Not logged in", { type: "error" }); return;
    }

    const startedAt = new Date(startTimeRef.current).toISOString();
    const endedAt = new Date().toISOString();
    const dist = totalDistance(points);
    const elv = elevation(points);
    const bnd = bounds(points);
    const sp = speedKmh(dist, duration);
    const pc = paceSecPerKm(dist, duration);
    const kcal = estimateKcal(activityId, duration / 60, weightKg);

    const { data: session, error: sErr } = await supabase.from("cardio_sessions").insert({
      user_id: user.id,
      activity_id: activityId,
      started_at: startedAt,
      ended_at: endedAt,
      duration_s: duration,
      distance_m: Math.round(dist),
      elevation_gain_m: elv.gain,
      elevation_loss_m: elv.loss,
      avg_speed_kmh: Math.round(sp * 100) / 100,
      avg_pace_s_per_km: pc,
      calories: kcal,
      source: "gps",
    }).select("id").single();

    if (sErr || !session) {
      setState("paused"); toast(sErr?.message || "Save failed", { type: "error" }); return;
    }

    const { error: tErr } = await supabase.from("cardio_tracks").insert({
      session_id: session.id,
      user_id: user.id,
      points,
      point_count: points.length,
      bounds: bnd ? { min_lat: bnd.minLat, max_lat: bnd.maxLat, min_lon: bnd.minLon, max_lon: bnd.maxLon } : null,
    });

    if (tErr) {
      // Session ist gespeichert, Track-Insert fehlgeschlagen — Session bleibt aber valid
      toast(lang === "en" ? "Saved without track points" : "Gespeichert ohne Track-Punkte", { type: "info" });
    } else {
      toast(lang === "en" ? "Activity saved 🎉" : "Aktivität gespeichert 🎉", { type: "success", icon: "✓" });
    }

    onClose();
    router.refresh();
  }

  function discard() {
    if (!confirm(lang === "en" ? "Discard this session?" : "Diese Aktivität verwerfen?")) return;
    if (tickRef.current) clearInterval(tickRef.current);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    onClose();
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const isRunning = state === "running" || state === "paused" || state === "saving";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "var(--bg)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        background: "var(--bg-raised)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ fontSize: 22 }}>{activity?.icon || "🏃"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>
            {lang === "en" ? activity?.label_en : activity?.label_de}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, fontWeight: 700, textTransform: "uppercase" }}>
            {state === "idle" && (lang === "en" ? "Ready" : "Bereit")}
            {state === "running" && <span style={{ color: "var(--accent)" }}>● {lang === "en" ? "Recording" : "Aufzeichnung"}</span>}
            {state === "paused" && <span style={{ color: "#FFB800" }}>⏸ {lang === "en" ? "Paused" : "Pausiert"}</span>}
            {state === "saving" && (lang === "en" ? "Saving…" : "Speichere…")}
          </div>
        </div>
        {state === "idle" && (
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "6px 12px" }}>✕</button>
        )}
      </div>

      {/* Map (sobald Punkte da sind) */}
      <div style={{ flex: 1, padding: 12, overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>
        {points.length > 0 ? (
          <div style={{ flex: 1, minHeight: 200 }}>
            <TrackMap points={points} height="100%" live={state === "running"} />
          </div>
        ) : (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "var(--bg-elevated)", borderRadius: 12,
            border: "1px solid var(--border)",
            padding: 24, textAlign: "center",
          }}>
            {state === "idle" ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
                  {lang === "en" ? "Ready to start" : "Bereit zum Start"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, maxWidth: 320 }}>
                  {lang === "en"
                    ? "We need your location to record the route. Make sure you're outdoors with clear sky."
                    : "Wir brauchen deinen Standort um die Strecke aufzuzeichnen. Bitte draußen mit freier Sicht starten."}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📡</div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
                  {lang === "en" ? "Waiting for GPS…" : "Warte auf GPS-Signal…"}
                </div>
                <div className="spinner" style={{ margin: "12px auto 0" }} />
              </>
            )}
          </div>
        )}

        {error && (
          <div style={{
            padding: 12, background: "rgba(255,90,107,0.1)",
            border: "1px solid rgba(255,90,107,0.3)",
            borderRadius: 10, fontSize: 12, color: "var(--red)",
            lineHeight: 1.5,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
        }}>
          <Stat label={lang === "en" ? "Distance" : "Strecke"} value={formatDistance(distM)} accent />
          <Stat label={lang === "en" ? "Time" : "Zeit"} value={formatDuration(duration)} />
          <Stat
            label={activity?.category === "ride" ? "km/h" : (lang === "en" ? "Pace" : "Pace")}
            value={activity?.category === "ride" ? `${speed.toFixed(1)}` : formatPace(pace)}
          />
          <Stat label={lang === "en" ? "Elev. gain" : "Bergauf"} value={`${elev.gain} m`} small />
          <Stat label={lang === "en" ? "Elev. loss" : "Bergab"} value={`${elev.loss} m`} small />
          <Stat label={lang === "en" ? "Points" : "Punkte"} value={`${points.length}`} small />
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 8 }}>
          {state === "idle" && (
            <button
              onClick={start}
              className="btn btn-primary btn-block"
              style={{ padding: 18, fontSize: 16 }}
              disabled={permissionRequested}
            >
              ▶ {lang === "en" ? "Start" : "Start"}
            </button>
          )}

          {state === "running" && (
            <>
              <button onClick={() => pause()} className="btn btn-block" style={{ padding: 14, fontSize: 14 }}>
                ⏸ {lang === "en" ? "Pause" : "Pause"}
              </button>
              <button
                onClick={stop}
                className="btn btn-block"
                style={{
                  padding: 14, fontSize: 14,
                  background: "var(--red)", color: "#fff", border: "none",
                }}
              >
                ⏹ {lang === "en" ? "Stop" : "Stop"}
              </button>
            </>
          )}

          {state === "paused" && (
            <>
              <button onClick={resume} className="btn btn-primary btn-block" style={{ padding: 14, fontSize: 14 }}>
                ▶ {lang === "en" ? "Resume" : "Weiter"}
              </button>
              <button
                onClick={stop}
                className="btn btn-block"
                style={{
                  padding: 14, fontSize: 14,
                  background: "var(--red)", color: "#fff", border: "none",
                }}
              >
                ✓ {lang === "en" ? "Finish" : "Beenden"}
              </button>
            </>
          )}

          {state === "saving" && (
            <button disabled className="btn btn-primary btn-block" style={{ padding: 14 }}>
              <div className="spinner" />
            </button>
          )}
        </div>

        {(state === "running" || state === "paused") && (
          <button
            onClick={discard}
            className="btn btn-ghost btn-block"
            style={{ fontSize: 11, padding: "6px 12px", color: "var(--text-muted)" }}
          >
            {lang === "en" ? "Discard" : "Verwerfen"}
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent, small }: { label: string; value: string; accent?: boolean; small?: boolean }) {
  return (
    <div style={{
      padding: small ? "8px 10px" : 12,
      background: "var(--bg-elevated)",
      border: `1px solid ${accent ? "var(--accent-border)" : "var(--border)"}`,
      borderRadius: 10,
      textAlign: "center",
    }}>
      <div style={{
        fontSize: 9, color: "var(--text-muted)", letterSpacing: 1.2,
        fontWeight: 800, textTransform: "uppercase",
      }}>{label}</div>
      <div style={{
        fontSize: small ? 16 : 22, fontWeight: 900, marginTop: 2,
        color: accent ? "var(--accent)" : "var(--text)",
        fontFamily: "var(--font-display)",
        fontVariantNumeric: "tabular-nums",
      }}>{value}</div>
    </div>
  );
}
