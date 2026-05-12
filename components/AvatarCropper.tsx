"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type Props = {
  file: File;
  onCancel: () => void;
  onConfirm: (cropped: Blob) => void;
  outputSize?: number; // Square output px, default 512
};

const PREVIEW_W = 360;
const PREVIEW_H = 360;
const MIN_CROP = 80;

export default function AvatarCropper({ file, onCancel, onConfirm, outputSize = 512 }: Props) {
  const { lang } = useLanguage();
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState({ x: 30, y: 30, size: 240 });
  const [drag, setDrag] = useState<"move" | "resize" | null>(null);
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, x: 0, y: 0, size: 0 });
  const [busy, setBusy] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // File einlesen + Image-Element laden
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      // Initial-Crop quadratisch zentriert + so groß wie möglich
      const maxSize = Math.min(PREVIEW_W, PREVIEW_H) - 40;
      const startSize = Math.min(maxSize, 280);
      setCrop({
        x: (PREVIEW_W - startSize) / 2,
        y: (PREVIEW_H - startSize) / 2,
        size: startSize,
      });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Pointer-Move
  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const dx = e.clientX - dragStart.mx;
    const dy = e.clientY - dragStart.my;
    if (drag === "move") {
      setCrop((c) => ({
        ...c,
        x: Math.max(0, Math.min(PREVIEW_W - c.size, dragStart.x + dx)),
        y: Math.max(0, Math.min(PREVIEW_H - c.size, dragStart.y + dy)),
      }));
    } else if (drag === "resize") {
      const delta = Math.max(dx, dy);
      const newSize = Math.max(MIN_CROP, Math.min(
        Math.min(PREVIEW_W - dragStart.x, PREVIEW_H - dragStart.y),
        dragStart.size + delta
      ));
      setCrop((c) => ({ ...c, size: newSize }));
    }
  }

  function onPointerUp() { setDrag(null); }

  function startMove(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDrag("move");
    setDragStart({ mx: e.clientX, my: e.clientY, x: crop.x, y: crop.y, size: crop.size });
  }

  function startResize(e: React.PointerEvent) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDrag("resize");
    setDragStart({ mx: e.clientX, my: e.clientY, x: crop.x, y: crop.y, size: crop.size });
  }

  // Bild-Skalierung Preview ↔ Original
  function calcScale() {
    if (!imgEl) return { scale: 1, displayW: PREVIEW_W, displayH: PREVIEW_H, offsetX: 0, offsetY: 0 };
    const ratio = imgEl.width / imgEl.height;
    let displayW = PREVIEW_W, displayH = PREVIEW_H;
    if (ratio > PREVIEW_W / PREVIEW_H) {
      displayH = PREVIEW_W / ratio;
    } else {
      displayW = PREVIEW_H * ratio;
    }
    const offsetX = (PREVIEW_W - displayW) / 2;
    const offsetY = (PREVIEW_H - displayH) / 2;
    return { scale: imgEl.width / displayW, displayW, displayH, offsetX, offsetY };
  }
  const { scale, displayW, displayH, offsetX, offsetY } = calcScale();

  async function handleConfirm() {
    if (!imgEl) return;
    setBusy(true);
    try {
      // Source-Region im Original berechnen
      const srcX = Math.max(0, (crop.x - offsetX) * scale);
      const srcY = Math.max(0, (crop.y - offsetY) * scale);
      const srcSize = crop.size * scale;

      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(imgEl, srcX, srcY, srcSize, srcSize, 0, 0, outputSize, outputSize);

      canvas.toBlob((blob) => {
        if (blob) onConfirm(blob);
        else onCancel();
        setBusy(false);
      }, "image/jpeg", 0.92);
    } catch {
      setBusy(false);
      onCancel();
    }
  }

  return (
    <div
      onClick={onCancel}
      className="kalion-glass-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        padding: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card kalion-glass"
        style={{ maxWidth: 460, width: "100%", margin: 0, padding: 18 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>
            {lang === "en" ? "✂️ Crop your photo" : "✂️ Foto zuschneiden"}
          </div>
          <button onClick={onCancel} className="btn btn-ghost" style={{ padding: "4px 10px" }}>✕</button>
        </div>

        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12, lineHeight: 1.5 }}>
          {lang === "en"
            ? "Drag to move · drag corner to resize"
            : "Ziehen zum Verschieben · Ecke ziehen zum Skalieren"}
        </div>

        {/* Crop-Canvas */}
        <div
          ref={containerRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: "relative",
            width: PREVIEW_W,
            height: PREVIEW_H,
            margin: "0 auto",
            background: "#000",
            borderRadius: 12,
            overflow: "hidden",
            touchAction: "none",
            userSelect: "none",
          }}
        >
          {/* Bild */}
          {imgUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: offsetX, top: offsetY,
                width: displayW, height: displayH,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Dim-Overlay außerhalb des Crops */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            boxShadow: `0 0 0 1000px rgba(0,0,0,0.55)`,
            clipPath: `polygon(
              0 0, 100% 0, 100% 100%, 0 100%, 0 0,
              ${crop.x}px ${crop.y}px,
              ${crop.x}px ${crop.y + crop.size}px,
              ${crop.x + crop.size}px ${crop.y + crop.size}px,
              ${crop.x + crop.size}px ${crop.y}px,
              ${crop.x}px ${crop.y}px
            )`,
          }} />

          {/* Crop-Box (rund, weil Avatar) */}
          <div
            onPointerDown={startMove}
            style={{
              position: "absolute",
              left: crop.x, top: crop.y,
              width: crop.size, height: crop.size,
              borderRadius: "50%",
              border: "2px solid var(--accent)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.4) inset",
              cursor: drag === "move" ? "grabbing" : "grab",
              touchAction: "none",
            }}
          >
            {/* Resize-Handle (rechts unten) */}
            <div
              onPointerDown={startResize}
              style={{
                position: "absolute",
                right: -8, bottom: -8,
                width: 22, height: 22,
                background: "var(--accent)",
                border: "2px solid var(--bg)",
                borderRadius: "50%",
                cursor: "nwse-resize",
                touchAction: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: "#0a0a10", fontWeight: 900,
              }}
            >↘</div>
          </div>
        </div>

        {/* Mini-Vorschau */}
        <div style={{ display: "flex", justifyContent: "center", margin: "14px 0 8px" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1.5, fontWeight: 800, textTransform: "uppercase" }}>
            {lang === "en" ? "Preview" : "Vorschau"}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 14 }}>
          {[40, 56, 80].map((s) => (
            <div key={s} style={{
              width: s, height: s, borderRadius: "50%", overflow: "hidden",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              position: "relative",
            }}>
              {imgEl && imgUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgUrl}
                  alt=""
                  draggable={false}
                  style={{
                    position: "absolute",
                    left: -((crop.x - offsetX) / crop.size) * s - (offsetX / crop.size) * s,
                    top: -((crop.y - offsetY) / crop.size) * s - (offsetY / crop.size) * s,
                    width: (displayW / crop.size) * s,
                    height: (displayH / crop.size) * s,
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button onClick={onCancel} className="btn">
            {lang === "en" ? "Cancel" : "Abbrechen"}
          </button>
          <button onClick={handleConfirm} disabled={busy || !imgEl} className="btn btn-primary">
            {busy ? <div className="spinner" /> : (lang === "en" ? "✓ Use" : "✓ Übernehmen")}
          </button>
        </div>
      </div>
    </div>
  );
}
