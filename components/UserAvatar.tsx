"use client";

import { parseAvatar } from "@/lib/avatars";

type Props = {
  avatarUrl?: string | null;
  displayName?: string | null;
  size?: number;
  ring?: boolean;     // Story-style accent ring rundum
  onClick?: () => void;
};

export default function UserAvatar({
  avatarUrl, displayName, size = 36, ring = false, onClick,
}: Props) {
  const parsed = parseAvatar(avatarUrl, displayName);

  const ringPx = ring ? 2 : 0;
  const totalSize = size + ringPx * 2 + (ring ? 4 : 0);

  const inner = (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: parsed.kind === "preset"
        ? `linear-gradient(135deg, ${parsed.preset.gradient[0]}, ${parsed.preset.gradient[1]})`
        : parsed.kind === "fallback"
          ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
          : "var(--bg-elevated)",
      flexShrink: 0,
    }}>
      {parsed.kind === "preset" && (
        <span style={{ fontSize: size * 0.55, lineHeight: 1 }}>{parsed.preset.emoji}</span>
      )}
      {parsed.kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={parsed.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {parsed.kind === "fallback" && (
        <span style={{
          fontSize: size * 0.45,
          fontWeight: 900,
          color: "#0a0a10",
          fontFamily: "var(--font-body)",
        }}>{parsed.initial}</span>
      )}
    </div>
  );

  if (!ring && !onClick) return inner;

  return (
    <button
      onClick={onClick}
      type="button"
      aria-label="Avatar"
      style={{
        width: totalSize, height: totalSize,
        borderRadius: "50%",
        background: ring
          ? `conic-gradient(from 180deg, var(--accent), var(--accent-2), var(--accent))`
          : "transparent",
        padding: ring ? ringPx + 2 : 0,
        border: "none",
        cursor: onClick ? "pointer" : "default",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div style={{
        width: size + ringPx * 2, height: size + ringPx * 2,
        borderRadius: "50%",
        background: "var(--bg)",
        padding: ringPx,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {inner}
      </div>
    </button>
  );
}
