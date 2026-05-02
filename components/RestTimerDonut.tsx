// Animierter Donut-Pause-Timer.
// Outer-Ring leert sich von 100% auf 0%, Zahl im Zentrum.
// Wechselt bei <=10s Sekunden auf Rot mit Pulse.

type Props = {
  seconds: number;
  total: number;
  size?: number;
};

export default function RestTimerDonut({ seconds, total, size = 240 }: Props) {
  const pct = total > 0 ? Math.max(0, Math.min(1, seconds / total)) : 0;
  const isCritical = seconds <= 10 && seconds > 0;
  const isFinishing = seconds <= 3 && seconds > 0;

  // Ring-Geometrie
  const stroke = Math.round(size * 0.07);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dashOffset = c * (1 - pct);

  // Farben je Phase
  const ringColor = isFinishing ? "var(--red)" : isCritical ? "var(--amber)" : "var(--accent)";

  return (
    <div style={{
      position: "relative", width: size, height: size,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <style>{`
        @keyframes kalion-rest-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }
        @keyframes kalion-rest-rotate {
          from { transform: rotate(-90deg); }
          to   { transform: rotate(270deg); }
        }
      `}</style>

      <svg
        width={size}
        height={size}
        style={{
          transform: "rotate(-90deg)",
          animation: isFinishing ? "kalion-rest-pulse 0.5s ease-in-out infinite" : "none",
          filter: `drop-shadow(0 0 ${size * 0.05}px var(--accent-glow))`,
        }}
      >
        {/* Hintergrund-Ring */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="var(--surface)"
          strokeWidth={stroke}
        />
        {/* Aktiver Ring */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.95s linear, stroke 0.3s" }}
        />
        {/* Tick-Marker */}
        {[0, 0.25, 0.5, 0.75].map((t, i) => {
          const angle = t * 2 * Math.PI;
          const x1 = size / 2 + Math.cos(angle) * (r - stroke / 2 - 4);
          const y1 = size / 2 + Math.sin(angle) * (r - stroke / 2 - 4);
          const x2 = size / 2 + Math.cos(angle) * (r + stroke / 2 + 4);
          const y2 = size / 2 + Math.sin(angle) * (r + stroke / 2 + 4);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--text-muted)" strokeWidth="1" opacity="0.4" />
          );
        })}
      </svg>

      {/* Zentrierter Inhalt */}
      <div style={{
        position: "absolute",
        textAlign: "center",
        animation: isFinishing ? "kalion-rest-pulse 0.5s ease-in-out infinite" : "none",
      }}>
        <div style={{
          fontSize: Math.round(size * 0.42),
          fontWeight: 900,
          color: ringColor,
          letterSpacing: -3,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 ${size * 0.08}px var(--accent-glow)`,
        }}>{seconds}</div>
        <div style={{
          fontSize: Math.round(size * 0.05),
          color: "var(--text-muted)",
          letterSpacing: 3,
          fontWeight: 800,
          textTransform: "uppercase",
          marginTop: 4,
        }}>Sekunden</div>
      </div>
    </div>
  );
}
