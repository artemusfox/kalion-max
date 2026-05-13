// Geo-Math-Helper: Distanz, Pace, Höhenmeter, Bounds

export type TrackPoint = {
  t: number;       // Sekunden seit Start
  lat: number;
  lon: number;
  alt?: number;    // Meter
  hr?: number;     // bpm
  v?: number;      // m/s (vom GPS gemeldet wenn vorhanden)
  d?: number;      // kumulierte Distanz in Meter
};

const R = 6371000; // Erdradius in Metern

// Haversine — Distanz zwischen zwei Punkten in Metern
export function haversine(p1: TrackPoint, p2: TrackPoint): number {
  const φ1 = (p1.lat * Math.PI) / 180;
  const φ2 = (p2.lat * Math.PI) / 180;
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
  const Δλ = ((p2.lon - p1.lon) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Berechnet kumulative Distanz für die ganze Track-Liste
// und reichert jeden Punkt mit d (kumulierte Meter) an
export function withCumulativeDistance(points: TrackPoint[]): TrackPoint[] {
  if (points.length === 0) return [];
  const out: TrackPoint[] = [{ ...points[0], d: 0 }];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const step = haversine(out[i - 1], points[i]);
    total += step;
    out.push({ ...points[i], d: total });
  }
  return out;
}

// Gesamt-Distanz in Meter
export function totalDistance(points: TrackPoint[]): number {
  if (points.length === 0) return 0;
  const last = points[points.length - 1];
  if (typeof last.d === "number") return last.d;
  let total = 0;
  for (let i = 1; i < points.length; i++) total += haversine(points[i - 1], points[i]);
  return total;
}

// Höhenmeter (Gain + Loss) — mit kleinem Filter um GPS-Rauschen zu eliminieren
export function elevation(points: TrackPoint[], minDelta = 2): { gain: number; loss: number } {
  let gain = 0, loss = 0, lastAlt: number | null = null;
  for (const p of points) {
    if (typeof p.alt !== "number") continue;
    if (lastAlt === null) { lastAlt = p.alt; continue; }
    const d = p.alt - lastAlt;
    if (Math.abs(d) >= minDelta) {
      if (d > 0) gain += d; else loss += -d;
      lastAlt = p.alt;
    }
  }
  return { gain: Math.round(gain), loss: Math.round(loss) };
}

// Pace = Sek pro km (für Laufen)
export function paceSecPerKm(distanceM: number, durationS: number): number | null {
  if (distanceM < 50 || durationS < 5) return null;
  return Math.round(durationS / (distanceM / 1000));
}

// Format Pace als "5:32"
export function formatPace(secPerKm: number | null): string {
  if (secPerKm === null || !Number.isFinite(secPerKm)) return "—";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Geschwindigkeit km/h
export function speedKmh(distanceM: number, durationS: number): number {
  if (durationS < 1) return 0;
  return (distanceM / 1000) / (durationS / 3600);
}

// Bounds (Bounding Box) für die Map
export function bounds(points: TrackPoint[]): { minLat: number; maxLat: number; minLon: number; maxLon: number } | null {
  if (points.length === 0) return null;
  let minLat = points[0].lat, maxLat = points[0].lat;
  let minLon = points[0].lon, maxLon = points[0].lon;
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
  }
  return { minLat, maxLat, minLon, maxLon };
}

// Splits pro km (für Laufen)
// Liefert für jeden km die Sekunden, die dafür gebraucht wurden
export function kmSplits(points: TrackPoint[]): { km: number; durationS: number }[] {
  if (points.length < 2) return [];
  const splits: { km: number; durationS: number }[] = [];
  const enriched = withCumulativeDistance(points);
  const totalKm = Math.floor((enriched[enriched.length - 1].d || 0) / 1000);

  for (let km = 1; km <= totalKm; km++) {
    const targetM = km * 1000;
    const idx = enriched.findIndex((p) => (p.d || 0) >= targetM);
    if (idx === -1) break;
    const prev = enriched[idx - 1] || enriched[0];
    // Linear interpolieren zwischen prev und enriched[idx]
    const dPrev = prev.d || 0;
    const dCur = enriched[idx].d || 0;
    const frac = dCur > dPrev ? (targetM - dPrev) / (dCur - dPrev) : 0;
    const tAtKm = prev.t + (enriched[idx].t - prev.t) * frac;
    const tStart = km === 1 ? enriched[0].t : splits[km - 2].durationS + sum(splits, km - 2);
    splits.push({ km, durationS: Math.round(tAtKm - tStart) });
  }
  return splits;
}

function sum(splits: { durationS: number }[], upToIdx: number): number {
  let s = 0;
  for (let i = 0; i < upToIdx; i++) s += splits[i].durationS;
  return s;
}

// Distanz formatieren: <1km in m, sonst in km
export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

// Dauer formatieren als hh:mm:ss oder mm:ss
export function formatDuration(s: number): string {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
