"use client";

import { useEffect } from "react";

const KEY = "kalion-geo-pinged";

// Schickt einmal pro Browser-Session einen POST an /api/geo/me, damit der Server
// (mit Zugriff auf die Vercel-Geo-Headers) das Profil aktualisieren kann.
// Macht nichts wenn bereits gepingt wurde — keine wiederholten Requests.
export default function GeoCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY) === "1") return;
    sessionStorage.setItem(KEY, "1");
    fetch("/api/geo/me", { method: "POST" }).catch(() => {
      // still — wenn's fehlschlägt, ist das nicht user-relevant
      sessionStorage.removeItem(KEY);
    });
  }, []);
  return null;
}
