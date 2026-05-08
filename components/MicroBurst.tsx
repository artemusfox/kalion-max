"use client";

import { useEffect, useState } from "react";

type Particle = {
  id: number;
  dx: number;
  dy: number;
  size: number;
  duration: number;
  color: string;
};

type Props = {
  trigger: number;
  color?: string;
  count?: number;
  size?: number;
};

// Kleiner Particle-Burst — 6-8 Funken die vom Klick-Punkt wegfliegen.
// Anchored to parent via position:absolute. Parent muss position:relative sein.
export default function MicroBurst({
  trigger, color = "var(--accent)", count = 7, size = 6,
}: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const arr: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 18 + Math.random() * 16;
      return {
        id: trigger * 100 + i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: size * (0.7 + Math.random() * 0.6),
        duration: 500 + Math.random() * 200,
        color,
      };
    });
    setParticles(arr);
    const t = setTimeout(() => setParticles([]), 800);
    return () => clearTimeout(t);
  }, [trigger, count, size, color]);

  if (particles.length === 0) return null;

  return (
    <div aria-hidden style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      overflow: "visible", zIndex: 5,
    }}>
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: p.size, height: p.size,
            borderRadius: "50%",
            background: p.color,
            ["--burst-x" as any]: `${p.dx}px`,
            ["--burst-y" as any]: `${p.dy}px`,
            animation: `kalion-burst-spark ${p.duration}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
