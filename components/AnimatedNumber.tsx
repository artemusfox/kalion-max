"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  duration?: number;     // ms, default 1200
  format?: (n: number) => string;
  // Wenn true, animiert nur beim ersten Mount (Default). Wenn false, animiert auch bei value-Änderungen.
  oncePerMount?: boolean;
};

// Counter der von 0 (oder vorigem Wert) zum Ziel-Wert hochzählt.
// Easing: ease-out cubic. Respektiert prefers-reduced-motion automatisch.
export default function AnimatedNumber({
  value, duration = 1200, format, oncePerMount = false,
}: Props) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Prefers-reduced-motion: sofort den Endwert setzen, keine Animation
    const reduced = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setDisplay(value); return; }

    if (oncePerMount && mountedRef.current) {
      setDisplay(value);
      return;
    }
    mountedRef.current = true;

    const start = performance.now();
    const startVal = fromRef.current;
    let raf = 0;
    function step(now: number) {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = startVal + (value - startVal) * eased;
      setDisplay(Math.round(cur));
      if (t < 1) raf = requestAnimationFrame(step);
      else fromRef.current = value;
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, oncePerMount]);

  return <>{format ? format(display) : display}</>;
}
