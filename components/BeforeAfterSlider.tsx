"use client";

import { useRef, useState } from "react";

type Photo = {
  id: string;
  taken_at: string;
  signed_url?: string | null;
};

export default function BeforeAfterSlider({ photos }: { photos: Photo[] }) {
  const usable = photos.filter((p) => p.signed_url);
  const [beforeId, setBeforeId] = useState<string | null>(usable[usable.length - 1]?.id ?? null);
  const [afterId,  setAfterId]  = useState<string | null>(usable[0]?.id ?? null);
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const before = usable.find((p) => p.id === beforeId);
  const after  = usable.find((p) => p.id === afterId);

  function moveTo(clientX: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, x)));
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    moveTo(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    moveTo(e.clientX);
  }
  function onPointerUp() { dragging.current = false; }

  if (usable.length < 2) {
    return (
      <div style={{
        padding: 24, textAlign: "center", background: "var(--bg-elevated)",
        borderRadius: 12, border: "1px dashed var(--border)", color: "var(--text-muted)",
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📸📸</div>
        <div style={{ fontSize: 13 }}>Lade mindestens 2 Fotos hoch, um sie zu vergleichen.</div>
      </div>
    );
  }

  function fmt(d?: string) {
    return d ? new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" }) : "";
  }

  const photoOption = (p: Photo) => (
    <option key={p.id} value={p.id}>{fmt(p.taken_at)}</option>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
            Vorher
          </div>
          <select
            value={beforeId ?? ""}
            onChange={(e) => setBeforeId(e.target.value)}
            className="form-input"
            style={{ padding: "8px 10px", fontSize: 12 }}
          >
            {usable.map(photoOption)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
            Nachher
          </div>
          <select
            value={afterId ?? ""}
            onChange={(e) => setAfterId(e.target.value)}
            className="form-input"
            style={{ padding: "8px 10px", fontSize: 12 }}
          >
            {usable.map(photoOption)}
          </select>
        </div>
      </div>

      {before && after && (
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "3/4",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            cursor: "ew-resize",
            userSelect: "none",
            touchAction: "none",
          }}
        >
          {/* Vorher (volles Bild im Hintergrund) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={before.signed_url!}
            alt=""
            draggable={false}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Nachher (geclipped per width) */}
          <div style={{ position: "absolute", inset: 0, width: `${pos}%`, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={after.signed_url!}
              alt=""
              draggable={false}
              style={{
                position: "absolute", left: 0, top: 0,
                width: containerRef.current ? containerRef.current.clientWidth : "100%",
                height: "100%", objectFit: "cover",
              }}
            />
          </div>

          {/* Schieber-Linie */}
          <div style={{
            position: "absolute", top: 0, bottom: 0, left: `${pos}%`,
            width: 2, background: "var(--accent)", boxShadow: "0 0 12px var(--accent-glow)",
            transform: "translateX(-1px)", pointerEvents: "none",
          }} />
          {/* Schieber-Knopf */}
          <div style={{
            position: "absolute", top: "50%", left: `${pos}%`,
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--accent)",
            transform: "translate(-50%, -50%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#0a0a10", fontWeight: 800, fontSize: 14,
            boxShadow: "0 0 16px var(--accent-glow), 0 4px 12px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}>↔</div>

          {/* Labels */}
          <div style={{
            position: "absolute", top: 10, left: 10,
            padding: "4px 10px", borderRadius: 6,
            background: "rgba(0,0,0,0.65)", color: "white",
            fontSize: 10, fontWeight: 800, letterSpacing: 1,
          }}>VORHER · {fmt(before.taken_at)}</div>
          <div style={{
            position: "absolute", top: 10, right: 10,
            padding: "4px 10px", borderRadius: 6,
            background: "rgba(0,0,0,0.65)", color: "white",
            fontSize: 10, fontWeight: 800, letterSpacing: 1,
          }}>NACHHER · {fmt(after.taken_at)}</div>
        </div>
      )}
    </div>
  );
}
