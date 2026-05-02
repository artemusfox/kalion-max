// Driftende Hintergrund-Partikel in Akzent-Farben des Themes.
// Reine CSS-Animation, kein JS-Loop, GPU-beschleunigt.

const PARTICLES = [
  { size: 320, top: -100, left: -120, color: "var(--accent)",   dur: 95,  delay: 0,    opacity: 0.10 },
  { size: 260, top: 30,   left: 70,   color: "var(--accent-2)", dur: 110, delay: -20,  opacity: 0.07 },
  { size: 380, top: 60,   left: -140, color: "var(--accent)",   dur: 130, delay: -40,  opacity: 0.06 },
  { size: 220, top: -60,  left: 60,   color: "var(--accent-2)", dur: 100, delay: -55,  opacity: 0.08 },
  { size: 300, top: 75,   left: 65,   color: "var(--accent)",   dur: 140, delay: -10,  opacity: 0.06 },
  { size: 200, top: 20,   left: 30,   color: "var(--accent-2)", dur: 85,  delay: -70,  opacity: 0.05 },
];

export default function AmbientParticles() {
  return (
    <>
      <style>{`
        @keyframes kalion-drift-a {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          25%  { transform: translate3d(60px, -40px, 0) scale(1.1); }
          50%  { transform: translate3d(-40px, 80px, 0) scale(0.95); }
          75%  { transform: translate3d(-80px, 20px, 0) scale(1.05); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes kalion-drift-b {
          0%   { transform: translate3d(0, 0, 0) scale(1); }
          33%  { transform: translate3d(-60px, 60px, 0) scale(0.9); }
          66%  { transform: translate3d(80px, -50px, 0) scale(1.1); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        .kalion-particle {
          position: fixed; border-radius: 50%; pointer-events: none;
          filter: blur(110px); z-index: 0;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .kalion-particle { animation: none !important; }
        }
        /* Bei mittleren Themes Partikel leicht dimmen */
        [data-bg="stone"]   .kalion-particle,
        [data-bg="storm"]   .kalion-particle,
        [data-bg="sage"]    .kalion-particle,
        [data-bg="dust"]    .kalion-particle,
        [data-bg="mauve"]   .kalion-particle {
          opacity: 0.75 !important;
          mix-blend-mode: screen;
        }
        /* Bei hellen Themes stark dimmen + Multiply */
        [data-bg="snow"]    .kalion-particle,
        [data-bg="cream"]   .kalion-particle,
        [data-bg="mint"]    .kalion-particle,
        [data-bg="lavender"] .kalion-particle,
        [data-bg="sand"]    .kalion-particle {
          opacity: 0.55 !important;
          mix-blend-mode: multiply;
        }
      `}</style>
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="kalion-particle"
          style={{
            width: p.size, height: p.size,
            top: `${p.top}%`, left: `${p.left}%`,
            background: p.color,
            opacity: p.opacity,
            animation: `${i % 2 === 0 ? "kalion-drift-a" : "kalion-drift-b"} ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}
