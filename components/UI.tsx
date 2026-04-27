"use client";

// ═══════════════════════════════════════
// SKELETON LOADER — hübscher als Spinner
// ═══════════════════════════════════════

type SkeletonProps = {
  height?: number | string;
  width?: number | string;
  radius?: number;
  style?: React.CSSProperties;
};

export function Skeleton({ height = 16, width = "100%", radius = 8, style }: SkeletonProps) {
  return (
    <div style={{
      height, width, borderRadius: radius,
      background: "linear-gradient(90deg, var(--bg-elevated) 0%, var(--surface-hover) 50%, var(--bg-elevated) 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.8s ease-in-out infinite",
      ...style,
    }} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton height={18} width="40%" style={{ marginBottom: 14 }} />
      <Skeleton height={14} width="80%" style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="60%" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="card">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 0",
          borderBottom: i < count - 1 ? "1px solid var(--border)" : "none",
        }}>
          <Skeleton width={40} height={40} radius={10} />
          <div style={{ flex: 1 }}>
            <Skeleton height={14} width="60%" style={{ marginBottom: 6 }} />
            <Skeleton height={11} width="35%" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// EMPTY STATE — einheitliches Design
// ═══════════════════════════════════════

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: string };
  secondaryAction?: { label: string; onClick: () => void };
  size?: "sm" | "md" | "lg";
};

export function EmptyState({ icon = "📭", title, description, action, secondaryAction, size = "md" }: EmptyStateProps) {
  const padding = size === "sm" ? 24 : size === "lg" ? 56 : 40;
  const iconSize = size === "sm" ? 36 : size === "lg" ? 64 : 48;

  return (
    <div className="card" style={{
      textAlign: "center",
      padding,
      animation: "fadeUp 0.45s cubic-bezier(.34,1.56,.64,1)",
    }}>
      <div style={{
        fontSize: iconSize,
        marginBottom: 14,
        animation: "bob 3s ease-in-out infinite",
        display: "inline-block",
      }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: size === "lg" ? 18 : 15, marginBottom: description ? 6 : 16 }}>
        {title}
      </div>
      {description && (
        <div style={{
          fontSize: 13, color: "var(--text-muted)",
          marginBottom: 20, lineHeight: 1.5,
          maxWidth: 340, margin: "0 auto 20px",
        }}>{description}</div>
      )}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}
          style={{ padding: "12px 24px" }}>
          {action.icon && <span>{action.icon}</span>}
          {action.label}
        </button>
      )}
      {secondaryAction && (
        <button className="btn btn-ghost" onClick={secondaryAction.onClick}
          style={{ marginTop: 10, display: "block", margin: "10px auto 0" }}>
          {secondaryAction.label}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// PROGRESS RING — animierter Kreis
// ═══════════════════════════════════════

export function ProgressRing({ value, max, size = 80, strokeWidth = 8, color = "var(--accent)", label }: {
  value: number; max: number; size?: number; strokeWidth?: number; color?: string; label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, value / max);
  const offset = circumference * (1 - progress);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontWeight: 800,
      }}>
        <div style={{ fontSize: size * 0.28, color, letterSpacing: -1, lineHeight: 1 }}>
          {Math.round(progress * 100)}
          <span style={{ fontSize: size * 0.15, color: "var(--text-muted)" }}>%</span>
        </div>
        {label && <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 1, fontFamily: "var(--font-body)", fontStyle: "normal", fontWeight: 800, textTransform: "uppercase", marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
}
