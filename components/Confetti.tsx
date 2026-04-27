"use client";

import { useEffect, useState } from "react";

type Piece = {
  id: number;
  x: number;       // start-X in %
  delay: number;   // s
  duration: number;// s
  rotate: number;  // start
  rotateEnd: number;
  size: number;
  color: string;
  shape: "square" | "circle" | "rect";
};

const COLORS = ["#FF5A6B", "#22D3EE", "#FFB800", "#52D983", "#A78BFA", "#FF8B6B", "#F472B6"];

export default function Confetti({ trigger, count = 80 }: { trigger: number; count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const arr: Piece[] = Array.from({ length: count }, (_, i) => ({
      id: trigger * 1000 + i,
      x: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.6 + Math.random() * 1.4,
      rotate: Math.random() * 360,
      rotateEnd: 360 + Math.random() * 720,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: (["square", "circle", "rect"] as const)[Math.floor(Math.random() * 3)],
    }));
    setPieces(arr);
    // Nach längster Animation aufräumen
    const t = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(t);
  }, [trigger, count]);

  if (pieces.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes kalion-confetti-fall {
          0%   { transform: translate3d(0, -10vh, 0) rotate(var(--r0)); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translate3d(var(--dx, 0), 110vh, 0) rotate(var(--r1)); opacity: 0.9; }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          zIndex: 9999, overflow: "hidden",
        }}
      >
        {pieces.map((p) => {
          const baseStyle: React.CSSProperties = {
            position: "absolute",
            left: `${p.x}%`,
            top: 0,
            width: p.shape === "rect" ? p.size * 1.6 : p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === "circle" ? "50%" : 2,
            // CSS-Variablen für Animations-Endwerte
            ["--r0" as any]: `${p.rotate}deg`,
            ["--r1" as any]: `${p.rotateEnd}deg`,
            ["--dx" as any]: `${(Math.random() - 0.5) * 40}vw`,
            animation: `kalion-confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            willChange: "transform, opacity",
          };
          return <div key={p.id} style={baseStyle} />;
        })}
      </div>
    </>
  );
}
