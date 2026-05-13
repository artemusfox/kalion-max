"use client";

// Barcode-Scanner für Food-Logging
// Strategie:
//   1. Native BarcodeDetector API (Chrome, Edge, Samsung Internet, Android-Capacitor-Webview)
//   2. Fallback: Manuelle Eingabe — funktioniert immer
// Keine externe Dependency, kein API-Key.

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type Props = {
  onDetected: (barcode: string) => void;
  onClose: () => void;
};

// TS-Type-Helper für die experimentelle API
declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const { lang } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastDetect = useRef<string>("");

  const [hasNative, setHasNative] = useState<boolean | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // Check Native Support
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "BarcodeDetector" in window;
    setHasNative(supported);
    if (!supported) setManualEntry(true);
  }, []);

  // Start camera + detect loop
  useEffect(() => {
    if (!hasNative || manualEntry) return;
    let stopped = false;

    (async () => {
      try {
        const formats = await window.BarcodeDetector.getSupportedFormats();
        const useFormats = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"]
          .filter((f) => formats.includes(f));
        detectorRef.current = new window.BarcodeDetector({ formats: useFormats });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setScanning(true);
          loop();
        }
      } catch (e: any) {
        setError(e?.message || (lang === "en" ? "Camera blocked" : "Kamera blockiert"));
        setManualEntry(true);
      }
    })();

    async function loop() {
      if (stopped || !videoRef.current || !detectorRef.current) return;
      try {
        const codes = await detectorRef.current.detect(videoRef.current);
        if (codes && codes.length > 0) {
          const raw = String(codes[0].rawValue || "").trim();
          // Dupe-Filter: gleicher Code 2× kurz hintereinander wird ignoriert
          if (raw && raw !== lastDetect.current) {
            lastDetect.current = raw;
            // Haptisches Feedback wenn verfügbar
            if (navigator.vibrate) navigator.vibrate(60);
            stopAll();
            onDetected(raw);
            return;
          }
        }
      } catch {
        /* detection-frame failed — ignore, retry next frame */
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    function stopAll() {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    return stopAll;
  }, [hasNative, manualEntry, onDetected, lang]);

  function submitManual() {
    const v = manualValue.replace(/\D/g, "").trim();
    if (v.length < 8) {
      setError(lang === "en" ? "Barcode too short (min 8 digits)" : "Barcode zu kurz (min 8 Ziffern)");
      return;
    }
    onDetected(v);
  }

  return (
    <div
      onClick={onClose}
      className="kalion-glass-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 10001,
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
            {lang === "en" ? "📷 Scan barcode" : "📷 Barcode scannen"}
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "4px 10px" }}>✕</button>
        </div>

        {!manualEntry && hasNative && (
          <>
            <div style={{
              position: "relative",
              width: "100%", aspectRatio: "4/3",
              background: "#000",
              borderRadius: 12, overflow: "hidden",
              marginBottom: 12,
            }}>
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                }}
              />
              {/* Scan-Linie / Frame */}
              <div style={{
                position: "absolute", inset: "20%",
                border: "2px solid var(--accent)",
                borderRadius: 12,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
                pointerEvents: "none",
              }} />
              {scanning && (
                <div style={{
                  position: "absolute", top: "20%", left: "20%", right: "20%",
                  height: 2, background: "var(--accent)",
                  boxShadow: "0 0 12px var(--accent-glow)",
                  animation: "scan-line 2s linear infinite",
                }} />
              )}
              <style>{`
                @keyframes scan-line {
                  0% { transform: translateY(0); }
                  50% { transform: translateY(calc(60vw * 0.4)); }
                  100% { transform: translateY(0); }
                }
              `}</style>
            </div>

            <div style={{ fontSize: 11, color: "var(--text-dim)", textAlign: "center", marginBottom: 12, lineHeight: 1.5 }}>
              {lang === "en"
                ? "Hold the barcode steady in the frame. EAN-13 (DE), UPC, QR supported."
                : "Barcode ruhig in den Rahmen halten. EAN-13 (DE), UPC, QR werden erkannt."}
            </div>

            <button
              onClick={() => setManualEntry(true)}
              className="btn btn-ghost btn-block"
              style={{ fontSize: 12 }}
            >
              ⌨ {lang === "en" ? "Enter manually" : "Manuell eingeben"}
            </button>
          </>
        )}

        {manualEntry && (
          <>
            {hasNative === false && (
              <div style={{
                fontSize: 11, color: "var(--text-dim)",
                padding: 10, marginBottom: 12,
                background: "var(--bg-elevated)", borderRadius: 10,
                lineHeight: 1.5,
              }}>
                {lang === "en"
                  ? "Camera-scan needs Chrome/Edge or Android. iOS Safari: enter manually."
                  : "Kamera-Scan braucht Chrome/Edge oder Android. iOS Safari: manuell eingeben."}
              </div>
            )}

            <label className="form-label">
              {lang === "en" ? "Barcode (EAN-13 / UPC)" : "Barcode (EAN-13 / UPC)"}
            </label>
            <input
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitManual()}
              placeholder="4337185014802"
              className="form-input"
              style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: 2 }}
            />
            {error && <div className="form-error">{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: hasNative ? "1fr 1fr" : "1fr", gap: 8, marginTop: 12 }}>
              {hasNative && (
                <button onClick={() => { setManualEntry(false); setError(null); }} className="btn">
                  ← {lang === "en" ? "Camera" : "Kamera"}
                </button>
              )}
              <button onClick={submitManual} className="btn btn-primary">
                {lang === "en" ? "Look up →" : "Nachschlagen →"}
              </button>
            </div>
          </>
        )}

        <div style={{
          fontSize: 9, color: "var(--text-muted)", textAlign: "center",
          marginTop: 12, lineHeight: 1.5,
        }}>
          {lang === "en"
            ? "Powered by Open Food Facts · open database · 3M+ products"
            : "Daten von Open Food Facts · offene Datenbank · 3 Mio+ Produkte"}
        </div>
      </div>
    </div>
  );
}
