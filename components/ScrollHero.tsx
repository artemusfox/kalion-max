"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Wrapper für Hero-Sektionen — fadet beim Scrollen smooth aus + parallaxt nach oben.
// Native CSS scroll-linked animations werden bevorzugt (Chrome 115+),
// Fallback ist ein scroll-Listener mit requestAnimationFrame.
export default function ScrollHero({
  children, fadeRange = 240, parallaxAmount = 0.4,
}: {
  children: ReactNode;
  fadeRange?: number;       // Pixel — nach diesem Scroll-Offset ist der Hero komplett ausgeblendet
  parallaxAmount?: number;  // 0..1 — wie sehr der Hero langsamer scrollt als der Rest
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(1);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    let raf = 0;
    function update() {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const scrollIn = Math.max(0, -r.top);
      // Opacity: linear runter über fadeRange Pixel
      const o = Math.max(0, 1 - scrollIn / fadeRange);
      // Parallax: hero bewegt sich langsamer (positive translateY = nach unten = Verlangsamung)
      const ty = scrollIn * parallaxAmount;
      setOpacity(o);
      setTranslateY(ty);
    }
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [fadeRange, parallaxAmount]);

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: "none",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
