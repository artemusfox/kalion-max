"use client";

import type { CSSProperties } from "react";

type Props = {
  width?: number | string;
  height?: number | string;
  rounded?: number | string;
  style?: CSSProperties;
};

// Einzelner Skeleton-Block mit Shimmer-Animation.
// Nutzt CSS-Custom-Property `--skel-color` für Theme-Fit, kein extra State.
export function Skeleton({ width = "100%", height = 16, rounded = 6, style }: Props) {
  return (
    <div
      aria-hidden
      style={{
        width, height,
        borderRadius: rounded,
        background: `linear-gradient(
          90deg,
          var(--surface)    0%,
          var(--surface-2) 50%,
          var(--surface)  100%
        )`,
        backgroundSize: "200% 100%",
        animation: "kalion-shimmer 1.4s linear infinite",
        ...style,
      }}
    />
  );
}

// Vorgefertigte Card-Skeleton für Dashboard-Widgets
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card">
      <Skeleton width={140} height={14} style={{ marginBottom: 10 }} />
      <Skeleton width="60%" height={11} style={{ marginBottom: 16 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={36} rounded={10} style={{ marginBottom: 6 }} />
      ))}
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      gap: 10,
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ padding: 14, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12 }}>
          <Skeleton width={20} height={20} rounded="50%" style={{ marginBottom: 6 }} />
          <Skeleton width={60} height={9} style={{ marginBottom: 6 }} />
          <Skeleton width={80} height={26} />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)", borderRadius: 10,
        }}>
          <Skeleton width={24} height={24} rounded="50%" />
          <div style={{ flex: 1 }}>
            <Skeleton width="40%" height={12} style={{ marginBottom: 4 }} />
            <Skeleton width="25%" height={9} />
          </div>
        </div>
      ))}
    </div>
  );
}
