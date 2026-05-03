// Sendet alle 60 Sekunden einen Ping an Supabase, damit der User als "online"
// in `profiles.last_seen_at` markiert bleibt.
// Pausiert wenn Tab nicht sichtbar ist (Battery- + Cost-friendly).

"use client";

import { useEffect } from "react";
import { createClient } from "./supabase-client";

const INTERVAL_MS = 60_000;

export function usePresenceHeartbeat() {
  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setInterval> | null = null;

    async function ping() {
      if (typeof document !== "undefined" && document.hidden) return;
      try { await supabase.rpc("mark_online"); } catch {}
    }

    function start() {
      ping(); // sofort
      timer = setInterval(ping, INTERVAL_MS);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function onVisibility() {
      if (document.hidden) stop();
      else if (!timer) start();
    }

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
