"use client";

// Leaflet-Map zur Darstellung von Track-Punkten
// Lazy-loaded: Leaflet wird nur dynamisch importiert wenn die Komponente mountet
// — wir verzichten auf SSR und sparen ~150kb Bundle für User die nichts mit Maps machen

import { useEffect, useRef } from "react";
import type { TrackPoint } from "@/lib/geo-math";
import { bounds } from "@/lib/geo-math";

type Props = {
  points: TrackPoint[];
  height?: number | string;
  live?: boolean;     // wenn true → folgt automatisch dem letzten Punkt
  startPin?: boolean;
  endPin?: boolean;
};

declare global {
  interface Window {
    L?: any;
  }
}

export default function TrackMap({ points, height = 280, live = false, startPin = true, endPin = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const lineRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);

  // Init Leaflet lazy
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    async function init() {
      // Wenn Leaflet noch nicht geladen → CSS + JS injizieren
      if (!window.L) {
        await loadLeaflet();
      }
      if (cancelled || !ref.current) return;
      if (!window.L) return;

      const L = window.L;
      // Map initialisieren falls noch nicht
      if (!mapRef.current) {
        mapRef.current = L.map(ref.current, {
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: false,  // verhindert versehentliches Zoomen beim Scrollen
        }).setView([51.1657, 10.4515], 6); // DE-Mitte

        // OpenStreetMap-Kacheln (kostenlos, keine API-Key)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapRef.current);
      }

      // Track zeichnen
      drawTrack();
    }

    function drawTrack() {
      const L = window.L;
      if (!L || !mapRef.current) return;

      const latlngs = points.map((p) => [p.lat, p.lon]) as [number, number][];

      // Polyline
      if (lineRef.current) lineRef.current.remove();
      if (latlngs.length > 0) {
        // Akzent-Farbe via CSS-Var lesen
        const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7C5CFC";
        lineRef.current = L.polyline(latlngs, {
          color: accent,
          weight: 4,
          opacity: 0.85,
          lineJoin: "round",
        }).addTo(mapRef.current);
      }

      // Start/End-Pins
      if (startMarkerRef.current) { startMarkerRef.current.remove(); startMarkerRef.current = null; }
      if (endMarkerRef.current)   { endMarkerRef.current.remove();   endMarkerRef.current = null; }

      if (latlngs.length >= 1 && startPin) {
        startMarkerRef.current = L.circleMarker(latlngs[0], {
          radius: 8, color: "#fff", weight: 2, fillColor: "#22c55e", fillOpacity: 1,
        }).addTo(mapRef.current).bindTooltip("Start", { permanent: false });
      }
      if (latlngs.length >= 2 && endPin) {
        endMarkerRef.current = L.circleMarker(latlngs[latlngs.length - 1], {
          radius: 8, color: "#fff", weight: 2, fillColor: "#ef4444", fillOpacity: 1,
        }).addTo(mapRef.current).bindTooltip("Ziel", { permanent: false });
      }

      // Bounds anpassen
      if (latlngs.length >= 2) {
        if (live) {
          mapRef.current.panTo(latlngs[latlngs.length - 1]);
        } else {
          const b = bounds(points);
          if (b) {
            mapRef.current.fitBounds([
              [b.minLat, b.minLon],
              [b.maxLat, b.maxLon],
            ], { padding: [24, 24] });
          }
        }
      } else if (latlngs.length === 1) {
        mapRef.current.setView(latlngs[0], 15);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
    // Bewusst nur einmal initialisieren — Updates via separater Effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track-Updates wenn points sich ändern
  useEffect(() => {
    if (!window.L || !mapRef.current) return;
    const L = window.L;
    const latlngs = points.map((p) => [p.lat, p.lon]) as [number, number][];

    if (lineRef.current) lineRef.current.remove();
    if (latlngs.length > 0) {
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7C5CFC";
      lineRef.current = L.polyline(latlngs, {
        color: accent, weight: 4, opacity: 0.85, lineJoin: "round",
      }).addTo(mapRef.current);
    }

    if (startMarkerRef.current) { startMarkerRef.current.remove(); startMarkerRef.current = null; }
    if (endMarkerRef.current)   { endMarkerRef.current.remove();   endMarkerRef.current = null; }
    if (latlngs.length >= 1 && startPin) {
      startMarkerRef.current = L.circleMarker(latlngs[0], {
        radius: 8, color: "#fff", weight: 2, fillColor: "#22c55e", fillOpacity: 1,
      }).addTo(mapRef.current);
    }
    if (latlngs.length >= 2 && endPin) {
      endMarkerRef.current = L.circleMarker(latlngs[latlngs.length - 1], {
        radius: 8, color: "#fff", weight: 2, fillColor: "#ef4444", fillOpacity: 1,
      }).addTo(mapRef.current);
    }

    if (latlngs.length >= 2) {
      if (live) {
        mapRef.current.panTo(latlngs[latlngs.length - 1]);
      } else {
        const b = bounds(points);
        if (b) {
          mapRef.current.fitBounds([[b.minLat, b.minLon], [b.maxLat, b.maxLon]], { padding: [24, 24] });
        }
      }
    } else if (latlngs.length === 1) {
      mapRef.current.setView(latlngs[0], 15);
    }
  }, [points, live, startPin, endPin]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height,
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
      }}
    />
  );
}

// Helper: Leaflet von CDN nachladen
async function loadLeaflet(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.L) return;

  // CSS
  if (!document.querySelector('link[data-leaflet]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.setAttribute("data-leaflet", "1");
    document.head.appendChild(link);
  }

  // JS
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-leaflet]') as HTMLScriptElement | null;
    if (existing) {
      if (window.L) return resolve();
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.setAttribute("data-leaflet", "1");
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.head.appendChild(script);
  });
}
