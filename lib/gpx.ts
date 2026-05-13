// GPX-Parser (Browser-Side)
// Liest .gpx-Dateien und gibt TrackPoint[] zurück
// Unterstützt Format 1.0 + 1.1, mit Höhe und Zeit

import type { TrackPoint } from "./geo-math";

export type GPXMeta = {
  name?: string;
  type?: string;
  time?: string;
  pointCount: number;
  durationS: number;     // ende - start
};

export function parseGPX(xmlText: string): { points: TrackPoint[]; meta: GPXMeta } {
  // Browser-DOMParser
  if (typeof window === "undefined" || !window.DOMParser) {
    throw new Error("GPX parsing requires browser environment");
  }
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  // Error-Check
  const err = doc.querySelector("parsererror");
  if (err) throw new Error("Invalid GPX: " + err.textContent?.slice(0, 100));

  // Track-Punkte sammeln (alle <trkpt> auch über mehrere <trkseg>)
  const trkpts = Array.from(doc.querySelectorAll("trkpt"));

  // Wenn keine <trkpt>, vielleicht ist es ein Route → <rtept> als Fallback
  const pointsRaw = trkpts.length > 0 ? trkpts : Array.from(doc.querySelectorAll("rtept"));

  if (pointsRaw.length === 0) {
    throw new Error("No track or route points found in GPX file");
  }

  // Erstes Zeit-Element als T0
  const firstTimeEl = pointsRaw[0].querySelector("time");
  const t0 = firstTimeEl?.textContent ? new Date(firstTimeEl.textContent).getTime() : null;

  const points: TrackPoint[] = [];
  let lastT = 0;

  for (const el of pointsRaw) {
    const lat = parseFloat(el.getAttribute("lat") || "");
    const lon = parseFloat(el.getAttribute("lon") || "");
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const eleEl = el.querySelector("ele");
    const alt = eleEl?.textContent ? parseFloat(eleEl.textContent) : undefined;

    const timeEl = el.querySelector("time");
    let t = lastT + 1; // Default: 1s nach letztem Punkt
    if (timeEl?.textContent && t0 !== null) {
      const ms = new Date(timeEl.textContent).getTime();
      if (Number.isFinite(ms)) {
        t = (ms - t0) / 1000;
      }
    }

    // HR aus extensions falls vorhanden
    let hr: number | undefined;
    const hrEl = el.querySelector("hr, [hr], gpxtpx\\:hr");
    if (hrEl?.textContent) {
      const v = parseInt(hrEl.textContent, 10);
      if (!Number.isNaN(v)) hr = v;
    }
    // Suchmuster für TrackPointExtension's hr (oft mit Namespace)
    if (hr === undefined) {
      const extHr = el.getElementsByTagName("hr")[0]
                 || el.getElementsByTagName("gpxtpx:hr")[0]
                 || el.getElementsByTagName("ns3:hr")[0];
      if (extHr?.textContent) {
        const v = parseInt(extHr.textContent, 10);
        if (!Number.isNaN(v)) hr = v;
      }
    }

    points.push({ t: Math.max(0, t), lat, lon, alt, hr });
    lastT = t;
  }

  // Meta
  const nameEl = doc.querySelector("trk > name, rte > name, metadata > name");
  const typeEl = doc.querySelector("trk > type, rte > type");
  const metaTimeEl = doc.querySelector("metadata > time");

  const meta: GPXMeta = {
    name: nameEl?.textContent || undefined,
    type: typeEl?.textContent || undefined,
    time: metaTimeEl?.textContent || (firstTimeEl?.textContent || undefined),
    pointCount: points.length,
    durationS: points.length > 0 ? points[points.length - 1].t : 0,
  };

  return { points, meta };
}
