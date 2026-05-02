// SVG-Flamme die mit dem Streak mitwächst.
// Skaliert von "Glut" (1-3) → "Feuer" (4-13) → "Inferno" (30+).

type Props = {
  streak: number;
  size?: number;       // Basis-Pixel (z. B. 36)
  showNumber?: boolean;
};

export default function StreakFlame({ streak, size = 36, showNumber = true }: Props) {
  // Intensitäts-Stufen
  const intensity =
    streak <= 0  ? "ember" :
    streak < 4   ? "ember" :
    streak < 14  ? "flame" :
    streak < 30  ? "blaze" :
    streak < 100 ? "inferno" :
                   "supernova";

  // Farb-Sets pro Stufe (gradient stops)
  const palettes: Record<typeof intensity, { core: string; mid: string; outer: string; glow: string }> = {
    ember:     { core: "#FFE08A", mid: "#FFB84D", outer: "#FF7847", glow: "rgba(255,150,80,0.45)" },
    flame:     { core: "#FFE066", mid: "#FF9233", outer: "#FF4D3D", glow: "rgba(255,90,60,0.55)" },
    blaze:     { core: "#FFEB66", mid: "#FF6633", outer: "#FF2255", glow: "rgba(255,60,80,0.65)" },
    inferno:   { core: "#FFFFFF", mid: "#FF8833", outer: "#E91E5A", glow: "rgba(255,80,120,0.78)" },
    supernova: { core: "#E0F0FF", mid: "#7C9BFF", outer: "#A78BFA", glow: "rgba(140,140,255,0.85)" },
  } as any;

  const p = palettes[intensity];
  const scale = streak === 0 ? 0.6 : Math.min(1.4, 0.7 + streak * 0.012);
  const numberSize = Math.round(size * 0.42);
  const flameSize = Math.round(size * scale);

  const id = `flame-${intensity}`;

  return (
    <div style={{
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size, height: size,
      filter: streak === 0 ? "grayscale(0.7) opacity(0.5)" : "none",
    }}>
      <style>{`
        @keyframes kalion-flame-flicker {
          0%, 100% { transform: scale(1) translateY(0); filter: drop-shadow(0 0 ${Math.round(size * 0.18)}px ${p.glow}); }
          25%      { transform: scale(1.04) translateY(-0.5px); filter: drop-shadow(0 0 ${Math.round(size * 0.26)}px ${p.glow}); }
          50%      { transform: scale(0.97) translateY(0.5px); filter: drop-shadow(0 0 ${Math.round(size * 0.14)}px ${p.glow}); }
          75%      { transform: scale(1.02) translateY(-0.3px); filter: drop-shadow(0 0 ${Math.round(size * 0.22)}px ${p.glow}); }
        }
        @keyframes kalion-flame-inner {
          0%, 100% { opacity: 0.9; }
          50%      { opacity: 1; }
        }
      `}</style>

      <svg
        viewBox="0 0 64 80"
        width={flameSize}
        height={flameSize}
        style={{
          animation: streak === 0 ? "none" : `kalion-flame-flicker ${0.9 + Math.random() * 0.4}s ease-in-out infinite`,
        }}
      >
        <defs>
          <radialGradient id={`${id}-grad`} cx="50%" cy="65%" r="55%">
            <stop offset="0%" stopColor={p.core} />
            <stop offset="40%" stopColor={p.mid} />
            <stop offset="100%" stopColor={p.outer} />
          </radialGradient>
          <radialGradient id={`${id}-core`} cx="50%" cy="70%" r="35%">
            <stop offset="0%" stopColor={p.core} stopOpacity="1" />
            <stop offset="100%" stopColor={p.core} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Außen-Flamme */}
        <path
          d="M32 76 C 8 70, 4 50, 14 32 C 18 38, 22 36, 22 30 C 22 18, 30 8, 32 0 C 34 18, 46 22, 46 36 C 50 30, 56 36, 54 50 C 58 60, 50 72, 32 76 Z"
          fill={`url(#${id}-grad)`}
        />
        {/* Innen-Flamme (Kern) */}
        <ellipse
          cx="32" cy="55" rx="11" ry="18"
          fill={`url(#${id}-core)`}
          style={{ animation: streak === 0 ? "none" : "kalion-flame-inner 0.6s ease-in-out infinite" }}
        />
      </svg>

      {showNumber && (
        <span style={{
          position: "absolute",
          fontSize: numberSize,
          fontWeight: 900,
          color: "#0a0a10",
          textShadow: `0 0 ${size * 0.15}px ${p.core}, 0 1px 2px rgba(0,0,0,0.4)`,
          fontFamily: "var(--font-body)",
          lineHeight: 1,
          mixBlendMode: streak >= 30 ? "normal" : "multiply",
        }}>
          {streak}
        </span>
      )}
    </div>
  );
}
